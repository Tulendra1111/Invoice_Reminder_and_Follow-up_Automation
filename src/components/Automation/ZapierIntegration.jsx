
import React, { useState, useEffect } from 'react';
import { zapierService } from '@/services/zapierService';
import { invoiceService } from '@/services/invoiceService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Check, Zap, Clock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ZapierIntegration = () => {
  const [zaps, setZaps] = useState([]);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [selectedZap, setSelectedZap] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [zapsData, overdueInvoicesData] = await Promise.all([
          zapierService.getIntegrations(),
          invoiceService.getOverdueInvoices()
        ]);
        setZaps(zapsData);
        setOverdueInvoices(overdueInvoicesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load automation data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleZap = async (zapId) => {
    try {
      const result = await zapierService.toggleZapStatus(zapId);
      setZaps(zaps.map(zap => {
        if (zap.id === zapId) {
          return { ...zap, status: result.status };
        }
        return zap;
      }));
      
      toast({
        title: "Status Updated",
        description: `Integration ${result.status === 'active' ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error('Error toggling zap status:', error);
      toast({
        title: "Error",
        description: "Failed to update integration status.",
        variant: "destructive",
      });
    }
  };

  const handleTriggerZap = async (zap, selectedInvoices) => {
    setTriggering(true);
    try {
      await zapierService.triggerZap(zap.id, { invoices: selectedInvoices });
      toast({
        title: "Success",
        description: `${zap.name} triggered successfully for ${selectedInvoices.length} invoice(s).`,
      });
    } catch (error) {
      console.error('Error triggering zap:', error);
      toast({
        title: "Error",
        description: "Failed to trigger the automation.",
        variant: "destructive",
      });
    } finally {
      setTriggering(false);
      setSelectedZap(null);
      setSelectedInvoices([]);
    }
  };

  const toggleInvoiceSelection = (invoiceId) => {
    setSelectedInvoices(prevSelected => {
      if (prevSelected.includes(invoiceId)) {
        return prevSelected.filter(id => id !== invoiceId);
      } else {
        return [...prevSelected, invoiceId];
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Automation</h1>
        <p className="text-gray-600 mt-1">Manage your invoice reminder automations with Zapier</p>
      </div>

      <Tabs defaultValue="integrations" className="mb-8">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
              // Loading skeletons for integration cards
              Array(3).fill(0).map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-24" />
                  </CardFooter>
                </Card>
              ))
            ) : zaps.length > 0 ? (
              zaps.map(zap => (
                <Card key={zap.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{zap.name}</CardTitle>
                      <Badge variant={zap.status === 'active' ? 'default' : 'outline'}>
                        {zap.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>{zap.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {zap.lastRun ? (
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          Last run: {new Date(zap.lastRun).toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">Never executed</div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={zap.status === 'active'} 
                        onCheckedChange={() => handleToggleZap(zap.id)} 
                      />
                      <Label>{zap.status === 'active' ? 'Enabled' : 'Disabled'}</Label>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => setSelectedZap(zap)}>
                          <Zap className="mr-2 h-4 w-4" />
                          Run Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Run {zap.name}</DialogTitle>
                          <DialogDescription>
                            Select the invoices you want to process with this automation
                          </DialogDescription>
                        </DialogHeader>
                        
                        {overdueInvoices.length > 0 ? (
                          <div className="space-y-4 my-4 max-h-[300px] overflow-y-auto">
                            {overdueInvoices.map(invoice => (
                              <div 
                                key={invoice.id} 
                                className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
                                onClick={() => toggleInvoiceSelection(invoice.id)}
                              >
                                <div className={`w-5 h-5 border rounded flex items-center justify-center ${selectedInvoices.includes(invoice.id) ? 'bg-primary border-primary' : 'border-input'}`}>
                                  {selectedInvoices.includes(invoice.id) && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{invoice.number} - {invoice.clientName}</p>
                                  <p className="text-sm text-muted-foreground">${invoice.amount.toLocaleString()} • Due {new Date(invoice.dueDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center p-6 text-muted-foreground">
                            <AlertCircle className="mr-2 h-4 w-4" />
                            No overdue invoices to process
                          </div>
                        )}
                        
                        <DialogFooter>
                          <Button
                            disabled={selectedInvoices.length === 0 || triggering}
                            onClick={() => handleTriggerZap(selectedZap, selectedInvoices)}
                          >
                            {triggering ? "Processing..." : "Run Automation"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center p-6 text-muted-foreground">
                <AlertCircle className="mr-2 h-4 w-4" />
                No Zapier integrations found
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Connect New Integration</CardTitle>
              <CardDescription>Link your Zapier account to create new automations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zapierKey">Zapier API Key</Label>
                <Input id="zapierKey" placeholder="Enter your Zapier API key" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Connect to Zapier</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
              <CardDescription>Invoices that require follow-up</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                // Loading skeletons for invoice list
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="flex justify-between p-2 border rounded">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              ) : overdueInvoices.length > 0 ? (
                <div className="space-y-2">
                  {overdueInvoices.map(invoice => (
                    <div key={invoice.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50">
                      <div>
                        <p className="font-medium">{invoice.number} - {invoice.clientName}</p>
                        <p className="text-sm text-muted-foreground">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${invoice.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No overdue invoices found
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled={overdueInvoices.length === 0}>
                Send Reminders to All
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Configure automatic follow-ups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send First Reminder</Label>
                  <p className="text-sm text-muted-foreground">When invoice becomes overdue</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send Second Reminder</Label>
                  <p className="text-sm text-muted-foreground">3 days after due date</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send Third Reminder</Label>
                  <p className="text-sm text-muted-foreground">7 days after due date</p>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZapierIntegration;
