'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BookOpen, Brain, ClipboardCheck, BarChart3, Layers, Calendar, LogOut, Menu, X, GraduationCap, ChevronDown } from 'lucide-react';
import { useCertification } from './certification-context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/practice', label: 'Practice', icon: ClipboardCheck },
  { href: '/mock-exam', label: 'Mock Exam', icon: Brain },
  { href: '/official-exam', label: 'Official Exam', icon: GraduationCap },
  { href: '/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/study-notes', label: 'Notes', icon: BookOpen },
  { href: '/study-plan', label: 'Study Plan', icon: Calendar },
];

export default function Header() {
  const { data: session } = useSession() || {};
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [certDropdown, setCertDropdown] = useState(false);
  const { certification, setCertification, certShortLabel } = useCertification();

  if (!session?.user) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary-600 text-lg">
            <GraduationCap className="w-6 h-6" />
            <span className="hidden sm:inline">ISTQB Prep</span>
          </Link>

          {/* Certification Switcher */}
          <div className="relative">
            <button
              onClick={() => setCertDropdown(!certDropdown)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                certification === 'CT-GenAI'
                  ? 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                  : 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {certShortLabel}
              <ChevronDown className="w-3 h-3" />
            </button>
            {certDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setCertDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 min-w-[200px]">
                  <button
                    onClick={() => { setCertification('CT-AI'); setCertDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                      certification === 'CT-AI' ? 'font-semibold text-blue-700 bg-blue-50' : 'text-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    CT-AI Testing
                  </button>
                  <button
                    onClick={() => { setCertification('CT-GenAI'); setCertDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2 ${
                      certification === 'CT-GenAI' ? 'font-semibold text-purple-700 bg-purple-50' : 'text-slate-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    CT-GenAI Testing
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? certification === 'CT-GenAI' ? 'bg-purple-600 text-white shadow-sm' : 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:block">{session?.user?.name ?? session?.user?.email ?? ''}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
          <button className="md:hidden p-1.5" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? certification === 'CT-GenAI' ? 'bg-purple-600 text-white' : 'bg-primary-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
