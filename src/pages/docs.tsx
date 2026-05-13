import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  GraduationCap, BookOpen, Shield, Upload, MessageSquare,
  Users, FileText, Zap, ChevronRight, AlertCircle,
  CheckCircle2, Code, Database, Globe, Sparkles,
  ArrowRight, Info, Building2, Clock
} from 'lucide-react';

const NAV = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'how-it-works', label: 'How It Works', icon: Zap },
  { id: 'accounts', label: 'Account Types', icon: Users },
  { id: 'admin-guide', label: 'Admin Guide', icon: Shield },
  { id: 'student-guide', label: 'Student Guide', icon: GraduationCap },
  { id: 'ai-providers', label: 'AI Providers', icon: Sparkles },
  { id: 'categories', label: 'Document Categories', icon: FileText },
  { id: 'api', label: 'API Reference', icon: Code },
  { id: 'faq', label: 'FAQ', icon: Info },
];

const CATEGORIES = [
  { name: 'Placement Policy', icon: Shield, color: 'text-amber-400', desc: 'Eligibility criteria, placement process, company blacklist rules, CGPA cutoffs, number of attempts allowed, dress code, and offer acceptance policies.' },
  { name: 'Class Schedules', icon: Clock, color: 'text-blue-400', desc: 'Timetables, lab session timings, room allocations, exam schedules, and any schedule change announcements.' },
  { name: 'Faculty Info', icon: Users, color: 'text-green-400', desc: 'Teacher profiles, HOD contacts, department heads, office hours, cabin numbers, and email addresses.' },
  { name: 'Placements', icon: Building2, color: 'text-purple-400', desc: 'Company visit history, packages offered, roles available, selection process details, and upcoming drive announcements.' },
  { name: 'Study Material', icon: BookOpen, color: 'text-rose-400', desc: 'Lecture notes, reference books, previous year question papers, syllabus documents, and lab manuals.' },
  { name: 'College Policies', icon: FileText, color: 'text-orange-400', desc: 'Attendance rules, fee payment deadlines, hostel policies, library rules, anti-ragging policies, and holiday lists.' },
  { name: 'General', icon: Globe, color: 'text-cyan-400', desc: 'Any other college-related documents that don\'t fit the above categories.' },
];

const API_ENDPOINTS = [
  { method: 'POST', path: '/api/auth/register', auth: 'None', desc: 'Register a new student or admin account' },
  { method: 'POST', path: '/api/auth/login', auth: 'None', desc: 'Authenticate and receive a JWT token' },
  { method: 'GET', path: '/api/auth/me', auth: 'Bearer', desc: 'Get the currently authenticated user' },
  { method: 'POST', path: '/api/chat/ask', auth: 'Bearer', desc: 'Ask a question and get an AI-powered answer' },
  { method: 'GET', path: '/api/chat/history', auth: 'Bearer', desc: 'Retrieve chat history for the current user' },
  { method: 'GET', path: '/api/knowledge', auth: 'Bearer', desc: 'Get document count and knowledge base stats' },
  { method: 'GET', path: '/api/admin/documents', auth: 'Admin', desc: 'List all documents in the knowledge base' },
  { method: 'POST', path: '/api/admin/documents/upload', auth: 'Admin', desc: 'Upload a PDF to the knowledge base' },
  { method: 'POST', path: '/api/admin/documents/delete', auth: 'Admin', desc: 'Delete a document and its vectors' },
  { method: 'GET', path: '/api/admin/openai-key', auth: 'Admin', desc: 'Get current AI provider configuration status' },
  { method: 'POST', path: '/api/admin/openai-key', auth: 'Admin', desc: 'Save an OpenAI or Gemini API key' },
  { method: 'DELETE', path: '/api/admin/openai-key', auth: 'Admin', desc: 'Remove a configured API key' },
  { method: 'POST', path: '/api/admin/ai-provider', auth: 'Admin', desc: 'Switch the active AI provider' },
];

