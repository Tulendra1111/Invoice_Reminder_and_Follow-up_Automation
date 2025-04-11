
import React, { useState, useEffect } from 'react';
import { invoiceService } from '@/services/invoiceService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MoreHorizontal, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const data = await invoiceService.getInvoices();
        setInvoices(data);
        setFilteredInvoices(data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: "Error",
          description: "Failed to fetch invoices. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredInvoices(invoices);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = invoices.filter(invoice => 
        invoice.clientName.toLowerCase().includes(query) || 
        invoice.number.toLowerCase().includes(query) || 
        invoice.description.toLowerCase().includes(query)
      );
      setFilteredInvoices(filtered);
    }
  }, [searchQuery, invoices]);

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

  const handleViewDetails = (invoiceId) => {
    navigate(`/invoices/${invoiceId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage and track all your invoices</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search invoices..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 ml-auto">
          <Button variant="outline">
            Filter
          </Button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array(5).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredInvoices.length > 0 ? (
              // Invoice data
              filteredInvoices.map(invoice => (
                <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(invoice.id)}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell className="text-right">
                    <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(invoice.id)}>
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Send reminder</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // No results
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvoiceList;
