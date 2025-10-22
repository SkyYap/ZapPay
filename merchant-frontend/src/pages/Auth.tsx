import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

export function Auth() {
  const { signInWithPassword, signUpWithPassword, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMessage(null);
    const res = await signInWithPassword(email, password);
    if ((res as any)?.error) setError((res as any).error);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMessage(null);
    const res = await signUpWithPassword(email, password);
    if ((res as any)?.error) setError((res as any).error); else setMessage('Check your inbox to confirm your email.');
  }

  async function handleMagic(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMessage(null);
    const res = await signInWithMagicLink(email);
    if ((res as any)?.error) setError((res as any).error); else setMessage('Magic link sent! Check your inbox.');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to ZapPay</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSignIn}>
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">Sign in</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={handleSignUp}>Sign up</Button>
            </div>
            <Button type="button" variant="secondary" onClick={handleMagic}>Send magic link</Button>
            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



