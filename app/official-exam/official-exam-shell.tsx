'use client';
import Header from '../components/header';
import Footer from '../components/footer';
import OfficialExamClient from './official-exam-client';

export default function OfficialExamShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <OfficialExamClient />
      <Footer />
    </div>
  );
}
