'use client';
import Header from '../components/header';
import Footer from '../components/footer';
import PracticeClient from './practice-client';

export default function PracticeShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <PracticeClient />
      <Footer />
    </div>
  );
}
