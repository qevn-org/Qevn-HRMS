import React from 'react';
import { MaximalistShell } from '@/components/layout/MaximalistShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <MaximalistShell>{children}</MaximalistShell>;
}
