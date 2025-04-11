
import React from 'react';
import InvoiceList from '@/components/Invoices/InvoiceList';
import Layout from '@/components/Layout/Layout';

const InvoicesPage: React.FC = () => {
  return (
    <Layout>
      <InvoiceList />
    </Layout>
  );
};

export default InvoicesPage;
