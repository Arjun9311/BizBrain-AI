import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { AIService } from '../services/ai.service';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'bizbrain_jwt_secret_key_12345!';

// ==========================================
// 1. AUTHENTICATION MODULE (/api/auth)
// ==========================================

// Register
router.post('/auth/register', async (req, res) => {
  const { email, password, name, businessName } = req.body;
  if (!email || !password || !name || !businessName) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create Business first
    const business = await prisma.business.create({
      data: {
        name: businessName,
        gstNumber: '29GSTPENDING001',
        address: 'HQ Address',
      },
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'Super Admin',
        businessId: business.id,
      },
    });

    // Seed basic settings
    await prisma.settings.createMany({
      data: [
        { key: 'currency', value: 'USD', businessId: business.id },
        { key: 'gstEnabled', value: 'true', businessId: business.id },
        { key: 'darkMode', value: 'true', businessId: business.id },
      ],
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, businessId: business.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      business,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, businessId: user.businessId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      business: user.business,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Google Login Mock (for Hackathon Demo)
router.post('/auth/google', async (req, res) => {
  const { email, name, googleToken } = req.body;
  if (!email || !name) {
    return res.status(400).json({ message: 'Email and name are required' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
    });

    if (!user) {
      // Create a default business for Google signup
      const business = await prisma.business.create({
        data: {
          name: `${name}'s Enterprise`,
          gstNumber: '29GSTPENDING001',
        },
      });

      const randomPassword = await bcrypt.hash(uuidv4(), 10);
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: randomPassword,
          role: 'Super Admin',
          businessId: business.id,
        },
        include: { business: true },
      });

      await prisma.settings.createMany({
        data: [
          { key: 'currency', value: 'USD', businessId: business.id },
          { key: 'gstEnabled', value: 'true', businessId: business.id },
          { key: 'darkMode', value: 'true', businessId: business.id },
        ],
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, businessId: user.businessId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      business: user.business,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Get profile
router.get('/auth/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, email: true, name: true, role: true, businessId: true, business: true },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});


// ==========================================
// 2. DASHBOARD MODULE (/api/dashboard)
// ==========================================
router.get('/dashboard', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;

  try {
    // Collect financial sums
    const totalInvoices = await prisma.invoice.findMany({ where: { businessId } });
    const totalExpenses = await prisma.expense.findMany({ where: { businessId, status: 'PAID' } });
    const orders = await prisma.order.findMany({
      where: { businessId },
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const revenue = totalInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const expenses = totalExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const profit = revenue - expenses;

    const outstandingPayments = totalInvoices
      .filter(inv => inv.status !== 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0);

    // Products alert count
    const lowStockAlerts = await prisma.product.count({
      where: {
        businessId,
        stock: { lte: prisma.product.fields.minStock },
      },
    });

    // Orders today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayOrdersCount = await prisma.order.count({
      where: {
        businessId,
        orderDate: { gte: startOfToday },
      },
    });

    // Top products
    const products = await prisma.product.findMany({
      where: { businessId },
      orderBy: { stock: 'asc' },
      take: 5,
    });

    // Recent notifications
    const notifications = await prisma.notification.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Business Health Calculation
    let healthScore = 85; // base
    if (outstandingPayments > revenue * 0.5) healthScore -= 15;
    if (lowStockAlerts > 0) healthScore -= 5;
    if (healthScore < 0) healthScore = 0;

    return res.json({
      revenue,
      expenses,
      profit,
      outstandingPayments,
      lowStockAlerts,
      todayOrdersCount,
      healthScore,
      recentOrders: orders,
      lowStockProducts: products,
      notifications,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});


// ==========================================
// 3. CUSTOMER CRM MODULE (/api/customers)
// ==========================================
router.get('/customers', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  try {
    const customers = await prisma.customer.findMany({
      where: { businessId },
      include: { orders: true },
      orderBy: { loyaltyScore: 'desc' },
    });
    return res.json(customers);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/customers', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  const { name, email, phone, address, segment, loyaltyScore } = req.body;

  try {
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        segment: segment || 'General',
        loyaltyScore: loyaltyScore || 0,
        businessId,
      },
    });
    return res.status(201).json(customer);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/customers/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { orders: { include: { items: { include: { product: true } } } }, invoices: true },
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    return res.json(customer);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.put('/customers/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { name, email, phone, address, segment, loyaltyScore, outstandingAmount } = req.body;
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, email, phone, address, segment, loyaltyScore, outstandingAmount },
    });
    return res.json(customer);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete('/customers/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});


// ==========================================
// 4. PRODUCTS & INVENTORY MODULES (/api/products & /api/inventory)
// ==========================================
router.get('/products', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  try {
    const products = await prisma.product.findMany({
      where: { businessId },
      include: { category: true, supplier: true },
      orderBy: { name: 'asc' },
    });
    return res.json(products);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/products', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  const { name, sku, barcode, description, price, cost, stock, minStock, categoryId, warehouse, supplierId } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        sku,
        barcode,
        description,
        price: parseFloat(price),
        cost: parseFloat(cost),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 5,
        categoryId,
        warehouse: warehouse || 'Main Warehouse',
        supplierId,
        businessId,
      },
    });

    // Create default stock movement
    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        quantity: product.stock,
        type: 'IN',
        reason: 'Initial Restock',
        warehouse: product.warehouse,
        businessId,
      },
    });

    return res.status(201).json(product);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.put('/products/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { name, sku, barcode, description, price, cost, stock, minStock, categoryId, warehouse, supplierId } = req.body;
  const businessId = req.user?.businessId!;
  try {
    const original = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!original) return res.status(404).json({ message: 'Product not found' });

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        sku,
        barcode,
        description,
        price: parseFloat(price),
        cost: parseFloat(cost),
        stock: parseInt(stock),
        minStock: parseInt(minStock),
        categoryId,
        warehouse,
        supplierId,
      },
    });

    // Log stock changes
    const difference = updated.stock - original.stock;
    if (difference !== 0) {
      await prisma.inventoryMovement.create({
        data: {
          productId: updated.id,
          quantity: Math.abs(difference),
          type: difference > 0 ? 'IN' : 'OUT',
          reason: 'Manual Adjustment',
          warehouse: updated.warehouse,
          businessId,
        },
      });
    }

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete('/products/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Inventory stock movements
router.get('/inventory/movement', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  try {
    const movements = await prisma.inventoryMovement.findMany({
      where: { businessId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(movements);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Reorder predictor / Inventory forecasting
router.get('/inventory/forecasting', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  try {
    const lowStock = await prisma.product.findMany({
      where: {
        businessId,
        stock: { lte: prisma.product.fields.minStock },
      },
      include: { supplier: true },
    });

    const recommendations = lowStock.map(prod => {
      const quantityToOrder = Math.max(prod.minStock * 3 - prod.stock, 10);
      return {
        id: prod.id,
        name: prod.name,
        sku: prod.sku,
        currentStock: prod.stock,
        minStock: prod.minStock,
        supplier: prod.supplier?.name || 'Logitech Global',
        daysUntilOut: prod.stock === 0 ? 0 : Math.round(prod.stock * 1.5),
        recommendedOrder: quantityToOrder,
        priority: prod.stock === 0 ? 'CRITICAL' : 'HIGH',
      };
    });

    return res.json(recommendations);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});


// ==========================================
// 5. SALES & ORDERS MODULES (/api/orders)
// ==========================================
router.get('/orders', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  try {
    const orders = await prisma.order.findMany({
      where: { businessId },
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/orders', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  const { customerId, type, items, notes } = req.body; // items: [{ productId, quantity, price }]

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order must contain items' });
  }

  try {
    let calculatedTotal = 0;
    const itemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
      }

      calculatedTotal += item.price * item.quantity;
      itemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    const orderNumber = `ORD-2026-${Date.now().toString().slice(-4)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        type: type || 'OFFLINE',
        total: calculatedTotal,
        notes,
        status: 'COMPLETED', // immediate complete in demo
        businessId,
        items: {
          create: itemsData,
        },
      },
      include: { items: true },
    });

    // Deduct stocks and log movements
    for (const item of items) {
      const product = await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      await prisma.inventoryMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: 'OUT',
          reason: 'Sale Order',
          warehouse: product.warehouse,
          businessId,
        },
      });

      // Low stock notifier
      if (product.stock <= product.minStock) {
        await prisma.notification.create({
          data: {
            title: 'Low Stock Alert Triggered',
            message: `Stock level of ${product.name} is now ${product.stock} (Minimum: ${product.minStock}).`,
            type: 'LOW_STOCK',
            businessId,
          },
        });
      }
    }

    // Update Customer loyalty and receivables
    if (customerId) {
      const loyaltyPoints = Math.floor(calculatedTotal / 10);
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          loyaltyScore: { increment: loyaltyPoints },
          outstandingAmount: { increment: calculatedTotal },
        },
      });
    }

    // Auto generate Invoice
    const invoiceNumber = `INV-2026-${Date.now().toString().slice(-4)}`;
    const taxAmount = calculatedTotal * 0.18; // 18% standard GST
    await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        customerId,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days due
        subtotal: calculatedTotal,
        taxRate: 18.0,
        taxAmount,
        total: calculatedTotal + taxAmount,
        status: 'UNPAID',
        businessId,
      },
    });

    return res.status(201).json(order);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});


// ==========================================
// 6. FINANCE & BILLING MODULES (/api/finance)
// ==========================================
router.get('/finance/expenses', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  try {
    const expenses = await prisma.expense.findMany({
      where: { businessId },
      orderBy: { date: 'desc' },
    });
    return res.json(expenses);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/finance/expenses', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  const { title, amount, category, date, referenceNo, status } = req.body;

  try {
    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        category,
        date: date ? new Date(date) : new Date(),
        referenceNo,
        status: status || 'PAID',
        businessId,
      },
    });
    return res.status(201).json(expense);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/finance/invoices', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  try {
    const invoices = await prisma.invoice.findMany({
      where: { businessId },
      include: { customer: true, order: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(invoices);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Send payment reminder email (Mockup)
router.post('/finance/invoices/:id/send-reminder', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { customer: true },
    });

    if (!invoice || !invoice.customer) {
      return res.status(404).json({ message: 'Invoice or customer profile not found' });
    }

    // Log a notification about payment reminder
    await prisma.notification.create({
      data: {
        title: 'Payment Reminder Sent',
        message: `Overdue invoice reminder sent successfully to ${invoice.customer.name} (${invoice.customer.email}) for invoice ${invoice.invoiceNumber}.`,
        type: 'GENERAL',
        businessId: req.user?.businessId!,
      },
    });

    return res.json({
      message: `Reminder sent successfully to ${invoice.customer.name} (${invoice.customer.email}) for $${invoice.total.toFixed(2)}.`,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});


// ==========================================
// 7. EMPLOYEES MANAGEMENT MODULE (/api/employees)
// ==========================================
router.get('/employees', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  try {
    const employees = await prisma.employee.findMany({
      where: { businessId },
      include: { department: true, attendance: true, leaves: true },
      orderBy: { firstName: 'asc' },
    });
    const departments = await prisma.department.findMany({ where: { businessId } });
    return res.json({ employees, departments });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/employees', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  const { firstName, lastName, email, phone, role, departmentId, salary } = req.body;

  try {
    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        role,
        departmentId,
        salary: parseFloat(salary),
        businessId,
      },
    });
    return res.status(201).json(employee);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Log Employee Attendance
router.post('/employees/:id/attendance', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  const { status, checkIn, checkOut, date } = req.body;

  try {
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: req.params.id,
        date: date ? new Date(date) : new Date(),
        status: status || 'PRESENT',
        checkIn,
        checkOut,
        businessId,
      },
    });
    return res.status(201).json(attendance);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});


// ==========================================
// 8. ANALYTICS MODULE (/api/analytics)
// ==========================================
router.get('/analytics', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  try {
    // Generate beautiful Recharts data payloads
    const invoices = await prisma.invoice.findMany({ where: { businessId } });
    const expenses = await prisma.expense.findMany({ where: { businessId, status: 'PAID' } });

    // Monthly aggregation
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySales = months.map((month, idx) => {
      const monthInvoices = invoices.filter(inv => new Date(inv.issueDate).getMonth() === idx);
      const monthExpenses = expenses.filter(exp => new Date(exp.date).getMonth() === idx);

      const salesSum = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const expenseSum = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      return {
        name: month,
        Sales: parseFloat(salesSum.toFixed(2)),
        Expenses: parseFloat(expenseSum.toFixed(2)),
        Profit: parseFloat((salesSum - expenseSum).toFixed(2)),
      };
    });

    // Customer growth mapping (mock values leading to current date)
    const customerGrowth = [
      { name: 'Jan', active: 1 },
      { name: 'Feb', active: 1 },
      { name: 'Mar', active: 2 },
      { name: 'Apr', active: 2 },
      { name: 'May', active: 3 },
      { name: 'Jun', active: 4 },
      { name: 'Jul', active: 4 },
    ];

    // Category splits
    const productStats = await prisma.product.findMany({
      where: { businessId },
      include: { category: true },
    });

    const categorySummary: { [key: string]: number } = {};
    productStats.forEach(p => {
      const name = p.category?.name || 'Others';
      categorySummary[name] = (categorySummary[name] || 0) + p.stock;
    });

    const categoryData = Object.keys(categorySummary).map(catName => ({
      name: catName,
      value: categorySummary[catName],
    }));

    return res.json({
      monthlySales,
      customerGrowth,
      categoryDistribution: categoryData,
      forecast: [
        { name: 'Jul (Act)', sales: 1200 },
        { name: 'Aug (Pred)', sales: 1450, error: [1300, 1600] },
        { name: 'Sep (Pred)', sales: 1600, error: [1400, 1800] },
        { name: 'Oct (Pred)', sales: 1850, error: [1600, 2100] },
      ],
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});


// ==========================================
// 9. REPORTS MODULE (/api/reports)
// ==========================================
router.get('/reports/:type', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  const type = req.params.type; // sales, inventory, finance

  try {
    let reportData = {};
    if (type === 'sales') {
      const items = await prisma.order.findMany({
        where: { businessId },
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      });
      reportData = items.map(o => ({
        id: o.id,
        number: o.orderNumber,
        client: o.customer?.name || 'Walk-in',
        total: o.total,
        date: o.orderDate,
        status: o.status,
      }));
    } else if (type === 'inventory') {
      const items = await prisma.product.findMany({
        where: { businessId },
        include: { category: true },
      });
      reportData = items.map(p => ({
        sku: p.sku,
        name: p.name,
        category: p.category?.name || 'N/A',
        stock: p.stock,
        costValue: p.stock * p.cost,
        priceValue: p.stock * p.price,
      }));
    } else {
      // finance default
      const inc = await prisma.invoice.findMany({ where: { businessId } });
      const exp = await prisma.expense.findMany({ where: { businessId } });
      reportData = {
        totalRevenue: inc.reduce((sum, i) => sum + i.total, 0),
        totalExpenses: exp.reduce((sum, e) => sum + e.amount, 0),
        invoicesCount: inc.length,
        expensesCount: exp.length,
      };
    }

    return res.json({
      type,
      timestamp: new Date(),
      data: reportData,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});


// ==========================================
// 10. SETTINGS MODULE (/api/settings)
// ==========================================
router.get('/settings', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  try {
    const settings = await prisma.settings.findMany({ where: { businessId } });
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    return res.json({ settings, business });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/settings', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  const { businessName, gstNumber, address, logo, settingsArray } = req.body; // settingsArray: [{ key, value }]

  try {
    const business = await prisma.business.update({
      where: { id: businessId },
      data: { name: businessName, gstNumber, address, logo },
    });

    if (settingsArray && Array.isArray(settingsArray)) {
      for (const item of settingsArray) {
        await prisma.settings.upsert({
          where: { businessId_key: { businessId, key: item.key } },
          update: { value: item.value },
          create: { businessId, key: item.key, value: item.value },
        });
      }
    }

    return res.json({ message: 'Settings saved successfully', business });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});


// ==========================================
// 11. AI COPILOT SERVICE (/api/ai)
// ==========================================

// Chat copilot
router.post('/ai/copilot', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  const { prompt, history } = req.body; // prompt: string, history: Array of { role, message }

  try {
    // Generate context string from our current database state
    const productsCount = await prisma.product.count({ where: { businessId } });
    const alertsCount = await prisma.product.count({
      where: { businessId, stock: { lte: prisma.product.fields.minStock } }
    });
    const customerCount = await prisma.customer.count({ where: { businessId } });
    const invoices = await prisma.invoice.findMany({ where: { businessId } });
    const revenueSum = invoices.reduce((sum, inv) => sum + inv.total, 0);

    const contextSummary = `The business name is "BizBrain HQ". Currently:
- Products cataloged: ${productsCount}
- Products below warning min limit: ${alertsCount}
- Active clients: ${customerCount}
- Total invoiced revenue: $${revenueSum.toFixed(2)}
- System context settings: Currency USD. Tax standard 18.0% GST.`;

    // Fetch response
    const answer = await AIService.generateText(prompt, contextSummary);

    // Save chat logging
    await prisma.chatHistory.createMany({
      data: [
        { userId: req.user?.id!, role: 'user', message: prompt, conversationId: 'default', businessId },
        { userId: req.user?.id!, role: 'model', message: answer, conversationId: 'default', businessId }
      ]
    });

    return res.json({ response: answer });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Generator for PDF, invoices, landing pages
router.post('/ai/generator', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { docType, prompt } = req.body; // docType: email, invoice, report, landing, swot
  const userPrompt = prompt || `Generate a ${docType}`;

  try {
    const context = `Task: Generate production ready text/structure for type: ${docType}`;
    const outputText = await AIService.generateText(userPrompt, context);
    
    return res.json({
      type: docType,
      content: outputText,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// Global Search Endpoint
router.get('/search', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const businessId = req.user?.businessId!;
  const query = (req.query.q as string || '').toLowerCase();

  try {
    if (!query) {
      return res.json({ customers: [], products: [], invoices: [], orders: [] });
    }

    const customers = await prisma.customer.findMany({
      where: {
        businessId,
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ]
      },
      take: 5
    });

    const products = await prisma.product.findMany({
      where: {
        businessId,
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
        ]
      },
      take: 5
    });

    const invoices = await prisma.invoice.findMany({
      where: {
        businessId,
        invoiceNumber: { contains: query }
      },
      take: 5
    });

    const orders = await prisma.order.findMany({
      where: {
        businessId,
        orderNumber: { contains: query }
      },
      take: 5
    });

    return res.json({ customers, products, invoices, orders });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
