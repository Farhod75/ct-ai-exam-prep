'use client';
import Header from '../components/header';
import Footer from '../components/footer';
import StudyPlanClient from './study-plan-client';

export default function StudyPlanShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <StudyPlanClient />
      <Footer />
    </div>
  );
}
