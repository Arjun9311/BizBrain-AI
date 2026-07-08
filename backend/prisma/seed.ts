import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with BizBrain sample data...');

  // Clear existing database records to make the seed script idempotent
  await prisma.aIRequest.deleteMany({});
  await prisma.chatHistory.deleteMany({});
  await prisma.settings.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.leave.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.inventoryMovement.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.business.deleteMany({});

  // 1. Create Business
  const business = await prisma.business.create({
    data: {
      name: 'BizBrain HQ',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      gstNumber: '29AAAAA1111A1Z1',
      address: '100 Innovation Way, Silicon Valley, CA 94025',
      phone: '+1 (555) 019-2834',
      email: 'contact@bizbrain.ai',
    },
  });

  // 2. Create Users (with hashed password: 'password123')
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@bizbrain.ai',
      name: 'Sarah Connor',
      password: hashedPassword,
      role: 'Super Admin',
      businessId: business.id,
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: 'finance@bizbrain.ai',
      name: 'John Doe',
      password: hashedPassword,
      role: 'Accountant',
      businessId: business.id,
    },
  });

  // 3. Create Categories
  const catElectronics = await prisma.category.create({
    data: { name: 'Electronics', businessId: business.id },
  });
  const catFurniture = await prisma.category.create({
    data: { name: 'Office Furniture', businessId: business.id },
  });
  const catAccessories = await prisma.category.create({
    data: { name: 'Accessories', businessId: business.id },
  });

  // 4. Create Suppliers
  const supplierIntel = await prisma.supplier.create({
    data: {
      name: 'Intel Corp Supply',
      contactPerson: 'Robert Noyce',
      email: 'robert@intel.com',
      phone: '+1 (408) 555-0100',
      address: '2200 Mission College Blvd, Santa Clara, CA',
      businessId: business.id,
    },
  });

  const supplierLogitech = await prisma.supplier.create({
    data: {
      name: 'Logitech Global',
      contactPerson: 'Bracken Darrell',
      email: 'bracken@logitech.com',
      phone: '+1 (510) 795-8500',
      address: '7700 Gateway Blvd, Newark, CA',
      businessId: business.id,
    },
  });

  // 5. Create Products
  const prodLaptop = await prisma.product.create({
    data: {
      name: 'BizPro Laptop 16"',
      sku: 'PRO-LAP-16',
      barcode: '9783161484100',
      description: 'High performance laptop with M3 chipset equivalent power, 32GB RAM, 1TB SSD.',
      image: 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=500',
      price: 1499.99,
      cost: 950.00,
      stock: 4, // Low stock (Min stock is 5) - trigger alert
      minStock: 5,
      categoryId: catElectronics.id,
      warehouse: 'Main Warehouse',
      supplierId: supplierIntel.id,
      businessId: business.id,
    },
  });

  const prodDesk = await prisma.product.create({
    data: {
      name: 'Ergonomic Standing Desk',
      sku: 'OFF-DSK-ERG',
      barcode: '9783161484209',
      description: 'Dual motor electronic height adjustable desk with bamboo tabletop.',
      image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500',
      price: 599.99,
      cost: 320.00,
      stock: 12,
      minStock: 3,
      categoryId: catFurniture.id,
      warehouse: 'West Wing Depot',
      businessId: business.id,
    },
  });

  const prodMouse = await prisma.product.create({
    data: {
      name: 'MX Master 3S Mouse',
      sku: 'ACC-MOU-MX3',
      barcode: '9783161484308',
      description: 'Advanced wireless productivity mouse with silent clicks and 8K DPI sensor.',
      image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
      price: 99.99,
      cost: 45.00,
      stock: 2, // Low stock (Min stock is 8)
      minStock: 8,
      categoryId: catAccessories.id,
      warehouse: 'Main Warehouse',
      supplierId: supplierLogitech.id,
      businessId: business.id,
    },
  });

  const prodKeyboard = await prisma.product.create({
    data: {
      name: 'MX Mechanical Keyboard',
      sku: 'ACC-KBD-MECH',
      barcode: '9783161484407',
      description: 'Tactile quiet mechanical keyboard with backlighting and multi-device connection.',
      image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500',
      price: 169.99,
      cost: 85.00,
      stock: 25,
      minStock: 6,
      categoryId: catAccessories.id,
      warehouse: 'Main Warehouse',
      supplierId: supplierLogitech.id,
      businessId: business.id,
    },
  });

  // 6. Create Customers
  const custStark = await prisma.customer.create({
    data: {
      name: 'Stark Industries',
      email: 'billing@stark.com',
      phone: '+1 (212) 555-4382',
      address: 'Stark Tower, 890 5th Ave, Manhattan, NY',
      segment: 'High Value',
      loyaltyScore: 95,
      outstandingAmount: 2999.98,
      businessId: business.id,
    },
  });

  const custWayne = await prisma.customer.create({
    data: {
      name: 'Wayne Enterprises',
      email: 'procurement@wayne.com',
      phone: '+1 (312) 555-8921',
      address: '1007 Mountain Drive, Gotham City, NJ',
      segment: 'Loyal',
      loyaltyScore: 88,
      outstandingAmount: 0.0,
      businessId: business.id,
    },
  });

  const custAcme = await prisma.customer.create({
    data: {
      name: 'Acme Corporation',
      email: 'coyote@acme.org',
      phone: '+1 (800) 555-0150',
      address: '1 Desert Road, Arizona Outpost',
      segment: 'At Risk', // Hasn't ordered in a while
      loyaltyScore: 40,
      outstandingAmount: 769.98,
      businessId: business.id,
    },
  });

  const custIndividual = await prisma.customer.create({
    data: {
      name: 'Peter Parker',
      email: 'peter@dailybugle.com',
      phone: '+1 (718) 555-1234',
      address: '20 Ingram St, Forest Hills, Queens, NY',
      segment: 'General',
      loyaltyScore: 15,
      outstandingAmount: 99.99,
      businessId: business.id,
    },
  });

  // 7. Create Orders, OrderItems, Invoices, Payments
  // Order 1: Stark (COMPLETED + PAID)
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-001',
      customerId: custStark.id,
      status: 'COMPLETED',
      type: 'OFFLINE',
      total: 3599.96,
      notes: 'Corporate office setup equipment.',
      trackingCode: 'TRK-STARK-771',
      businessId: business.id,
      orderDate: new Date('2026-05-15T10:00:00Z'),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order1.id, productId: prodLaptop.id, quantity: 2, price: 1499.99 },
      { orderId: order1.id, productId: prodDesk.id, quantity: 1, price: 599.99 },
    ],
  });

  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-001',
      orderId: order1.id,
      customerId: custStark.id,
      issueDate: new Date('2026-05-15T11:00:00Z'),
      dueDate: new Date('2026-06-15T11:00:00Z'),
      subtotal: 3599.96,
      taxRate: 18.0,
      taxAmount: 647.99,
      discount: 100.0,
      total: 4147.95,
      status: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      businessId: business.id,
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      amount: 4147.95,
      method: 'BANK_TRANSFER',
      referenceNo: 'TXN-WIRE-99281',
      businessId: business.id,
      paymentDate: new Date('2026-05-18T14:30:00Z'),
    },
  });

  // Order 2: Wayne (COMPLETED + PAID)
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-002',
      customerId: custWayne.id,
      status: 'COMPLETED',
      type: 'ONLINE',
      total: 1079.97,
      trackingCode: 'TRK-FEDEX-1002',
      businessId: business.id,
      orderDate: new Date('2026-06-10T12:00:00Z'),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order2.id, productId: prodDesk.id, quantity: 1, price: 599.99 },
      { orderId: order2.id, productId: prodKeyboard.id, quantity: 2, price: 169.99 },
      { orderId: order2.id, productId: prodMouse.id, quantity: 1, price: 99.99 },
      { orderId: order2.id, productId: prodMouse.id, quantity: 1, price: 39.99 }, // placeholder price
    ],
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-002',
      orderId: order2.id,
      customerId: custWayne.id,
      issueDate: new Date('2026-06-10T12:30:00Z'),
      dueDate: new Date('2026-07-10T12:30:00Z'),
      subtotal: 1079.97,
      taxRate: 18.0,
      taxAmount: 194.39,
      total: 1274.36,
      status: 'PAID',
      paymentMethod: 'CARD',
      businessId: business.id,
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice2.id,
      amount: 1274.36,
      method: 'CARD',
      referenceNo: 'TXN-STRIPE-44210',
      businessId: business.id,
      paymentDate: new Date('2026-06-10T12:31:00Z'),
    },
  });

  // Order 3: Stark (PENDING + UNPAID Outstanding)
  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-003',
      customerId: custStark.id,
      status: 'PENDING',
      type: 'OFFLINE',
      total: 2999.98,
      notes: 'Awaiting delivery of laptops.',
      businessId: business.id,
      orderDate: new Date('2026-06-25T09:00:00Z'),
    },
  });

  await prisma.orderItem.create({
    data: { orderId: order3.id, productId: prodLaptop.id, quantity: 2, price: 1499.99 },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-003',
      orderId: order3.id,
      customerId: custStark.id,
      issueDate: new Date('2026-06-25T09:30:00Z'),
      dueDate: new Date('2026-07-25T09:30:00Z'), // Due in future
      subtotal: 2999.98,
      taxRate: 18.0,
      taxAmount: 539.99,
      total: 3539.97,
      status: 'UNPAID',
      businessId: business.id,
    },
  });

  // Order 4: Acme (COMPLETED + OVERDUE)
  const order4 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-004',
      customerId: custAcme.id,
      status: 'COMPLETED',
      type: 'ONLINE',
      total: 769.98,
      businessId: business.id,
      orderDate: new Date('2026-05-01T15:00:00Z'),
    },
  });

  await prisma.orderItem.createMany({
    data: [
      { orderId: order4.id, productId: prodDesk.id, quantity: 1, price: 599.99 },
      { orderId: order4.id, productId: prodKeyboard.id, quantity: 1, price: 169.99 },
    ],
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-004',
      orderId: order4.id,
      customerId: custAcme.id,
      issueDate: new Date('2026-05-01T15:30:00Z'),
      dueDate: new Date('2026-06-01T15:30:00Z'), // Overdue!
      subtotal: 769.98,
      taxRate: 18.0,
      taxAmount: 138.60,
      total: 908.58,
      status: 'OVERDUE',
      businessId: business.id,
    },
  });

  // 8. Create Expenses (across last few months)
  const expenses = [
    { title: 'Office Space Rent', amount: 2500.0, category: 'Rent', date: new Date('2026-05-01'), status: 'PAID' },
    { title: 'Office Space Rent', amount: 2500.0, category: 'Rent', date: new Date('2026-06-01'), status: 'PAID' },
    { title: 'Cloud Infrastructure (AWS)', amount: 450.0, category: 'Utilities', date: new Date('2026-05-15'), status: 'PAID' },
    { title: 'Cloud Infrastructure (AWS)', amount: 520.0, category: 'Utilities', date: new Date('2026-06-15'), status: 'PAID' },
    { title: 'Marketing Ads (Google/FB)', amount: 1200.0, category: 'Marketing', date: new Date('2026-05-20'), status: 'PAID' },
    { title: 'Marketing Ads (Google/FB)', amount: 1500.0, category: 'Marketing', date: new Date('2026-06-20'), status: 'PAID' },
    { title: 'Office Catering', amount: 350.0, category: 'Others', date: new Date('2026-06-22'), status: 'PAID' },
    { title: 'Supplier Restock (Keyboard)', amount: 850.0, category: 'Inventory', date: new Date('2026-06-18'), status: 'PAID' },
  ];

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        ...exp,
        businessId: business.id,
      },
    });
  }

  // 9. Create HR: Departments, Employees, Attendance, Leaves
  const deptSales = await prisma.department.create({
    data: { name: 'Sales & Marketing', businessId: business.id },
  });
  const deptEngineering = await prisma.department.create({
    data: { name: 'Engineering', businessId: business.id },
  });
  const deptFinance = await prisma.department.create({
    data: { name: 'Finance & Accounts', businessId: business.id },
  });

  const emp1 = await prisma.employee.create({
    data: {
      firstName: 'Tony',
      lastName: 'Stark',
      email: 'tony@bizbrain.ai',
      phone: '+1 (555) 123-4567',
      role: 'Sales Executive',
      departmentId: deptSales.id,
      salary: 4500.0,
      hireDate: new Date('2025-01-10'),
      businessId: business.id,
    },
  });

  const emp2 = await prisma.employee.create({
    data: {
      firstName: 'Bruce',
      lastName: 'Banner',
      email: 'bruce@bizbrain.ai',
      phone: '+1 (555) 765-4321',
      role: 'Lead Architect',
      departmentId: deptEngineering.id,
      salary: 8500.0,
      hireDate: new Date('2024-03-15'),
      businessId: business.id,
    },
  });

  const emp3 = await prisma.employee.create({
    data: {
      firstName: 'Natasha',
      lastName: 'Romanoff',
      email: 'natasha@bizbrain.ai',
      phone: '+1 (555) 987-6543',
      role: 'Accountant',
      departmentId: deptFinance.id,
      salary: 5000.0,
      hireDate: new Date('2025-05-01'),
      businessId: business.id,
    },
  });

  // Attendance for employee 1 and 2
  const days = [1, 2, 3, 4, 5]; // last few workdays
  for (const day of days) {
    await prisma.attendance.create({
      data: {
        employeeId: emp1.id,
        date: new Date(`2026-07-0${day}T09:00:00Z`),
        status: 'PRESENT',
        checkIn: '09:02 AM',
        checkOut: '05:15 PM',
        businessId: business.id,
      },
    });

    await prisma.attendance.create({
      data: {
        employeeId: emp2.id,
        date: new Date(`2026-07-0${day}T09:00:00Z`),
        status: day === 3 ? 'LATE' : 'PRESENT',
        checkIn: day === 3 ? '10:15 AM' : '08:55 AM',
        checkOut: '06:00 PM',
        businessId: business.id,
      },
    });
  }

  // Leaves
  await prisma.leave.create({
    data: {
      employeeId: emp3.id,
      startDate: new Date('2026-07-10'),
      endDate: new Date('2026-07-14'),
      type: 'Sick Leave',
      status: 'APPROVED',
      reason: 'Wisdom tooth extraction surgery.',
      businessId: business.id,
    },
  });

  // 10. Notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'Low Stock Alert',
        message: 'Product "BizPro Laptop 16"" has only 4 units remaining in Main Warehouse (Min: 5).',
        type: 'LOW_STOCK',
        businessId: business.id,
      },
      {
        title: 'Invoice Overdue',
        message: 'Invoice INV-2026-004 for Acme Corporation ($908.58) is overdue by 35 days.',
        type: 'OVERDUE_INVOICE',
        businessId: business.id,
      },
      {
        title: 'AI Copilot Advice',
        message: 'Predictive analytics suggests a 15% surge in Office Furniture sales next month. Consider replenishing standing desks.',
        type: 'AI_ADVICE',
        businessId: business.id,
      },
    ],
  });

  // 11. Settings
  await prisma.settings.createMany({
    data: [
      { key: 'currency', value: 'USD', businessId: business.id },
      { key: 'gstEnabled', value: 'true', businessId: business.id },
      { key: 'darkMode', value: 'true', businessId: business.id },
      { key: 'api_mode', value: 'mock_fallback', businessId: business.id },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
