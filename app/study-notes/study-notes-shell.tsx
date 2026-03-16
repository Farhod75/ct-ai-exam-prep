'use client';
import Header from '../components/header';
import Footer from '../components/footer';
import StudyNotesClient from './study-notes-client';

export default function StudyNotesShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <StudyNotesClient />
      <Footer />
    </div>
  );
}
