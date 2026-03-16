'use client';
import Header from '../components/header';
import Footer from '../components/footer';
import DashboardClient from './dashboard-client';

export default function DashboardShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <DashboardClient />
      <Footer />
    </div>
  );
}
