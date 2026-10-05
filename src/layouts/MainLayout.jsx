import React from 'react';
import Header from '../components/organisms/Header';
import Footer from '../components/organisms/Footer';
import ChatbotDrawer from '../components/organisms/ChatbotDrawer';

/**
 * MainLayout
 * Shell for public-facing pages (Landing, Info)
 */
export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface font-body-md text-on-surface antialiased selection:bg-secondary-fixed selection:text-secondary-fixed-variant">
      {/* Sticky Top Navigation */}
      <Header />

      {/* Main Content Body */}
      <main className="flex-1 w-full pt-20 bg-surface">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
