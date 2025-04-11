
import { toast } from "@/components/ui/use-toast";
import { Invoice } from "./invoiceService";

export interface ZapierWebhook {
  id: string;
  name: string;
  url: string;
  event: 'invoice.reminder' | 'invoice.followup' | 'invoice.overdue' | 'custom';
  active: boolean;
  lastTriggered?: string;
  description?: string;
}

class ZapierService {
  private webhooks: ZapierWebhook[] = [
    {
      id: 'webhook1',
      name: 'Send Invoice Reminder',
      url: '',
      event: 'invoice.reminder',
      active: true,
      description: 'Sends an email reminder for invoices due within 7 days'
    },
    {
      id: 'webhook2',
      name: 'Send Overdue Notice',
      url: '',
      event: 'invoice.overdue',
      active: true,
      description: 'Sends an overdue notice when invoices become past-due'
    },
    {
      id: 'webhook3', 
      name: 'Send Follow-up',
      url: '',
      event: 'invoice.followup',
      active: true,
      description: 'Sends a follow-up reminder for invoices 7 days after the due date'
    }
  ];

  public async getWebhooks(): Promise<ZapierWebhook[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.webhooks];
  }

  public async updateWebhook(id: string, data: Partial<ZapierWebhook>): Promise<ZapierWebhook> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = this.webhooks.findIndex(webhook => webhook.id === id);
    if (index === -1) {
      throw new Error('Webhook not found');
    }
    
    this.webhooks[index] = {
      ...this.webhooks[index],
      ...data,
      lastTriggered: data.url ? undefined : this.webhooks[index].lastTriggered
    };
    
    return this.webhooks[index];
  }

  public async triggerWebhook(webhookId: string, invoiceId: string): Promise<boolean> {
    const webhook = this.webhooks.find(w => w.id === webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }
    
    if (!webhook.url) {
      toast({
        title: "No webhook URL",
        description: "Please set a webhook URL in the automation settings first.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!webhook.active) {
      toast({
        title: "Webhook inactive",
        description: "This webhook is currently inactive. Please activate it first.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      console.log(`Triggered webhook ${webhook.name} for invoice ${invoiceId}`);
      
      // Update last triggered time
      webhook.lastTriggered = new Date().toISOString();
      
      toast({
        title: "Webhook triggered",
        description: `Successfully triggered "${webhook.name}" automation.`
      });
      
      return true;
    } catch (error) {
      console.error('Failed to trigger webhook', error);
      toast({
        title: "Failed to trigger webhook",
        description: "An error occurred while triggering the automation. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }

  public async triggerAutomationForInvoice(invoice: Invoice, event: ZapierWebhook['event']): Promise<boolean> {
    const webhook = this.webhooks.find(w => w.event === event);
    if (!webhook) {
      toast({
        title: "No automation found",
        description: `No automation set up for the ${event} event.`,
        variant: "destructive"
      });
      return false;
    }
    
    return this.triggerWebhook(webhook.id, invoice.id);
  }
}

export const zapierService = new ZapierService();
