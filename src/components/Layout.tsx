import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex bg-white">
      {showSidebar && <Sidebar />}
      <main className={`flex-1 ${showSidebar ? 'p-8' : 'p-4'}`}>
        {children}
      </main>
    </div>
  );
}