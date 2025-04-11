
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Invoice, invoiceService } from '@/services/invoiceService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FileText } from 'lucide-react';

type StatusFilter = 'all' | 'paid' | 'pending' | 'overdue';

const InvoiceList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await invoiceService.getInvoices();
        setInvoices(data);
        setFilteredInvoices(data);
        
        // Check if there's a filter in URL params
        const filterParam = searchParams.get('filter');
        if (filterParam && ['paid', 'pending', 'overdue'].includes(filterParam)) {
          setStatusFilter(filterParam as StatusFilter);
        }
      } catch (error) {
        console.error('Failed to fetch invoices', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [searchParams]);

  useEffect(() => {
    // Apply filters
    let results = [...invoices];
    
    if (statusFilter !== 'all') {
      results = results.filter(invoice => invoice.status === statusFilter);
    }
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      results = results.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(lowerSearchTerm) ||
        invoice.customer.name.toLowerCase().includes(lowerSearchTerm) ||
        invoice.customer.company?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    setFilteredInvoices(results);
    
    // Update URL params
    if (statusFilter !== 'all') {
      searchParams.set('filter', statusFilter);
    } else {
      searchParams.delete('filter');
    }
    setSearchParams(searchParams);
  }, [statusFilter, searchTerm, invoices, searchParams, setSearchParams]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <Skeleton className="h-10 w-40 mb-4 md:mb-0" />
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Skeleton className="h-10 w-full md:w-60" />
            <Skeleton className="h-10 w-full md:w-40" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border shadow">
          <div className="py-4 px-6">
            <Skeleton className="h-16 w-full" />
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="border-t py-3 px-6">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Invoices</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-lg border shadow p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No invoices found</h3>
          <p className="text-muted-foreground mb-6">
            {statusFilter !== 'all' 
              ? `No ${statusFilter} invoices match your search.`
              : "No invoices match your search criteria."}
          </p>
          {searchTerm || statusFilter !== 'all' ? (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left py-3 px-4 font-medium">Invoice</th>
                <th className="text-left py-3 px-4 font-medium">Customer</th>
                <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Issue Date</th>
                <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Due Date</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-muted">
                  <td className="py-3 px-4">
                    <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline font-medium">
                      {invoice.invoiceNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium">{invoice.customer.name}</div>
                    {invoice.customer.company && (
                      <div className="text-sm text-muted-foreground">{invoice.customer.company}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-medium">${invoice.total.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`payment-status-badge payment-status-${invoice.status}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link to={`/invoices/${invoice.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
