// src/app/shared-layout.jsx
'use client';
import Navbar from '@/components/common/Navbar';
import SecondaryNav from '@/components/common/SecondaryNav';
import Footer from '@/components/common/Footer';

export default function SharedLayout({ children }) {
  return (
    <>
      <Navbar />
      <SecondaryNav />
      {children}
      <Footer />
    </>
  );
}