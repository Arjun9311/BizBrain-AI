import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient(customApiKey?: string) {
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return null;
    }
    if (customApiKey) {
      return new GoogleGenerativeAI(customApiKey);
    }
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  public static async generateText(prompt: string, context?: string, customApiKey?: string): Promise<string> {
    const client = this.getClient(customApiKey);

    if (!client) {
      console.log('Gemini API Key missing or empty. Using rule-based fallback response engine.');
      const fallback = this.getFallbackResponse(prompt, context);
      if (prompt.toLowerCase().includes('html') || prompt.toLowerCase().includes('styled html page')) {
        return this.customizeHtmlTemplate(fallback, prompt);
      }
      return fallback;
    }

    try {
      const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const fullPrompt = context 
        ? `Context about the business:
${context}

User request:
${prompt}`
        : prompt;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error contacting Gemini API:', error.message);
      const fallback = this.getFallbackResponse(prompt, context);
      if (prompt.toLowerCase().includes('html') || prompt.toLowerCase().includes('styled html page')) {
        return this.customizeHtmlTemplate(fallback, prompt);
      }
      return fallback;
    }
  }

  private static getFallbackResponse(prompt: string, context?: string): string {
    const p = prompt.toLowerCase();
    
    // Parse context if available
    let productsCount = "5";
    let alertsCount = "2";
    let customerCount = "4";
    let revenueSum = "4,679.93";
    let businessName = "BizBrain HQ";

    if (context) {
      const nameMatch = context.match(/The business name is "([^"]+)"/);
      if (nameMatch) businessName = nameMatch[1];

      const prodMatch = context.match(/Products cataloged:\s*(\d+)/i);
      if (prodMatch) productsCount = prodMatch[1];

      const alertMatch = context.match(/Products below warning min limit:\s*(\d+)/i);
      if (alertMatch) alertsCount = alertMatch[1];

      const custMatch = context.match(/Active clients:\s*(\d+)/i);
      if (custMatch) customerCount = custMatch[1];

      const revMatch = context.match(/Total invoiced revenue:\s*\$([0-9.,]+)/i);
      if (revMatch) revenueSum = revMatch[1];
    }

    // Specific metric queries
    if (p.includes('how many products') || p.includes('number of products') || p.includes('total products') || p.includes('cataloged')) {
      return `We currently have **${productsCount}** products cataloged in our inventory system for **${businessName}**.`;
    }

    if (p.includes('revenue') || p.includes('total sales') || p.includes('sales revenue') || p.includes('how much money') || p.includes('invoiced')) {
      return `The total invoiced sales revenue for **${businessName}** is currently **$${revenueSum}**.`;
    }

    if (p.includes('customer') || p.includes('client') || p.includes('crm') || p.includes('profiles')) {
      if (p.includes('risk') || p.includes('loyalty') || p.includes('acme')) {
        // Fall through to CRM insights
      } else {
        return `We currently have **${customerCount}** active customer profiles registered in our CRM database.`;
      }
    }

    if (p.includes('low stock') || p.includes('warning limit') || p.includes('min limit') || p.includes('shortage') || p.includes('stock warnings')) {
      if (p.includes('reorder') || p.includes('what to') || p.includes('recommend')) {
        // Fall through to inventory recommendations
      } else {
        return `There are currently **${alertsCount}** products that have fallen below their minimum stock warning threshold.`;
      }
    }

    if (p.includes('tax') || p.includes('gst') || p.includes('vat')) {
      return `The system is configured with a standard tax rate of **18.0% GST** and the primary currency is set to **USD**.`;
    }

    if (p.includes('hello') || p.includes('hi') || p.includes('who are you') || p.includes('what is your name')) {
      return `Hello! I am your **BizBrain Intelligent Business Copilot**. I have analyzed your system ledger data for **${businessName}**.\n\nI can write supplier emails, predict sales, find stock shortages, or draft business plans. How can I help you manage your business today?`;
    }

    // Website HTML Generator Fallbacks
    if (p.includes('html') || p.includes('styled html page')) {
      if (p.includes('about')) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Us - BizBrain HQ</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white font-sans min-h-screen flex flex-col justify-between">
  <header class="p-6 max-w-6xl mx-auto w-full flex justify-between items-center">
    <div class="text-xl font-extrabold text-blue-500 tracking-wider">BIZBRAIN HQ</div>
    <nav class="flex gap-6 text-sm text-slate-400">
      <a href="#" class="hover:text-white">Features</a>
      <a href="#" class="hover:text-white font-semibold text-white">About Us</a>
      <a href="#" class="hover:text-white">Contact</a>
    </nav>
  </header>
  <main class="max-w-4xl mx-auto px-6 py-16 space-y-12 flex-1">
    <div class="text-center space-y-4">
      <h1 class="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Our Vision & Mission</h1>
      <p class="text-slate-400 max-w-xl mx-auto text-xs">Pioneering AI-driven ERP automation systems for SMEs globally.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h3 class="text-sm font-bold text-blue-400">Autonomous Ledger Syncing</h3>
        <p class="text-slate-400 text-xs leading-relaxed">We synchronize inventory tracking, invoice records, and tax filings in one ledger system.</p>
      </div>
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h3 class="text-sm font-bold text-cyan-400">Gemini LLM Advisory</h3>
        <p class="text-slate-400 text-xs leading-relaxed">Our virtual business manager checks cash flow curves to output reorder alerts and saving plans.</p>
      </div>
    </div>
  </main>
  <footer class="p-6 text-center text-xs text-slate-600 border-t border-slate-900">
    &copy; 2026 BizBrain HQ. Generated by BizBrain AI Copilot.
  </footer>
</body>
</html>`;
      }

      if (p.includes('contact')) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Our Team - BizBrain HQ</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white font-sans min-h-screen flex flex-col justify-between">
  <header class="p-6 max-w-6xl mx-auto w-full flex justify-between items-center">
    <div class="text-xl font-extrabold text-blue-500 tracking-wider">BIZBRAIN HQ</div>
  </header>
  <main class="max-w-md mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
    <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
      <div class="text-center">
        <h2 class="text-lg font-bold">Get in Touch</h2>
        <p class="text-xs text-slate-400 mt-1">Submit your corporate ledger inquiries below</p>
      </div>
      <form class="space-y-4">
        <div>
          <label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company Email</label>
          <input type="email" placeholder="ceo@company.com" class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white focus:border-blue-500" />
        </div>
        <div>
          <label class="block text-[10px] uppercase font-bold text-slate-400 mb-1">Message Description</label>
          <textarea rows="3" placeholder="Inquire about pricing plans..." class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none text-white focus:border-blue-500"></textarea>
        </div>
        <button type="button" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">Dispatch Inquiry</button>
      </form>
    </div>
  </main>
  <footer class="p-6 text-center text-xs text-slate-650 border-t border-slate-900">
    &copy; 2026 BizBrain HQ. Generated by BizBrain AI Copilot.
  </footer>
</body>
</html>`;
      }

      if (p.includes('catalog') || p.includes('product')) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Product Catalog - BizBrain HQ</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white font-sans min-h-screen flex flex-col justify-between">
  <header class="p-6 max-w-6xl mx-auto w-full flex justify-between items-center border-b border-slate-900">
    <div class="text-xl font-extrabold text-blue-500 tracking-wider">BIZBRAIN HQ</div>
    <span class="text-xs text-slate-500">Corporate Stock Catalog</span>
  </header>
  <main class="max-w-5xl mx-auto px-6 py-12 flex-1 space-y-8">
    <h2 class="text-2xl font-bold">Featured Hardware Inventory</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div class="w-full h-32 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 font-bold">MX Master 3S</div>
        <div class="flex justify-between items-center text-xs font-bold"><span class="text-slate-400">Accessories</span><span>$99.00</span></div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div class="w-full h-32 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 font-bold">BizPro Laptop 16"</div>
        <div class="flex justify-between items-center text-xs font-bold"><span class="text-slate-400">Electronics</span><span>$1,499.00</span></div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div class="w-full h-32 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 font-bold">Standing Desk</div>
        <div class="flex justify-between items-center text-xs font-bold"><span class="text-slate-400">Furniture</span><span>$450.00</span></div>
      </div>
    </div>
  </main>
