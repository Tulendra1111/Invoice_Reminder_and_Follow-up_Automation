
import React, { useEffect, useState } from 'react';
import { invoiceService } from '@/services/invoiceService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, DollarSign, FileText, Clock } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [overdueInvoices, setOverdueInvoices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [allInvoices, overdueInvoices] = await Promise.all([
          invoiceService.getInvoices(),
          invoiceService.getOverdueInvoices()
        ]);
        
        setInvoices(allInvoices);
        setOverdueInvoices(overdueInvoices);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalInvoiceAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalOverdueAmount = overdueInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track and manage your invoices</p>
        </div>
        <Button 
          onClick={() => navigate('/invoices')} 
          className="mt-4 md:mt-0"
        >
          View All Invoices
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Invoices Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{invoices.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-28 mt-1" />
              ) : (
                `${overdueInvoices.length} overdue`
              )}
            </p>
          </CardContent>
        </Card>

        {/* Total Amount Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                ${totalInvoiceAmount.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-28 mt-1" />
              ) : (
                `${invoices.length} active invoices`
              )}
            </p>
          </CardContent>
        </Card>

        {/* Overdue Amount Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-destructive">
                ${totalOverdueAmount.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {loading ? (
                <Skeleton className="h-4 w-28 mt-1" />
              ) : (
                `${overdueInvoices.length} overdue invoices`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Invoices */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Overdue Invoices</h2>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-48 mt-2" />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : overdueInvoices.length > 0 ? (
          <div className="space-y-4">
            {overdueInvoices.map((invoice) => (
              <Card key={invoice.id} className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{invoice.number} - {invoice.clientName}</h3>
                      <p className="text-sm text-muted-foreground">{invoice.description}</p>
                      <div className="mt-2 text-sm">
                        Due: <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold">${invoice.amount.toLocaleString()}</div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No overdue invoices</AlertTitle>
            <AlertDescription>
              All of your invoices are up to date. Nice job!
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Reminders</CardTitle>
              <CardDescription>
                Send automatic reminders for overdue invoices
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/automation')} variant="outline">
                Set Up Reminders
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>
                Manage your invoice follow-up workflows
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/automation')} variant="outline">
                Configure Automations
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