const FAQS = [
  {
    q: 'Can students upload documents?',
    a: 'No. Only admin (coordinator) accounts can upload documents. Students can only ask questions against the shared knowledge base.',
  },
  {
    q: 'What happens to documents when the server restarts?',
    a: 'CampusIQ currently uses in-memory storage. All uploaded documents and vectors are lost on restart. This is a known limitation of the MVP — a persistent database (MySQL/PostgreSQL) is planned for future versions.',
  },
  {
    q: 'Why does my admin registration fail?',
    a: 'Admin accounts require two things: the correct admin code (STUDYRAG_ADMIN) AND an institutional email ending in .edu, .ac.in, or .edu.in. Students can register with any email without an admin code.',
  },
  {
    q: 'Can I use both OpenAI and Gemini?',
    a: 'You can store keys for both providers, but only one is active at a time. Switch between them anytime from the Admin panel → AI Provider tab. Note: documents indexed with one provider\'s embeddings may not work well when switching providers — re-upload documents after switching.',
  },
  {
    q: 'What file types are supported?',
    a: 'Currently only PDF files are supported, up to 20MB per file. Support for Word documents and plain text files is planned.',
  },
  {
    q: 'How accurate are the answers?',
    a: 'CampusIQ only answers from the documents you upload — it does not make up information. If a question cannot be answered from the knowledge base, it will say so and suggest contacting the coordinator directly.',
  },
  {
    q: 'Is chat history saved?',
    a: 'Chat history is saved per user in memory for the current server session. It is cleared when the server restarts.',
  },
  {
    q: 'How many documents can I upload?',
    a: 'There is no hard limit on the number of documents. However, since vectors are stored in memory, very large knowledge bases (100+ large PDFs) may impact performance.',
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">CampusIQ</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Documentation</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Link to="/register">
              <Badge variant="default" className="cursor-pointer">Get Started</Badge>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 flex gap-10">
        {/* Sidebar nav */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <nav className="sticky top-24 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Contents</p>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  activeSection === id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 space-y-16">

          {/* ── Overview ─────────────────────────────────────────── */}
          <section id="overview">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">CampusIQ Documentation</h1>
                <p className="text-muted-foreground text-sm mt-0.5">v1.0 · Last updated May 2026</p>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              CampusIQ is an AI-powered college assistant that lets students ask everyday questions
              about their institution — placement policies, class schedules, faculty contacts,
              attendance rules, and more — and get instant, accurate answers sourced directly
              from official college documents.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: MessageSquare, title: 'Natural Language Q&A', desc: 'Students ask questions in plain English, no search keywords needed.' },
                { icon: FileText, title: 'Document-Grounded', desc: 'Every answer is sourced from uploaded PDFs — no hallucinations.' },
                { icon: Shield, title: 'Role-Based Access', desc: 'Admins manage the knowledge base; students only ask questions.' },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border-border/60">
                  <CardContent className="pt-5 pb-4">
                    <Icon className="h-6 w-6 text-primary mb-3" />
                    <h3 className="font-semibold mb-1 text-sm">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <Separator />

          {/* ── How It Works ─────────────────────────────────────── */}
          <section id="how-it-works">
            <SectionHeader icon={Zap} title="How It Works" />
            <p className="text-muted-foreground mb-8">
              CampusIQ uses a <strong className="text-foreground">Retrieval-Augmented Generation (RAG)</strong> pipeline.
              Here's the full flow from document upload to student answer:
            </p>

            <div className="space-y-4">
              {[
                {
                  step: '1',
                  title: 'Admin uploads a PDF',
                  detail: 'The coordinator uploads a PDF (e.g. Placement Policy 2025.pdf) and assigns it a category. The file is accepted up to 20MB.',
                  icon: Upload,
                },
                {
                  step: '2',
                  title: 'Text extraction',
                  detail: 'The server extracts all text from the PDF using pdf-parse. Page count is recorded for display in the admin panel.',
                  icon: FileText,
                },
                {
                  step: '3',
                  title: 'Chunking',
                  detail: 'The extracted text is split into overlapping chunks of ~1000 characters with a 200-character overlap. This ensures context is not lost at chunk boundaries.',
                  icon: Database,
                },
                {
                  step: '4',
                  title: 'Embedding generation',
                  detail: 'Each chunk is converted into a numerical vector (embedding) using the configured AI provider — OpenAI text-embedding-3-small or Gemini gemini-embedding-001. These vectors capture semantic meaning.',
                  icon: Sparkles,
                },
                {
                  step: '5',
                  title: 'Vector storage',
                  detail: 'All vectors are stored in an in-memory vector store, indexed by document ID. The document status changes to "ready" once all chunks are embedded.',
                  icon: Database,
                },
                {
                  step: '6',
                  title: 'Student asks a question',
                  detail: 'The student\'s question is embedded using the same model. Cosine similarity is computed against all stored vectors to find the top 5 most relevant chunks.',
                  icon: MessageSquare,
                },
                {
                  step: '7',
                  title: 'AI generates an answer',
                  detail: 'The top 5 chunks are passed as context to GPT-4 (OpenAI) or Gemini 2.5 Flash (Google). The model generates a concise, student-friendly answer with source citations.',
                  icon: Zap,
                },
              ].map(({ step, title, detail, icon: Icon }) => (
                <div key={step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {step}
                  </div>
                  <div className="flex-1 pb-4 border-b border-border/40 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">{title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* ── Account Types ─────────────────────────────────────── */}
          <section id="accounts">
            <SectionHeader icon={Users} title="Account Types" />
            <p className="text-muted-foreground mb-6">
              CampusIQ has two distinct account types with different permissions and registration requirements.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Student */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-400" />
                    <CardTitle className="text-base">Student Account</CardTitle>
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1.5">Registration requirements</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> Any valid email address</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> Full name</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> Password (min. 6 characters)</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> No admin code needed</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1.5">Permissions</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> Ask questions via chat</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> View chat history</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> See document count</li>
                      <li className="flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" /> Cannot upload documents</li>
                      <li className="flex items-center gap-2"><AlertCircle className="h-3.5 w-3.5 text-red-400 flex-shrink-0" /> Cannot access admin panel</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Admin */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Admin (Coordinator) Account</CardTitle>
                    <Badge className="text-xs">Restricted</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1.5">Registration requirements</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> Admin code: <code className="bg-muted px-1 rounded font-mono text-xs">STUDYRAG_ADMIN</code></li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> Institutional email required</li>
                      <li className="flex items-center gap-2 pl-5 text-xs">Accepted: <code className="bg-muted px-1 rounded font-mono">.edu</code> · <code className="bg-muted px-1 rounded font-mono">.ac.in</code> · <code className="bg-muted px-1 rounded font-mono">.edu.in</code> · <code className="bg-muted px-1 rounded font-mono">.ac.uk</code></li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> Full name + password</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1.5">Permissions</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> All student permissions</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> Upload & delete documents</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> Configure AI provider keys</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> Switch between OpenAI / Gemini</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-green-400 flex-shrink-0" /> View all knowledge base stats</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <Separator />

          {/* ── Admin Guide ───────────────────────────────────────── */}
          <section id="admin-guide">
            <SectionHeader icon={Shield} title="Admin Guide" />
            <p className="text-muted-foreground mb-8">Step-by-step guide for program coordinators setting up CampusIQ.</p>

            <div className="space-y-8">
              <StepCard
                number="Step 1"
                title="Create your admin account"
                color="text-amber-400"
              >
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Go to <Link to="/register" className="text-primary hover:underline">/register</Link></li>
                  <li>Enter your name and your <strong className="text-foreground">institutional email</strong> (e.g. <code className="bg-muted px-1 rounded text-xs">coordinator@college.ac.in</code>)</li>
                  <li>Click <em>"Program coordinator? Enter admin code"</em> to expand the admin code field</li>
                  <li>Enter the admin code: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">STUDYRAG_ADMIN</code></li>
                  <li>Submit — you'll be redirected to the Admin Panel</li>
                </ol>
              </StepCard>

              <StepCard number="Step 2" title="Configure your AI provider" color="text-blue-400">
                <p className="text-sm text-muted-foreground mb-3">
                  CampusIQ needs an AI API key to process documents and answer questions.
                  You can use either OpenAI or Google Gemini (or both).
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <p className="font-medium mb-1 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-400" /> OpenAI</p>
                    <p className="text-xs text-muted-foreground mb-2">Uses GPT-4 for answers + text-embedding-3-small for indexing.</p>
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      Get key at platform.openai.com <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <p className="font-medium mb-1 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-blue-400" /> Google Gemini</p>
                    <p className="text-xs text-muted-foreground mb-2">Uses Gemini 2.5 Flash for answers + gemini-embedding-001 for indexing. Free tier available.</p>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      Get key at aistudio.google.com <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </StepCard>

              <StepCard number="Step 3" title="Upload documents" color="text-green-400">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>In the Admin Panel, scroll to <strong className="text-foreground">Upload Documents</strong></li>
                  <li>Select the appropriate <strong className="text-foreground">category</strong> from the dropdown (e.g. "Placement Policy")</li>
                  <li>Click <strong className="text-foreground">Choose PDF</strong> and select your file (max 20MB)</li>
                  <li>The document will appear in the list with status <Badge variant="secondary" className="text-xs">processing</Badge></li>
                  <li>Once embedding is complete, status changes to <Badge className="text-xs">ready</Badge></li>
                  <li>Students can now ask questions about this document</li>
                </ol>
                <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  <strong>Tip:</strong> Upload documents one category at a time. Well-categorized documents improve answer accuracy.
                </div>
              </StepCard>

              <StepCard number="Step 4" title="Monitor the knowledge base" color="text-purple-400">
                <p className="text-sm text-muted-foreground">
                  The admin panel shows real-time stats: total documents, ready count, processing count, and active categories.
                  Documents with <Badge variant="destructive" className="text-xs">error</Badge> status failed during processing —
                  check the error message and try re-uploading. Common causes: corrupted PDF, scanned image-only PDF (no text layer), or missing AI key.
                </p>
              </StepCard>
            </div>
          </section>

          <Separator />

          {/* ── Student Guide ─────────────────────────────────────── */}
          <section id="student-guide">
            <SectionHeader icon={GraduationCap} title="Student Guide" />
            <p className="text-muted-foreground mb-8">Everything a student needs to know to use CampusIQ.</p>

            <div className="space-y-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Getting started</h3>
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground pl-2">
                  <li>Go to <Link to="/register" className="text-primary hover:underline">/register</Link> and create an account with any email</li>
                  <li>You'll be taken to the <strong className="text-foreground">Dashboard</strong> automatically</li>
                  <li>Type your question in the chat box and press Enter or click Send</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-blue-400" /> What to ask</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    '"What is the minimum CGPA for placements?"',
                    '"Who is the HOD of Computer Science?"',
                    '"What are the lab timings for Semester 4?"',
                    '"How many leaves am I allowed per semester?"',
                    '"Which companies visited campus last year?"',
                    '"What is the fee payment deadline?"',
                    '"What is the attendance requirement?"',
                    '"Who do I contact for placement registration?"',
                  ].map((q) => (
                    <div key={q} className="p-2.5 rounded-lg bg-muted/30 border border-border text-xs text-muted-foreground italic">
                      {q}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-400" /> Understanding answers</h3>
                <ul className="space-y-2 text-muted-foreground pl-2">
                  <li>• Answers include <strong className="text-foreground">source citations</strong> — you can see which document the answer came from</li>
                  <li>• If CampusIQ says it couldn't find information, the document may not have been uploaded yet — contact your coordinator</li>
                  <li>• Answers are only as accurate as the documents uploaded — always verify critical information with official sources</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          {/* ── AI Providers ──────────────────────────────────────── */}
          <section id="ai-providers">
            <SectionHeader icon={Sparkles} title="AI Providers" />
            <p className="text-muted-foreground mb-6">
              CampusIQ supports two AI providers. Both can be configured simultaneously; only one is active at a time.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Feature</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">OpenAI</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Google Gemini</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {[
                    ['Chat model', 'GPT-4', 'Gemini 2.5 Flash'],
                    ['Embedding model', 'text-embedding-3-small', 'gemini-embedding-001'],
                    ['Embedding dimensions', '1536', '768'],
                    ['Free tier', '❌ Paid only', '✅ Free tier available'],
                    ['Key format', 'Starts with sk-', 'Starts with AIza'],
                    ['Get key at', 'platform.openai.com', 'aistudio.google.com'],
                  ].map(([feature, openai, gemini]) => (
                    <tr key={feature} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{feature}</td>
                      <td className="py-3 px-4 text-muted-foreground">{openai}</td>
                      <td className="py-3 px-4 text-muted-foreground">{gemini}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
              <strong>Important:</strong> If you switch providers after uploading documents, the existing embeddings were generated with the old provider's model. Re-upload your documents after switching to ensure consistent search quality.
            </div>
          </section>

          <Separator />

          {/* ── Document Categories ───────────────────────────────── */}
          <section id="categories">
            <SectionHeader icon={FileText} title="Document Categories" />
            <p className="text-muted-foreground mb-6">
              Assign the correct category when uploading documents. Categories help organize the knowledge base and improve answer relevance.
            </p>
            <div className="space-y-3">
              {CATEGORIES.map(({ name, icon: Icon, color, desc }) => (
                <div key={name} className="flex gap-4 p-4 rounded-lg border border-border/60 bg-card/30">
                  <Icon className={`h-5 w-5 ${color} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="font-semibold text-sm mb-1">{name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* ── API Reference ─────────────────────────────────────── */}
          <section id="api">
            <SectionHeader icon={Code} title="API Reference" />
            <p className="text-muted-foreground mb-6">
              All endpoints are prefixed with <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">/api</code>.
              Protected routes require a <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">Authorization: Bearer &lt;token&gt;</code> header.
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Method</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Path</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Auth</th>
                    <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {API_ENDPOINTS.map(({ method, path, auth, desc }) => (
                    <tr key={path} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-4">
                        <Badge
                          variant={method === 'GET' ? 'secondary' : method === 'DELETE' ? 'destructive' : 'default'}
                          className="text-xs font-mono"
                        >
                          {method}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-foreground">{path}</td>
                      <td className="py-2.5 px-4">
                        <span className={`text-xs ${auth === 'None' ? 'text-muted-foreground' : auth === 'Admin' ? 'text-amber-400' : 'text-blue-400'}`}>
                          {auth}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Auth example */}
            <div className="mt-6">
              <p className="text-sm font-semibold mb-2">Authentication example</p>
              <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs font-mono overflow-x-auto text-muted-foreground">
{`// 1. Login to get a token
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'student@example.com', password: 'password123' })
});
const { token, user } = await res.json();

// 2. Use token in subsequent requests
const answer = await fetch('/api/chat/ask', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({ question: 'What is the placement eligibility criteria?' })
});`}
              </pre>
            </div>
          </section>

          <Separator />

          {/* ── FAQ ───────────────────────────────────────────────── */}
          <section id="faq">
            <SectionHeader icon={Info} title="Frequently Asked Questions" />
            <div className="space-y-4">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="p-4 rounded-lg border border-border/60 bg-card/30">
                  <p className="font-semibold text-sm mb-2 flex items-start gap-2">
                    <span className="text-primary mt-0.5 flex-shrink-0">Q.</span>
                    {q}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-5">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="py-10 text-center border-t border-border">
            <GraduationCap className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Students — create a free account. Coordinators — register with your admin code.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/register">
                <Badge className="px-5 py-2 text-sm cursor-pointer h-auto">Create Account</Badge>
              </Link>
              <Link to="/login">
                <Badge variant="outline" className="px-5 py-2 text-sm cursor-pointer h-auto">Sign In</Badge>
              </Link>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  );
}

function StepCard({ number, title, color, children }: { number: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className={`flex-shrink-0 text-xs font-bold ${color} bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 h-fit`}>
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
}
