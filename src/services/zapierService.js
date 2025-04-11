
// This file simulates integration with Zapier
// In a real application, you would integrate with the actual Zapier API

// Mock Zapier integrations
const mockZaps = [
  {
    id: '1',
    name: 'Send Email Reminder for Overdue Invoices',
    description: 'Automatically send an email reminder when an invoice becomes overdue',
    status: 'active',
    lastRun: '2025-04-09T14:30:00Z',
  },
  {
    id: '2',
    name: 'Create Follow-up Task in Trello',
    description: 'Create a card in Trello when an invoice is overdue by more than 7 days',
    status: 'active',
    lastRun: '2025-04-08T10:15:00Z',
  },
  {
    id: '3',
    name: 'Send SMS Notification for High-Value Invoices',
    description: 'Send SMS alert when high-value invoices (>$2000) are overdue',
    status: 'inactive',
    lastRun: null,
  },
];

export const zapierService = {
  // Get all Zap integrations
  getIntegrations: async () => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        resolve(mockZaps);
      }, 800);
    });
  },

  // Trigger a specific Zap
  triggerZap: async (zapId, payload) => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        console.log(`Triggered Zap ${zapId} with payload:`, payload);
        resolve({
          success: true,
          message: 'Zap triggered successfully',
          timestamp: new Date().toISOString(),
        });
      }, 1200);
    });
  },

  // Toggle Zap status (activate/deactivate)
  toggleZapStatus: async (zapId) => {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const zap = mockZaps.find(z => z.id === zapId);
        if (zap) {
          zap.status = zap.status === 'active' ? 'inactive' : 'active';
        }
        resolve({
          success: true,
          status: zap.status,
        });
      }, 600);
    });
  },
};
