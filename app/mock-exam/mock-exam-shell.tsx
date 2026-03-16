'use client';
import Header from '../components/header';
import Footer from '../components/footer';
import MockExamClient from './mock-exam-client';

export default function MockExamShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MockExamClient />
      <Footer />
    </div>
  );
}
