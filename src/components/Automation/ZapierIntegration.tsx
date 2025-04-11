
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ZapierWebhook, zapierService } from '@/services/zapierService';
import { toast } from '@/components/ui/use-toast';
import { invoiceService } from '@/services/invoiceService';
import { AlertCircle, ArrowRight, Check, Info, Loader2, Zap, Navigation } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ZapierIntegration: React.FC = () => {
  const navigate = useNavigate();
  const [webhooks, setWebhooks] = useState<ZapierWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('reminder');

  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const data = await zapierService.getWebhooks();
        setWebhooks(data);
      } catch (error) {
        console.error('Failed to fetch webhooks', error);
        toast({
          title: "Error",
          description: "Failed to load automation settings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWebhooks();
  }, []);

  const handleSaveWebhook = async (id: string, url: string) => {
    setSaving(true);
    try {
      const updatedWebhook = await zapierService.updateWebhook(id, { url });
      setWebhooks(webhooks.map(webhook => 
        webhook.id === id ? updatedWebhook : webhook
      ));
      
      toast({
        title: "Saved",
        description: "Webhook URL has been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to save webhook', error);
      toast({
        title: "Error",
        description: "Failed to save webhook URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleWebhook = async (id: string, active: boolean) => {
    try {
      const updatedWebhook = await zapierService.updateWebhook(id, { active });
      setWebhooks(webhooks.map(webhook => 
        webhook.id === id ? updatedWebhook : webhook
      ));
      
      toast({
        title: active ? "Enabled" : "Disabled",
        description: `Webhook has been ${active ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Failed to toggle webhook', error);
      toast({
        title: "Error",
        description: "Failed to update webhook status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestWebhook = async (id: string) => {
    setTestingWebhook(id);
    try {
      const overdueInvoices = await invoiceService.getOverdueInvoices();
      
      if (overdueInvoices.length === 0) {
        toast({
          title: "No test data",
          description: "No overdue invoices found to test the webhook.",
          variant: "destructive",
        });
        return;
      }
      
      const testInvoice = overdueInvoices[0];
      const success = await zapierService.triggerWebhook(id, testInvoice.id);
      
      if (success) {
        toast({
          title: "Test successful",
          description: "The webhook was triggered successfully with test data.",
        });
      }
    } catch (error) {
      console.error('Failed to test webhook', error);
      toast({
        title: "Test failed",
        description: "Failed to test the webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  const getWebhookByEvent = (event: string): ZapierWebhook | undefined => {
    return webhooks.find(webhook => webhook.event === event);
  };

  const renderWebhookCard = (eventType: 'invoice.reminder' | 'invoice.overdue' | 'invoice.followup') => {
    const webhook = getWebhookByEvent(eventType);
    
    if (!webhook) return null;
    
    let title = '';
    let description = '';
    
    switch (eventType) {
      case 'invoice.reminder':
        title = 'Payment Reminder';
        description = 'Send automated reminders to clients when invoices are approaching their due date.';
        break;
      case 'invoice.overdue':
        title = 'Overdue Notice';
        description = 'Automatically send notices to clients when invoices become past-due.';
        break;
      case 'invoice.followup':
        title = 'Follow-up Reminder';
        description = 'Send follow-up reminders to clients with invoices that remain unpaid after the due date.';
        break;
    }
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Switch 
              checked={webhook.active} 
              onCheckedChange={(checked) => handleToggleWebhook(webhook.id, checked)} 
            />
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`webhook-url-${webhook.id}`}>Zapier Webhook URL</Label>
              <Input 
                id={`webhook-url-${webhook.id}`}
                placeholder="Paste your Zapier webhook URL here"
                defaultValue={webhook.url}
                onBlur={(e) => handleSaveWebhook(webhook.id, e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Create a Zap in Zapier that starts with a Webhook trigger, then paste the webhook URL here.
              </p>
            </div>
            
            {webhook.lastTriggered && (
              <div className="text-sm text-muted-foreground">
                Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => handleTestWebhook(webhook.id)}
            disabled={!webhook.url || !webhook.active || testingWebhook === webhook.id}
          >
            {testingWebhook === webhook.id ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Test Webhook
          </Button>
          
          <Button 
            variant="default" 
            onClick={() => navigate('/invoices?filter=overdue')}
          >
            View Invoices
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-60 mb-6" />
        <Skeleton className="h-6 w-full max-w-2xl mb-8" />
        
        <div className="mb-6">
          <Skeleton className="h-10 w-80 mb-2" />
        </div>
        
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Automation</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        Set up automated reminders and follow-ups for your invoices using Zapier integration.
      </p>

      <Alert className="mb-6 border-blue-100 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <p className="font-medium">How to set up automation with Zapier:</p>
          <ol className="list-decimal list-inside mt-2 ml-2 space-y-1">
            <li>Create a new Zap in Zapier</li>
            <li>Select "Webhooks by Zapier" as your trigger</li>
            <li>Choose "Catch Hook" as the event</li>
            <li>Copy the webhook URL and paste it into the corresponding field below</li>
            <li>Set up your actions in Zapier (e.g., send an email, create a task)</li>
            <li>Test the webhook to make sure it's working</li>
            <li>Turn on your Zap</li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="mb-6">
        <Tabs defaultValue="reminder" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="reminder">Payment Reminder</TabsTrigger>
            <TabsTrigger value="overdue">Overdue Notice</TabsTrigger>
            <TabsTrigger value="followup">Follow-up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reminder">
            {renderWebhookCard('invoice.reminder')}
          </TabsContent>
          
          <TabsContent value="overdue">
            {renderWebhookCard('invoice.overdue')}
          </TabsContent>
          
          <TabsContent value="followup">
            {renderWebhookCard('invoice.followup')}
          </TabsContent>
        </Tabs>
      </div>

      <div className="bg-muted/20 rounded-lg p-6 border border-muted">
        <h3 className="text-lg font-medium mb-3">Sample webhook data</h3>
        <p className="text-muted-foreground mb-4">
          When triggered, the webhook will send the following data to Zapier:
        </p>
        
        <div className="bg-black text-white rounded-md p-4 overflow-auto">
          <pre className="text-sm">
{`{
  "event": "${activeTab === 'reminder' ? 'invoice.reminder' : activeTab === 'overdue' ? 'invoice.overdue' : 'invoice.followup'}",
  "invoice": {
    "id": "inv_123456",
    "number": "INV-005",
    "amount": 1890.00,
    "currency": "USD",
    "dueDate": "2025-03-01",
    "status": "${activeTab === 'reminder' ? 'pending' : 'overdue'}"
  },
  "customer": {
    "name": "Eva Brown",
    "email": "eva@example.com",
    "company": "Brown Designs"
  }
}`}
          </pre>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          Use this data in your Zapier workflow to create customized emails or notifications.
        </div>
      </div>
    </div>
  );
};

export default ZapierIntegration;
