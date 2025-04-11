
// Mock invoice data
const mockInvoices = [
  {
    id: '1',
    number: 'INV-001',
    clientName: 'Acme Corporation',
    clientEmail: 'billing@acme.com',
    amount: 2500,
    dueDate: '2025-04-15',
    status: 'overdue',
    description: 'Website Development Services',
    createdAt: '2025-03-15',
  },
  {
    id: '2',
    number: 'INV-002',
    clientName: 'TechStart Inc',
    clientEmail: 'finance@techstart.com',
    amount: 1800,
    dueDate: '2025-04-20',
    status: 'pending',
    description: 'Monthly Maintenance',
    createdAt: '2025-03-20',
  },
  {
    id: '3',
    number: 'INV-003',
    clientName: 'Global Solutions',
    clientEmail: 'accounts@globalsolutions.com',
    amount: 3200,
    dueDate: '2025-04-05',
    status: 'overdue',
    description: 'UI/UX Design Project',
    createdAt: '2025-03-05',
  },
  {
    id: '4',
    number: 'INV-004',
    clientName: 'Digital Marketing Pro',
    clientEmail: 'payments@dmpro.com',
    amount: 950,
    dueDate: '2025-04-30',
    status: 'pending',
    description: 'SEO Services for Q1',
    createdAt: '2025-03-25',
  },
  {
    id: '5',
    number: 'INV-005',
    clientName: 'Innovation Labs',
    clientEmail: 'finance@innovationlabs.com',
    amount: 4500,
    dueDate: '2025-04-12',
    status: 'overdue',
    description: 'Custom Software Development',
    createdAt: '2025-03-12',
  },
];

export const invoiceService = {
  // Get all invoices
  getInvoices: async () => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve(mockInvoices);
      }, 800);
    });
  },

  // Get invoice by id
  getInvoiceById: async (id) => {
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        const invoice = mockInvoices.find(inv => inv.id === id);
        if (invoice) {
          resolve(invoice);
        } else {
          reject(new Error('Invoice not found'));
        }
      }, 500);
    });
  },

  // Get overdue invoices
  getOverdueInvoices: async () => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const overdue = mockInvoices.filter(inv => inv.status === 'overdue');
        resolve(overdue);
      }, 800);
    });
  },
};
