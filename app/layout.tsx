import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

import './globals.css';
import Footer from '@/components/Footer';
import { FeatureFlagsProvider } from '@/lib/FeatureFlagsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Todo List App',
  description: 'A simple todo list application with AWS DynamoDB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FeatureFlagsProvider>
          <div className="flex min-h-screen flex-col bg-gray-50">
            <header className="border-b bg-white shadow-sm">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">Todo List Manager</h1>
                  <nav className="flex space-x-4">
                    <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                      Home
                    </Link>
                  </nav>
                </div>
              </div>
            </header>
            <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>
        </FeatureFlagsProvider>
      </body>
    </html>
  );
}
