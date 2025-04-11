
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Invoice, invoiceService } from '@/services/invoiceService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, AlertTriangle, CheckCircle, Clock, ArrowRight, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await invoiceService.getInvoices();
        setInvoices(data);
      } catch (error) {
        console.error('Failed to fetch invoices', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mb-8">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
  const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue').length;
  
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paidAmount = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);
  
  const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
  const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-3xl font-bold">{totalInvoices}</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Paid</span>
                <span className="font-medium text-green-600">{paidInvoices}</span>
              </div>
              <Progress value={paidInvoices / totalInvoices * 100} className="h-1 bg-muted" />
              
              <div className="flex items-center justify-between text-sm">
                <span>Pending</span>
                <span className="font-medium text-amber-600">{pendingInvoices}</span>
              </div>
              <Progress value={pendingInvoices / totalInvoices * 100} className="h-1 bg-muted" />
              
              <div className="flex items-center justify-between text-sm">
                <span>Overdue</span>
                <span className="font-medium text-red-600">{overdueInvoices}</span>
              </div>
              <Progress value={overdueInvoices / totalInvoices * 100} className="h-1 bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Payment Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">${paidAmount.toFixed(2)}</span>
              <span className="text-sm text-muted-foreground">of ${totalAmount.toFixed(2)}</span>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Collection rate</span>
                <span className="text-sm font-medium">{collectionRate.toFixed(1)}%</span>
              </div>
              <Progress value={collectionRate} className="h-2" />
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <p className="text-sm text-muted-foreground">
              {totalAmount - paidAmount > 0 
                ? `$${(totalAmount - paidAmount).toFixed(2)} still to be collected`
                : 'All invoices collected'}
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{paymentRate.toFixed(1)}%</span>
              <span className="text-sm text-muted-foreground">payment rate</span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Paid</span>
                </div>
                <span className="text-sm font-medium">{paidInvoices}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-sm font-medium">{pendingInvoices}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Overdue</span>
                </div>
                <span className="text-sm font-medium">{overdueInvoices}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <h2 className="text-xl font-bold mb-4">Action Items</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {overdueInvoices > 0 ? (
          <Alert className="bg-red-50 border-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertTitle className="text-red-800">Overdue Invoices</AlertTitle>
            <AlertDescription className="text-red-700">
              You have {overdueInvoices} overdue {overdueInvoices === 1 ? 'invoice' : 'invoices'} that need attention.
              <div className="mt-2">
                <Link to="/invoices?filter=overdue">
                  <Button className="bg-red-600 hover:bg-red-700">View Overdue Invoices</Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-green-50 border-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-800">All Caught Up</AlertTitle>
            <AlertDescription className="text-green-700">
              You have no overdue invoices. Great job keeping on top of your finances!
            </AlertDescription>
          </Alert>
        )}

        <Alert className="bg-blue-50 border-blue-100">
          <Zap className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">Automation</AlertTitle>
          <AlertDescription className="text-blue-700">
            Set up automatic payment reminders for your clients with Zapier integration.
            <div className="mt-2">
              <Link to="/automation">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <span>Set Up Automation</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>

      {/* Recent Invoices */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Invoices</h2>
          <Link to="/invoices">
            <Button variant="outline" className="flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="bg-white rounded-lg border shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-3 px-4 font-medium">Invoice</th>
                <th className="text-left py-3 px-4 font-medium">Customer</th>
                <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Due Date</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.slice(0, 5).map((invoice) => (
                <tr key={invoice.id} className="border-t border-muted">
                  <td className="py-3 px-4">
                    <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{invoice.customer.name}</td>
                  <td className="py-3 px-4 hidden md:table-cell">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-medium">${invoice.total.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`payment-status-badge payment-status-${invoice.status}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
