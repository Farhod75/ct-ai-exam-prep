'use client';

export default function Footer() {
  return (
    <footer className="mt-auto py-4 px-4 border-t border-slate-200 bg-slate-50">
      <div className="max-w-[1200px] mx-auto text-center text-xs text-slate-500">
        <p>
          Content based on the{' '}
          <a 
            href="https://www.istqb.org/certifications/certified-tester-ai-testing-ct-ai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            ISTQB® CT-AI Syllabus
          </a>
          {' & '}
          <a 
            href="https://istqb.org/certifications/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline"
          >
            CT-GenAI Syllabus
          </a>
          . ISTQB® is a registered trademark of the International Software Testing Qualifications Board.
        </p>
        <p className="mt-1">For personal, non-commercial exam preparation use only.</p>
      </div>
    </footer>
  );
}
