'use client'
import React from 'react';
import { AuthProvider } from '@/context/AuthContext'; 

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  
  return (
     <AuthProvider>
    
        {children}
     
     </AuthProvider>
  );
}