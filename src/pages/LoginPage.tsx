
import React from 'react';
import Login from '@/components/Auth/Login';
import Layout from '@/components/Layout/Layout';

const LoginPage: React.FC = () => {
  return (
    <Layout requireAuth={false}>
      <Login />
    </Layout>
  );
};

export default LoginPage;
