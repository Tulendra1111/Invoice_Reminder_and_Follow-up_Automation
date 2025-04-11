
export interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: Customer;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  notes?: string;
  remindersSent: number;
}

class InvoiceService {
  private mockInvoices: Invoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-001',
      customer: {
        id: 'c1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        company: 'ABC Corp',
        phone: '123-456-7890'
      },
      issueDate: '2025-03-15',
      dueDate: '2025-04-15',
      items: [
        {
          id: 'item1',
          description: 'Website Development',
          quantity: 1,
          rate: 2500,
          amount: 2500
        },
        {
          id: 'item2',
          description: 'Hosting (Annual)',
          quantity: 1,
          rate: 300,
          amount: 300
        }
      ],
      subtotal: 2800,
      tax: 140,
      total: 2940,
      status: 'pending',
      notes: 'Payment due within 30 days',
      remindersSent: 0
    },
    {
      id: '2',
      invoiceNumber: 'INV-002',
      customer: {
        id: 'c2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        company: 'XYZ Ltd',
        phone: '987-654-3210'
      },
      issueDate: '2025-03-01',
      dueDate: '2025-04-01',
      items: [
        {
          id: 'item3',
          description: 'Logo Design',
          quantity: 1,
          rate: 800,
          amount: 800
        }
      ],
      subtotal: 800,
      tax: 40,
      total: 840,
      status: 'overdue',
      notes: '',
      remindersSent: 2
    },
    {
      id: '3',
      invoiceNumber: 'INV-003',
      customer: {
        id: 'c3',
        name: 'Carol Davis',
        email: 'carol@example.com',
        company: 'Davis & Co',
        phone: '555-123-4567'
      },
      issueDate: '2025-02-15',
      dueDate: '2025-03-15',
      items: [
        {
          id: 'item4',
          description: 'SEO Services',
          quantity: 1,
          rate: 1200,
          amount: 1200
        },
        {
          id: 'item5',
          description: 'Content Creation',
          quantity: 5,
          rate: 100,
          amount: 500
        }
      ],
      subtotal: 1700,
      tax: 85,
      total: 1785,
      status: 'paid',
      notes: 'Thank you for your business',
      remindersSent: 0
    },
    {
      id: '4',
      invoiceNumber: 'INV-004',
      customer: {
        id: 'c4',
        name: 'David Wilson',
        email: 'david@example.com',
        company: 'Wilson Technologies',
        phone: '555-987-6543'
      },
      issueDate: '2025-03-20',
      dueDate: '2025-04-20',
      items: [
        {
          id: 'item6',
          description: 'Mobile App Development',
          quantity: 1,
          rate: 5000,
          amount: 5000
        }
      ],
      subtotal: 5000,
      tax: 250,
      total: 5250,
      status: 'pending',
      notes: 'First installment',
      remindersSent: 0
    },
    {
      id: '5',
      invoiceNumber: 'INV-005',
      customer: {
        id: 'c5',
        name: 'Eva Brown',
        email: 'eva@example.com',
        company: 'Brown Designs',
        phone: '555-555-5555'
      },
      issueDate: '2025-02-01',
      dueDate: '2025-03-01',
      items: [
        {
          id: 'item7',
          description: 'UI/UX Design',
          quantity: 1,
          rate: 1800,
          amount: 1800
        }
      ],
      subtotal: 1800,
      tax: 90,
      total: 1890,
      status: 'overdue',
      notes: '',
      remindersSent: 3
    }
  ];

  public async getInvoices(): Promise<Invoice[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...this.mockInvoices];
  }

  public async getInvoice(id: string): Promise<Invoice | undefined> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockInvoices.find(invoice => invoice.id === id);
  }

  public async getOverdueInvoices(): Promise<Invoice[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.mockInvoices.filter(invoice => invoice.status === 'overdue');
  }

  public async sendReminder(invoiceId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const invoice = this.mockInvoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      invoice.remindersSent += 1;
      console.log(`Reminder sent for invoice ${invoiceId}. Total reminders: ${invoice.remindersSent}`);
    }
  }
}

export const invoiceService = new InvoiceService();
