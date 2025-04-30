import React from 'react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { RegisterForm } from '../../components/auth/RegisterForm';

export const Register: React.FC = () => {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
};