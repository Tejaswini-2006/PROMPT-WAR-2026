import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PaisaPilot AI — Your Predictive Financial Copilot',
  description: 'AI-enabled predictive budgeting, cashflow runway projection, and financial decision replay for young salaried Indians.',
  keywords: [
    'PaisaPilot',
    'Personal Finance India',
    'UPI Budgeting',
    'Financial Copilot',
    'Predictive Cashflow',
    'PromptWars 2026',
    'Gemini AI',
  ],
  authors: [{ name: 'Tejaswini' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-[#070d1e] text-slate-100 antialiased selection:bg-teal-500/30 selection:text-teal-200">
        {children}
      </body>
    </html>
  );
}
