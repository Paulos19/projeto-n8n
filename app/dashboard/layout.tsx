"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar'; 
import { Menu, X } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner'; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background"> {}
      {}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {}
      <div className="flex-1 flex flex-col overflow-hidden">
        {}
        <header className="bg-card shadow md:hidden print:hidden"> {}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <span className="font-semibold text-xl text-foreground">R.A.I.O</span> {}
              </div>
              <div className="flex md:hidden">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary" 
                  aria-controls="mobile-menu"
                  aria-expanded={sidebarOpen}
                >
                  <span className="sr-only">Abrir menu principal</span>
                  {sidebarOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 dark:bg-muted/10 p-4 md:p-6 lg:p-8"> {}
          <>
            {children}
            <Toaster richColors position="top-right" />
          </>
        </main>
      </div>

      {}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden print:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}