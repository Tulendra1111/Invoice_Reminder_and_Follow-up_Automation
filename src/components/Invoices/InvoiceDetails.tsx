
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Invoice as InvoiceType,
  invoiceService
} from '@/services/invoiceService';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { zapierService } from '@/services/zapierService';
import { 
  ArrowLeft, 
  Mail, 
  Download, 
  Calendar, 
  User, 
  Building, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!id) return;
      
      try {
        const data = await invoiceService.getInvoice(id);
        if (data) {
          setInvoice(data);
        } else {
          toast({
            title: "Invoice not found",
            description: "The requested invoice could not be found.",
            variant: "destructive",
          });
          navigate('/invoices');
        }
      } catch (error) {
        console.error('Failed to fetch invoice details', error);
        toast({
          title: "Error",
          description: "Failed to load invoice details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [id, navigate]);

  const handleSendReminder = async () => {
    if (!invoice) return;
    
    setSendingReminder(true);
    try {
      await invoiceService.sendReminder(invoice.id);
      
      // Use Zapier to trigger email
      if (invoice.status === 'overdue') {
        await zapierService.triggerAutomationForInvoice(invoice, 'invoice.overdue');
      } else {
        await zapierService.triggerAutomationForInvoice(invoice, 'invoice.reminder');
      }
      
      // Update the local invoice state
      setInvoice({
        ...invoice,
        remindersSent: invoice.remindersSent + 1
      });
      
      toast({
        title: "Reminder sent",
        description: "Payment reminder has been sent to the customer.",
      });
    } catch (error) {
      console.error('Failed to send reminder', error);
      toast({
        title: "Error",
        description: "Failed to send payment reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingReminder(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" disabled className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </Button>
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-60 w-full" />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const isOverdue = invoice.status === 'overdue';
  const isPaid = invoice.status === 'paid';
  const isPending = invoice.status === 'pending';
  
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  
  // Calculate days overdue or days until due
  const diffTime = Math.abs(today.getTime() - dueDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const daysOverdue = isOverdue ? diffDays : 0;
  const daysUntilDue = isPending ? diffDays : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/invoices')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
        <h1 className="text-3xl font-bold mb-2">
          Invoice {invoice.invoiceNumber}
        </h1>
        <p className="text-muted-foreground">
          Issued on {new Date(invoice.issueDate).toLocaleDateString()} • 
          Due on {new Date(invoice.dueDate).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main invoice details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Status banner */}
              {isOverdue && (
                <Alert className="mb-6 bg-red-50 border-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 flex items-center justify-between">
                    <span>This invoice is <strong>{daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue</strong>.</span>
                    <Button 
                      size="sm" 
                      onClick={handleSendReminder} 
                      disabled={sendingReminder || isPaid}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reminder
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {isPaid && (
                <Alert className="mb-6 bg-green-50 border-green-100">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 flex items-center justify-between">
                    <span>This invoice has been <strong>paid</strong>.</span>
                    <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-100">
                      <Download className="mr-2 h-4 w-4" />
                      Download Receipt
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {isPending && (
                <Alert className="mb-6 bg-yellow-50 border-yellow-100">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700 flex items-center justify-between">
                    <span>Payment due in <strong>{daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}</strong>.</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleSendReminder} 
                      disabled={sendingReminder}
                      className="border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reminder
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Customer information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-3">Customer Information</h3>
                <div className="bg-muted/20 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center text-muted-foreground mb-1">
                        <User className="h-4 w-4 mr-2" />
                        <span className="text-sm">Customer</span>
                      </div>
                      <p className="font-medium">{invoice.customer.name}</p>
                    </div>
                    
                    {invoice.customer.company && (
                      <div>
                        <div className="flex items-center text-muted-foreground mb-1">
                          <Building className="h-4 w-4 mr-2" />
                          <span className="text-sm">Company</span>
                        </div>
                        <p className="font-medium">{invoice.customer.company}</p>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center text-muted-foreground mb-1">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="text-sm">Email</span>
                      </div>
                      <p className="font-medium">{invoice.customer.email}</p>
                    </div>
                    
                    {invoice.customer.phone && (
                      <div>
                        <div className="flex items-center text-muted-foreground mb-1">
                          <span className="text-sm">Phone</span>
                        </div>
                        <p className="font-medium">{invoice.customer.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice items */}
              <div>
                <h3 className="text-lg font-medium mb-3">Invoice Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50 text-left">
                        <th className="py-2 px-4 font-medium">Item</th>
                        <th className="py-2 px-4 font-medium text-right">Qty</th>
                        <th className="py-2 px-4 font-medium text-right">Rate</th>
                        <th className="py-2 px-4 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item) => (
                        <tr key={item.id} className="border-b border-muted">
                          <td className="py-3 px-4">{item.description}</td>
                          <td className="py-3 px-4 text-right">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">${item.rate.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2}></td>
                        <td className="py-3 px-4 text-right font-medium">Subtotal</td>
                        <td className="py-3 px-4 text-right">${invoice.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}></td>
                        <td className="py-3 px-4 text-right font-medium">Tax</td>
                        <td className="py-3 px-4 text-right">${invoice.tax.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-muted/20">
                        <td colSpan={2}></td>
                        <td className="py-3 px-4 text-right text-lg font-bold">Total</td>
                        <td className="py-3 px-4 text-right text-lg font-bold">${invoice.total.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Notes</h3>
                  <p className="text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`payment-status-badge payment-status-${invoice.status}`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Invoice date</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Due date</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reminders sent</span>
                <span className="font-medium">{invoice.remindersSent}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                onClick={handleSendReminder} 
                disabled={sendingReminder || isPaid}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Reminder
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/automation')}
              >
                <Zap className="mr-2 h-4 w-4" />
                Set Up Automation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
