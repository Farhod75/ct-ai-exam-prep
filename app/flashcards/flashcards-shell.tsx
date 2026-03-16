'use client';
import Header from '../components/header';
import Footer from '../components/footer';
import FlashcardsClient from './flashcards-client';

export default function FlashcardsShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <FlashcardsClient />
      <Footer />
    </div>
  );
}
