import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap, MessageSquare, BookOpen, Users,
  Briefcase, FileText, Zap, Shield, ChevronRight,
  Clock, Building2
} from 'lucide-react';

const CATEGORIES = [
  { icon: Shield, label: 'Placement Policy', color: 'text-amber-400', desc: 'Eligibility, process & rules' },
  { icon: Clock, label: 'Class Schedules', color: 'text-blue-400', desc: 'Timetables & lab timings' },
  { icon: Users, label: 'Faculty Info', color: 'text-green-400', desc: 'Teachers, HODs & contacts' },
  { icon: Briefcase, label: 'Placements', color: 'text-purple-400', desc: 'Companies, packages & drives' },
  { icon: BookOpen, label: 'Study Material', color: 'text-rose-400', desc: 'Notes, papers & resources' },
  { icon: Building2, label: 'College Policies', color: 'text-orange-400', desc: 'Attendance, rules & fees' },
];

const SAMPLE_QS = [
  'What is the minimum attendance required?',
  'When is the next placement drive?',
  'Who is the HOD of Computer Science?',
  'What are the lab timings for Semester 4?',
  'What is the fee payment deadline?',
  'Which companies visited last year?',
  
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <Badge variant="outline" className="mb-6 border-primary/40 text-primary px-4 py-1.5 text-sm">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            AI-Powered College Assistant
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your College Questions,{' '}
            <span className="text-primary">Answered Instantly</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            CampusIQ is your 24/7 AI assistant for everything college — placement policies,
            class schedules, faculty contacts, and study material. No more waiting for emails.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-8 h-12">
              <Link to="/register">
                Get Started Free
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8 h-12">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="text-base px-8 h-12">
              <Link to="/docs">
                <BookOpen className="h-4 w-4 mr-2" />
                Docs
              </Link>
            </Button>
          </div>

          {/* Sample questions ticker */}
          <div className="mt-14 flex flex-wrap gap-2 justify-center">
            {SAMPLE_QS.map((q) => (
              <span
                key={q}
                className="text-xs bg-muted/60 border border-border rounded-full px-3 py-1.5 text-muted-foreground"
              >
                "{q}"
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything About Your College</h2>
            <p className="text-muted-foreground text-lg">
              Ask anything — from attendance rules to placement packages
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map(({ icon: Icon, label, color, desc }) => (
              <Card key={label} className="border-border/60 hover:border-primary/40 transition-colors group">
                <CardContent className="pt-6 pb-5">
                  <Icon className={`h-8 w-8 mb-3 ${color} group-hover:scale-110 transition-transform`} />
                  <h3 className="font-semibold mb-1">{label}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How CampusIQ Works</h2>
            <p className="text-muted-foreground text-lg">Simple, fast, and always accurate</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: FileText,
                title: 'Admin Uploads Docs',
                desc: 'Program coordinators upload placement policies, schedules, faculty lists, and more.',
              },
              {
                step: '02',
                icon: Zap,
                title: 'AI Processes Everything',
                desc: 'CampusIQ reads and indexes all documents using advanced AI embeddings.',
              },
              {
                step: '03',
                icon: MessageSquare,
                title: 'Students Ask & Get Answers',
                desc: 'Ask any question in plain English and get instant, accurate answers with sources.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="relative inline-flex mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">
                    {step.slice(1)}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {/* <section className="py-16 px-4 bg-primary/5 border-y border-primary/10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '24/7', label: 'Always Available' },
            { value: '<2s', label: 'Response Time' },
            { value: '6+', label: 'Info Categories' },
            { value: '100%', label: 'Source-Backed' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-primary mb-1">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to stop waiting for replies?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join your classmates on CampusIQ and get instant answers to all your college queries.
          </p>
          <Button size="lg" asChild className="text-base px-10 h-12">
            <Link to="/register">
              Create Free Account
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">CampusIQ</span>
        </div>
        <p>Your AI-powered college assistant · Built for students, managed by coordinators</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link>
          <Link to="/login" className="hover:text-primary transition-colors">Sign In</Link>
          <Link to="/register" className="hover:text-primary transition-colors">Register</Link>
        </div>
      </footer>
    </div>
  );
}
