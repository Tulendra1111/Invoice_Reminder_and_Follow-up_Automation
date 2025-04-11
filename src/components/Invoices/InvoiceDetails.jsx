
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '@/services/invoiceService';
import { zapierService } from '@/services/zapierService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Send, Clock, User, Mail, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(false);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      setLoading(true);
      try {
        const data = await invoiceService.getInvoiceById(id);
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch invoice details.",
          variant: "destructive",
        });
        navigate('/invoices'); // Redirect to invoices page on error
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [id, navigate]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Overdue</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      // Simulate triggering a Zapier workflow for sending a reminder
      await zapierService.triggerZap('1', { invoiceId: invoice.id });
      toast({
        title: "Success",
        description: "Reminder email has been sent to the client.",
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send reminder email.",
        variant: "destructive",
      });
    } finally {
      setSendingReminder(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => navigate('/invoices')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Invoices
      </Button>

      {loading ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32 mt-4 md:mt-0" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
              <Skeleton className="h-40" />
            </CardContent>
          </Card>
        </div>
      ) : invoice ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                {invoice.number} 
                <span className="ml-3">{getStatusBadge(invoice.status)}</span>
              </h1>
              <p className="text-gray-600 mt-1">Created on {new Date(invoice.createdAt).toLocaleDateString()}</p>
            </div>

            {invoice.status === 'overdue' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="mt-4 md:mt-0">
                    <Send className="mr-2 h-4 w-4" /> Send Reminder
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Send Payment Reminder</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will send an automated payment reminder email to {invoice.clientName} ({invoice.clientEmail}) for invoice {invoice.number}.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={sendingReminder}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSendReminder();
                      }}
                    >
                      {sendingReminder ? "Sending..." : "Send Reminder"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Complete information about this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Invoice Number
                  </div>
                  <div className="font-medium">{invoice.number}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Due Date
                  </div>
                  <div className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-medium text-xl">${invoice.amount.toLocaleString()}</div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Client Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <User className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{invoice.clientName}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <div>{invoice.clientEmail}</div>
                  </div>
                </div>
              </div>

              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {invoice.description}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <div className="text-sm text-muted-foreground">
                Invoice status: <span className="font-medium">{invoice.status}</span>
              </div>
            </CardFooter>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Available actions for this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">Download PDF</Button>
                <Button variant="outline">Print Invoice</Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/automation')}
                >
                  Set Up Automated Reminders
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Invoice not found</h2>
          <p className="text-muted-foreground mt-2">
            The invoice you're looking for doesn't exist or has been deleted.
          </p>
          <Button 
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/invoices')}
          >
            View All Invoices
          </Button>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails;
