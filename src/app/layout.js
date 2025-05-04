'use client';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className={`${inter.className} bg-yellow-50 text-gray-800 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}