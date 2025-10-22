import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function ApiKey() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState<string>('');
  const [revealed, setRevealed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchKey() {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('api_key')
        .eq('user_id', user.id)
        .single();
      if (!error && data?.api_key) setApiKey(data.api_key);
      setLoading(false);
    }
    fetchKey();
  }, [user]);

  return (
    <div className="p-4">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>API Key</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">For security, click reveal to view your API key.</p>
          <div className="flex space-x-2">
            <Input type={revealed ? 'text' : 'password'} value={apiKey} readOnly placeholder={loading ? 'Loading…' : ''} />
            <Button type="button" onClick={() => setRevealed((v) => !v)} disabled={loading}>
              {revealed ? 'Hide' : 'Reveal'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



