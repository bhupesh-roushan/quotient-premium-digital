import nodemailer from "nodemailer";

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || "noreply@quotient.com";
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.warn("Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.");
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      console.log("Email would be sent:", { to: options.to, subject: options.subject });
      return { success: true, messageId: "mock-email-id" };
    }

    try {
      const result = await this.transporter.sendMail({
        from: options.from || this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: String(error) };
    }
  }

  async sendOrderConfirmation(
    to: string,
    data: {
      orderId: string;
      productName: string;
      amount: number;
      currency: string;
      downloadUrl: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `Order Confirmation - ${data.productName}`;
    const html = this.getOrderConfirmationTemplate(data);
    
    return this.sendEmail({ to, subject, html });
  }

  async sendProductPublished(
    to: string,
    data: {
      productName: string;
      productUrl: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `Your Product is Live! - ${data.productName}`;
    const html = this.getProductPublishedTemplate(data);
    
    return this.sendEmail({ to, subject, html });
  }

  async sendNewReview(
    to: string,
    data: {
      productName: string;
      rating: number;
      reviewTitle: string;
      reviewerName: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `New Review on ${data.productName}`;
    const html = this.getNewReviewTemplate(data);
    
    return this.sendEmail({ to, subject, html });
  }

  async sendLowStockAlert(
    to: string,
    data: {
      productName: string;
      currentStock: number;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `Low Stock Alert - ${data.productName}`;
    const html = this.getLowStockTemplate(data);
    
    return this.sendEmail({ to, subject, html });
  }

  async sendWelcomeEmail(
    to: string,
    data: {
      name: string;
      isCreator: boolean;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = "Welcome to Quotient!";
    const html = data.isCreator 
      ? this.getCreatorWelcomeTemplate(data)
      : this.getBuyerWelcomeTemplate(data);
    
    return this.sendEmail({ to, subject, html });
  }

  private getOrderConfirmationTemplate(data: {
    orderId: string;
    productName: string;
    amount: number;
    currency: string;
    downloadUrl: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Thank you for your purchase! Your order has been confirmed and is ready for download.</p>
            
            <div class="details">
              <div class="detail-row">
                <span><strong>Order ID:</strong></span>
                <span>${data.orderId}</span>
              </div>
              <div class="detail-row">
                <span><strong>Product:</strong></span>
                <span>${data.productName}</span>
              </div>
              <div class="detail-row">
                <span><strong>Amount:</strong></span>
                <span>${data.currency} ${data.amount}</span>
              </div>
            </div>
            
            <a href="${data.downloadUrl}" class="button">Download Your Purchase</a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getProductPublishedTemplate(data: {
    productName: string;
    productUrl: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Your Product is Live!</h1>
          </div>
          <div class="content">
            <p>Congratulations! <strong>${data.productName}</strong> is now published and available for purchase.</p>
            <a href="${data.productUrl}" class="button">View Your Product</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getNewReviewTemplate(data: {
    productName: string;
    rating: number;
    reviewTitle: string;
    reviewerName: string;
  }): string {
    const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .review-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .stars { color: #ffc107; font-size: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ New Review!</h1>
          </div>
          <div class="content">
            <p><strong>${data.reviewerName}</strong> left a review on <strong>${data.productName}</strong>:</p>
            <div class="review-box">
              <div class="stars">${stars}</div>
              <p><strong>${data.reviewTitle}</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getLowStockTemplate(data: {
    productName: string;
    currentStock: number;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert-box { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Low Stock Alert</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <p><strong>${data.productName}</strong> is running low on stock.</p>
              <p>Current stock: <strong>${data.currentStock}</strong> units remaining</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getCreatorWelcomeTemplate(data: { name: string }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Quotient, ${data.name}!</h1>
          </div>
          <div class="content">
            <p>You're now a creator on Quotient! Here's what you can do:</p>
            <div class="feature">
              <strong>🚀 Create Products</strong>
              <p>Upload templates, code, guides, and more</p>
            </div>
            <div class="feature">
              <strong>🤖 AI-Powered Insights</strong>
              <p>Get pricing recommendations and SEO optimization</p>
            </div>
            <div class="feature">
              <strong>💰 Earn Revenue</strong>
              <p>Set your prices and start selling immediately</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBuyerWelcomeTemplate(data: { name: string }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Quotient, ${data.name}!</h1>
          </div>
          <div class="content">
            <p>Start discovering amazing digital products:</p>
            <ul>
              <li>🎨 UI Kits & Templates</li>
              <li>🤖 AI Prompt Packs</li>
              <li>💻 Developer Boilerplates</li>
              <li>📊 Productivity Tools</li>
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
