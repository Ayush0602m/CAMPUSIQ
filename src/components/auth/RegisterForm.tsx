import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { setToken, saveUser } from '@/lib/auth';
import { Eye, EyeOff, UserPlus, ChevronDown, ShieldCheck, Info } from 'lucide-react';
import { toast } from 'sonner';

export function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', adminCode: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);

  // Live check: if admin code is entered, warn about edu email requirement
  const adminCodeEntered = form.adminCode.trim().length > 0;
  const emailIsEdu = /^[^\s@]+@[^\s@]+\.(edu|ac\.in|edu\.in|ac\.uk|edu\.au)$/i.test(form.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (adminCodeEntered && !emailIsEdu) {
      toast.error('Admin accounts require an institutional email (e.g. name@college.edu or name@college.ac.in)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          adminCode: form.adminCode || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setToken(data.token);
      saveUser(data.user);
      toast.success(`Welcome to CampusIQ, ${data.user.name}!`);
      navigate(data.user.isAdmin ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Create Account</CardTitle>
        <CardDescription>Fill in your details to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email address
              {adminCodeEntered && (
                <span className="ml-2 text-xs text-amber-400 font-normal">
                  (institutional email required for admin)
                </span>
              )}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={adminCodeEntered ? 'name@college.edu or name@college.ac.in' : 'you@example.com'}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={loading}
              autoComplete="email"
              className={adminCodeEntered && form.email && !emailIsEdu ? 'border-destructive' : ''}
            />
            {adminCodeEntered && form.email && !emailIsEdu && (
              <p className="text-xs text-destructive">
                Must be an institutional email (.edu, .ac.in, .edu.in, etc.)
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={loading}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Admin code collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdminCode(!showAdminCode)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdminCode ? 'rotate-180' : ''}`} />
              {showAdminCode ? 'Hide admin code' : 'Program coordinator? Enter admin code'}
            </button>

            {showAdminCode && (
              <div className="mt-3 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="adminCode" className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Admin Code
                  </Label>
                  <Input
                    id="adminCode"
                    type="password"
                    placeholder="Enter admin code"
                    value={form.adminCode}
                    onChange={(e) => setForm({ ...form, adminCode: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <Alert className="border-primary/20 bg-primary/5 py-2.5">
                  <Info className="h-3.5 w-3.5 text-primary mt-0.5" />
                  <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
                    Admin accounts are for <strong className="text-foreground">program coordinators only</strong>.
                    You must use an institutional email ending in{' '}
                    <code className="bg-muted px-1 rounded">.edu</code>,{' '}
                    <code className="bg-muted px-1 rounded">.ac.in</code>, or{' '}
                    <code className="bg-muted px-1 rounded">.edu.in</code>.
                    Students should leave this blank.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Create Account
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