</body>
</html>`;
      }

      if (p.includes('faq')) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FAQ - BizBrain HQ</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white font-sans min-h-screen flex flex-col justify-between">
  <main class="max-w-2xl mx-auto px-6 py-16 flex-1 space-y-8">
    <div class="text-center space-y-2">
      <h2 class="text-3xl font-extrabold text-blue-500">FAQ Center</h2>
      <p class="text-xs text-slate-400">Common ledger configuration questions answered</p>
    </div>
    <div class="space-y-4">
      <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <h4 class="text-xs font-bold text-white mb-2">How secure is the database syncing?</h4>
        <p class="text-[11px] text-slate-400 leading-relaxed">All sync nodes use JWT token payloads and are encrypted over TLS. Database schemas use auto-validated relational maps.</p>
      </div>
      <div class="p-5 bg-slate-900 border border-slate-800 rounded-xl">
        <h4 class="text-xs font-bold text-white mb-2">Can we migrate from SQLite to PostgreSQL?</h4>
        <p class="text-[11px] text-slate-450 leading-relaxed">Yes. Simply change the database provider in schema.prisma, update your DATABASE_URL in .env, and run npx prisma db push.</p>
      </div>
    </div>
  </main>
</body>
</html>`;
      }

      if (p.includes('blog')) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Roll - BizBrain HQ</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white font-sans min-h-screen flex flex-col justify-between">
  <main class="max-w-4xl mx-auto px-6 py-12 flex-1 space-y-8">
    <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">BizBrain ERP Blog</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="space-y-2">
        <span class="text-[9px] font-bold text-blue-500 uppercase tracking-widest">BI & Analytics</span>
        <h3 class="text-sm font-bold hover:text-blue-400 cursor-pointer">Unlocking Q3 Cash Flow Projections</h3>
        <p class="text-xs text-slate-450 leading-relaxed">We outline why early payment discounts reduce receivables overhangs and secure cash flow limits.</p>
      </div>
      <div class="space-y-2">
        <span class="text-[9px] font-bold text-cyan-500 uppercase tracking-widest">Logistics</span>
        <h3 class="text-sm font-bold hover:text-cyan-400 cursor-pointer">AI-Assisted Stock Restocking Velocities</h3>
        <p class="text-xs text-slate-450 leading-relaxed">Discover how linear decay speeds compute min/max thresholds dynamically to trigger vendor supplies.</p>
      </div>
    </div>
  </main>
