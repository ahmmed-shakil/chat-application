'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import LoginForm from './login-form';
import RegisterForm from './register-form';

export default function AuthCard({ onSuccess }: { onSuccess?: () => void }) {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <Card className="w-full max-w-md bg-white dark:bg-gray-950 shadow-lg">
      <CardContent className="p-6">
        {isLogin ? (
          <LoginForm onSuccess={onSuccess} onToggle={toggleForm} />
        ) : (
          <RegisterForm onSuccess={onSuccess} onToggle={toggleForm} />
        )}
      </CardContent>
    </Card>
  );
}
