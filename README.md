# ISTQB CT-AI & CT-GenAI Exam Prep

A comprehensive, free exam preparation web app for two ISTQB specialist-level certifications:

- **CT-AI** — Certified Tester AI Testing (Testing AI-based systems)
- **CT-GenAI** — Certified Tester Testing with Generative AI

Built with Next.js, Prisma, PostgreSQL, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6.7-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)

---

## Features

### Certification Switcher
Seamlessly toggle between CT-AI and CT-GenAI from the header. All content, progress, and study plans are tracked independently per certification.

### Practice Quizzes
Filter questions by chapter, difficulty, and topic. Immediate feedback with detailed explanations for every answer.

| Certification | Practice Questions | Chapters |
|---|---|---|
| CT-AI | 220 | 11 |
| CT-GenAI | 200 | 5 |

### Mock Exams
Simulate real exam conditions with a timed 40-question exam (60 minutes, 65% passing score). Questions are randomly selected across all chapters.

### Official Sample Exam
Practice with the actual ISTQB official sample questions, including point-weighted scoring.

| Certification | Official Questions |
|---|---|
| CT-AI | 40 |
| CT-GenAI | 43 |

### Flashcards
Interactive flip cards for quick revision, filterable by chapter.

| Certification | Flashcards |
|---|---|
| CT-AI | 151 |
| CT-GenAI | 120 |

### Study Notes
Comprehensive chapter-by-chapter notes with key terms, learning objectives, and detailed content aligned to the official syllabus.

### 14-Day Study Plan
A structured day-by-day plan with checkable tasks, tailored to each certification's syllabus structure.

### Progress Dashboard
Track your preparation with:
- Overall accuracy percentage
- Chapter-by-chapter performance bar chart
- Mock exam score history
- Weak area identification
- Exam readiness score

---

## Exam Details

| | CT-AI | CT-GenAI |
|---|---|---|
| **Full Name** | Certified Tester AI Testing | Certified Tester Testing with Generative AI |
| **Level** | Specialist | Specialist |
| **Prerequisite** | CTFL (Foundation Level) | CTFL (Foundation Level) |
| **Questions** | 40 MCQs | 40 MCQs |
| **Duration** | 60 minutes | 60 minutes |
| **Passing Score** | 65% (26/40) | 65% (26/40) |
| **Chapters** | 11 | 5 |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **Authentication:** NextAuth.js (Email/Password + Google SSO)
- **Analytics:** Google Analytics 4
- **Icons:** Lucide React

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Farhod75/ct-ai-exam-prep.git
   cd ct-ai-exam-prep
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in your actual values (see [Environment Variables](#environment-variables) below).

4. **Set up the database:**
   ```bash
   yarn prisma generate
   yarn prisma db push
   ```

5. **Seed the database:**
   ```bash
   yarn prisma db seed
   ```

6. **Run the development server:**
   ```bash
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env` file in the root directory. See `.env.example` for the template.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth JWT signing (generate with `openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (for Google SSO) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID |

---

## Project Structure

```
├── app/
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── flashcards/       # Flashcards CRUD
│   │   ├── official-exam/    # Official sample questions
│   │   ├── progress/         # User progress metrics
│   │   ├── questions/        # Practice questions
│   │   ├── quiz-attempt/     # Quiz attempt tracking
│   │   ├── study-notes/      # Study notes
│   │   └── study-plan/       # 14-day study plan
│   ├── components/           # Shared UI components
│   │   ├── header.tsx        # Navigation with cert switcher
│   │   ├── footer.tsx        # Footer with ISTQB attribution
│   │   ├── certification-context.tsx  # Certification state management
│   │   └── chapter-names.ts  # Chapter names for both certs
│   ├── dashboard/            # Progress dashboard
│   ├── practice/             # Practice quiz mode
│   ├── mock-exam/            # Timed mock exam
│   ├── official-exam/        # Official sample exam
│   ├── flashcards/           # Flashcard review
│   ├── study-notes/          # Chapter study notes
│   ├── study-plan/           # 14-day study plan
│   ├── login/                # Login page
│   └── signup/               # Signup page
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── prisma.ts             # Prisma client singleton
│   └── db.ts                 # Database utilities
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/
│   └── seed.ts               # Database seeding script
└── public/                   # Static assets
```

---

## CT-GenAI Syllabus Chapters

1. Introduction to Generative AI for Software Testing
2. Prompt Engineering for Effective Software Testing
3. Managing Risks of Generative AI in Software Testing
4. LLM-Powered Test Infrastructure for Software Testing
5. Deploying and Integrating Generative AI in Test Organizations

## CT-AI Syllabus Chapters

1. Introduction to AI
2. Quality Characteristics and Test Approaches
3. AI Risks
4. Introduction to Machine Learning
5. ML Functional Performance Metrics
6. Data Quality & Test Data
7. Testing AI-Specific Quality Characteristics
8. Methods & Techniques for Testing ML Systems
9. AI Test Environments
10. AI-Based Testing
11. Ethics and Responsible AI

---

## Attribution

This is a **free, non-commercial** exam preparation tool. All syllabus content is based on the official ISTQB syllabi:

- [ISTQB CT-AI Syllabus](https://www.istqb.org/certifications/certified-tester-ai-testing-ct-ai/)
- [ISTQB CT-GenAI Syllabus](https://istqb.org/certifications/)

**ISTQB®** is a registered trademark of the International Software Testing Qualifications Board.

---

## License

This project is for personal educational use. Not affiliated with or endorsed by ISTQB.