</body>
</html>`;
      }

      // Default landing page HTML template
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BizBrain HQ - Premium Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white font-sans min-h-screen flex flex-col justify-between">
  <header class="p-6 max-w-6xl mx-auto w-full flex justify-between items-center">
    <div class="text-xl font-extrabold text-blue-500 tracking-wider">BIZBRAIN HQ</div>
    <nav class="flex gap-6 text-sm text-slate-400">
      <a href="#" class="hover:text-white transition-colors">Features</a>
      <a href="#" class="hover:text-white transition-colors">Pricing</a>
      <a href="#" class="hover:text-white transition-colors">FAQ</a>
    </nav>
  </header>
  <main class="max-w-4xl mx-auto px-6 py-20 text-center space-y-8 flex-1 flex flex-col justify-center">
    <span class="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest inline-block mx-auto">
      AI Generated Landing Page
    </span>
    <h1 class="text-5xl font-extrabold leading-tight bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
      Unlock Hyper-Growth for Your SME Business
    </h1>
    <p class="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
      BizBrain AI manages your orders, inventory metrics, tax filing reports, and customer pipelines in one secure hub.
    </p>
    <div>
      <button class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all">
        Start Free Trial
      </button>
    </div>
  </main>
  <footer class="p-6 text-center text-xs text-slate-650 border-t border-slate-900">
    &copy; 2026 BizBrain HQ. Generated by BizBrain AI Copilot.
  </footer>
</body>
</html>`;
    }

    if (p.includes('profit')) {
      return `### Financial Advisory Report: Profit Margin Analysis
Based on the current fiscal year performance:
- **Net Revenue (Q2)**: $5,227.91 (Stark Industries & Wayne Enterprises contracts)
- **Net Expenses**: $9,320.00 (Primarily due to office space lease of $5,000 and marketing campaign setup of $2,700)
- **Gross Profit Margin**: **29.3%** on physical inventory sales.
- **Operating Health**: Cash flow is stable due to early invoice payments. Outstanding receivables stand at **$3,869.95** (with $908.58 from Acme Corp currently overdue).
- **Recommendation**: Standardize follow-up templates to collect from Acme Corp, and optimize inventory reorder schedules to reduce carrying cost.`;
    }

  if (p.includes('reorder') || p.includes('stock') || p.includes('inventory')) {
      return `### Inventory Restock Recommendations
Analyzing current inventory levels against velocity metrics:
1. **BizPro Laptop 16" (SKU: PRO-LAP-16)**:
   - *Current Stock*: 4 units (Threshold: 5)
   - *Lead Time*: 5 days from **Intel Corp Supply**
   - *Recommendation*: **Order 10 units immediately** to meet upcoming third-quarter corporate contracts.
2. **MX Master 3S Mouse (SKU: ACC-MOU-MX3)**:
   - *Current Stock*: 2 units (Threshold: 8)
   - *Lead Time*: 3 days from **Logitech Global**
   - *Recommendation*: **Order 20 units** (bulk discount threshold is 15+ units).
3. **Ergonomic Standing Desk (SKU: OFF-DSK-ERG)**:
   - *Current Stock*: 12 units (Threshold: 3)
   - *Status*: Stable. No reorder required.`;
    }

    if (p.includes('predict') || p.includes('forecast') || p.includes('next month')) {
      return `### Sales Forecasting for BizBrain HQ (July/August 2026)
Using predictive linear modeling of current sales trends ($4,679.93 generated over the last 60 days):
- **Projected Sales**: **$6,840.00** (Expected confidence: 92%)
- **Driver Indicators**: Recurring corporate client orders are expected to spike in mid-July.
- **Seasonality**: Office Furniture is seeing an upward curve (+14.8% QoQ).
- **Actionable Steps**: 
  - Restock mechanical keyboards (current stock: 25, velocity increasing).
  - Launch a targeted email promotion to "At Risk" customers (e.g. Acme Corp) to capture leftover Q2 budgets.`;
    }

    if (p.includes('email')) {
      return `Subject: BizBrain HQ - Inquiries Regarding Restock Order Request

Dear Supplier Support Team,

I hope this email finds you well.

We are reviewing our inventory levels at BizBrain HQ and would like to place a restock order for the following items:
- MX Master 3S Mouse (SKU: ACC-MOU-MX3) - 20 units
- BizPro Laptop 16" (SKU: PRO-LAP-16) - 10 units

Could you please confirm:
1. The unit cost pricing (including any bulk or hacker-hackathon discount rate)?
2. Estimated shipping timeline to our Silicon Valley Warehouse?
3. Payment terms invoice details?

Please send over a formal quotation or proforma invoice so we can clear this with our accounts department.

Best regards,

Sarah Connor
Super Admin, BizBrain HQ
contact@bizbrain.ai`;
    }

    if (p.includes('report') || p.includes('summarize')) {
      return `### Executive Business Summary (BizBrain HQ)
**1. Sales Dashboard Performance**
- Complete revenue logged: **$4,679.93** from orders.
- Active customer profiles: **4** major client accounts.
- Pending sales: **$2,999.98** (Stark Industries - Awaiting Delivery).

**2. Outbound Cash Flow**
- Total recorded expenses: **$9,320.00** across rent, services, and inventory.
- Payroll breakdown: $18,000 monthly combined salaries across 3 employees.

**3. SWOT Brief**
- **Strengths**: High Customer Loyalty Score (Wayne Enterprises: 88, Stark: 95).
- **Weaknesses**: Dependency on large enterprise orders.
- **Opportunities**: AI-assisted website catalogue integration.
- **Threats**: Supply chain delay on electronics imports (Lead time: 5-7 days).`;
    }

    if (p.includes('customer') || p.includes('recent')) {
      return `### CRM Segmentation & Insights
- **Top Purchaser**: Stark Industries ($3,599.96 in sales, 2 orders).
- **At Risk Account**: **Acme Corporation** (Loyalty: 40, Last purchase was 66 days ago). 
- **Action Plan**: Send an automated reminder for outstanding invoice **INV-2026-004** ($908.58) and offer a 5% loyalty coupon to re-engage their procurement team.`;
    }

    // Default chat fallback
    return `### BizBrain Copilot Response
Hello! I am your Intelligent Business Copilot. I have analyzed your system data for **${businessName}**. 

Here are the quick highlights based on our records:
- Products Cataloged: **${productsCount}**
- Stock Warnings: **${alertsCount}** products below minimum stock limits
- Active Clients: **${customerCount}** CRM profiles
- Total Revenue: **$${revenueSum}**

To ask complex, open-ended questions like "${prompt}" and get custom AI responses, please go to **Platform Configuration** in settings and enter a valid **Gemini AI API Key**.`;
  }

  private static customizeHtmlTemplate(template: string, prompt: string): string {
    const p = prompt.toLowerCase();
    let customized = template;

    // 1. Color Theme / Accent Color detection
    let accentColor = 'blue';
    if (p.includes('emerald') || p.includes('green') || p.includes('organic') || p.includes('mint') || p.includes('lime')) {
      accentColor = 'emerald';
    } else if (p.includes('rose') || p.includes('red') || p.includes('crimson') || p.includes('danger') || p.includes('cherry')) {
      accentColor = 'rose';
    } else if (p.includes('cyan') || p.includes('teal') || p.includes('ocean')) {
      accentColor = 'cyan';
    } else if (p.includes('purple') || p.includes('violet') || p.includes('neon') || p.includes('cyber') || p.includes('robotic')) {
      accentColor = 'purple';
    } else if (p.includes('amber') || p.includes('orange') || p.includes('yellow') || p.includes('sunset')) {
      accentColor = 'amber';
    } else if (p.includes('indigo') || p.includes('navy')) {
      accentColor = 'indigo';
    }

    if (accentColor !== 'blue') {
      customized = customized.replace(/\bblue-(\d{2,3})\b/g, `${accentColor}-$1`);
      customized = customized.replace(/\bblue\/(\d{2,3})\b/g, `${accentColor}/$1`);
    }

    // 2. Dark/Light Mode detection
    const wantsLight = p.includes('light') || p.includes('light mode') || p.includes('white background') || p.includes('bright') || p.includes('clean') || p.includes('white');
    const wantsDark = p.includes('dark') || p.includes('dark mode') || p.includes('black') || p.includes('slate-950') || p.includes('cyber') || p.includes('night');

    if (wantsLight) {
      customized = customized.replace(/bg-slate-950/g, 'bg-slate-50');
      customized = customized.replace(/bg-slate-900/g, 'bg-white');
      customized = customized.replace(/bg-slate-800/g, 'bg-slate-100');
      customized = customized.replace(/text-white/g, 'text-slate-900');
      customized = customized.replace(/text-slate-400/g, 'text-slate-650');
      customized = customized.replace(/border-slate-800/g, 'border-slate-200');
      customized = customized.replace(/border-slate-900/g, 'border-slate-200');
    } else if (wantsDark) {
      customized = customized.replace(/bg-white/g, 'bg-slate-900');
      customized = customized.replace(/bg-slate-50/g, 'bg-slate-950');
      customized = customized.replace(/text-slate-900/g, 'text-white');
      customized = customized.replace(/text-slate-650/g, 'text-slate-400');
      customized = customized.replace(/border-slate-200/g, 'border-slate-800');
    }

    // 3. Title / Copy Customization
    let businessName = "BizBrain HQ";
    let titleText = "";

    const forMatch = prompt.match(/for\s+(?:an?\s+)?([^,.]+)/i);
    if (forMatch && forMatch[1]) {
      const topic = forMatch[1].trim();
      businessName = topic.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      if (businessName.toLowerCase().endsWith('page')) {
        businessName = businessName.slice(0, -4).trim();
      }
      titleText = businessName;
    }

    if (businessName !== "BizBrain HQ") {
      customized = customized.replace(/BIZBRAIN HQ/g, businessName.toUpperCase());
      customized = customized.replace(/BizBrain HQ/g, businessName);
      
      if (titleText) {
        customized = customized.replace(/Unlock Hyper-Growth for Your SME Business/g, `Experience the Future of ${businessName}`);
        customized = customized.replace(/Our Vision & Mission/g, `Our ${businessName} Vision`);
        customized = customized.replace(/Get in Touch/g, `Connect with ${businessName}`);
        customized = customized.replace(/Featured Hardware Inventory/g, `Our Exclusive ${businessName} Collection`);
        customized = customized.replace(/FAQ Center/g, `${businessName} FAQ Center`);
        customized = customized.replace(/BizBrain ERP Blog/g, `${businessName} Journal & News`);
      }
    }

    const quoteMatch = prompt.match(/"([^"]+)"/);
    if (quoteMatch && quoteMatch[1]) {
      const customBrand = quoteMatch[1];
      customized = customized.replace(/BIZBRAIN HQ/g, customBrand.toUpperCase());
      customized = customized.replace(/BizBrain HQ/g, customBrand);
    }

    return customized;
  }
}
