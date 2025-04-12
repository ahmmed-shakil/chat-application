"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/lib/features/auth/authSlice";
import AuthCard from "@/components/auth/auth-card";
import ChatLayout from "@/components/layout/chat-layout";

export default function Home() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues by delaying the render until client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  console.log(process.env.NEXT_PUBLIC_BACKEND_URL);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-950">
      {isAuthenticated ? (
        <ChatLayout />
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              WhatsApp Clone
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with friends and family
            </p>
          </div>
          <AuthCard />
        </div>
      )}
    </main>
  );
}
