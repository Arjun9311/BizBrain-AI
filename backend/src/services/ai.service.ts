import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIService {
  private static genAI: GoogleGenerativeAI | null = null;

  private static getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return null;
    }
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  public static async generateText(prompt: string, context?: string): Promise<string> {
    const client = this.getClient();

    if (!client) {
      console.log('Gemini API Key missing or empty. Using rule-based fallback response engine.');
      return this.getFallbackResponse(prompt, context);
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
      return `[API Error - falling back to Local AI Simulator] ${await this.getFallbackResponse(prompt, context)}`;
    }
  }

  private static getFallbackResponse(prompt: string, context?: string): string {
    const p = prompt.toLowerCase();
    
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
Hello! I am your Intelligent Business Copilot. I have analyzed your system data for **BizBrain HQ**. 

Here are the quick highlights:
- You have **2 products** below minimum stock alerts (BizPro Laptop and MX Mouse).
- One invoice is currently **overdue** (Acme Corporation, $908.58).
- Total sales revenue is **$4,679.93** with **$3,869.95** outstanding in receivables.

How can I help you manage your business today? I can write emails, forecast revenues, draft SWOT charts, or help automate inventory.`;
  }
}
