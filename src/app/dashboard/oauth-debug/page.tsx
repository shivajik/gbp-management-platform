// Force dynamic rendering - this page requires authentication and API calls
export const dynamic = 'force-dynamic';
export const revalidate = 0;

'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function OAuthDebugPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const fetchDebugInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/debug-tokens');
      const result = await response.json();
      setDebugInfo(result);
    } catch (error) {
      console.error('Error fetching debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  const handleSignIn = async () => {
    await signIn('google', { callbackUrl: '/dashboard/oauth-debug' });
  };

  const handleForceReconnect = async () => {
    await signOut({ redirect: false });
    setTimeout(() => {
      signIn('google', { callbackUrl: '/dashboard/oauth-debug' });
    }, 500);
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          OAuth Debug Console
        </h1>
        <p className="text-gray-600">
          Diagnose and fix Google OAuth authentication issues
        </p>
      </div>

      {/* Session Status */}
      <Card>
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <Badge
                variant={status === 'authenticated' ? 'default' : 'destructive'}
              >
                {status}
              </Badge>
            </div>
            {session?.user && (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-medium">User:</span>
                  <span>{session.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Name:</span>
                  <span>{session.user.name}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Token Debug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Token Debug Information
            <Button
              onClick={fetchDebugInfo}
              disabled={loading || status !== 'authenticated'}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              {loading ? 'Loading...' : 'Fetch Debug Info'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {debugInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Google Account:</span>
                  <Badge
                    variant={
                      debugInfo.hasGoogleAccount ? 'default' : 'destructive'
                    }
                  >
                    {debugInfo.hasGoogleAccount ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Access Token:</span>
                  <Badge
                    variant={
                      debugInfo.hasAccessToken ? 'default' : 'destructive'
                    }
                  >
                    {debugInfo.hasAccessToken ? 'Present' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Refresh Token:</span>
                  <Badge
                    variant={
                      debugInfo.hasRefreshToken ? 'default' : 'destructive'
                    }
                  >
                    {debugInfo.hasRefreshToken ? 'Present' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Token Status:</span>
                  <Badge
                    variant={debugInfo.isExpired ? 'destructive' : 'default'}
                  >
                    {debugInfo.isExpired ? 'Expired' : 'Valid'}
                  </Badge>
                </div>
              </div>

              {debugInfo.expiresAt && (
                <div>
                  <span className="font-medium">Expires At:</span>
                  <span className="ml-2">
                    {new Date(debugInfo.expiresAt).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="rounded bg-gray-100 p-3">
                <span className="font-medium">Recommendation:</span>
                <p className="mt-1 text-sm">{debugInfo.recommendation}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              Click "Fetch Debug Info" to see token details
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status === 'authenticated' ? (
              <div className="space-y-2">
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full"
                >
                  Sign Out
                </Button>
                <Button onClick={handleForceReconnect} className="w-full">
                  <Shield className="mr-2 h-4 w-4" />
                  Force Reconnect (Sign Out + Sign In)
                </Button>
                <Button
                  onClick={() =>
                    signIn('google', { callbackUrl: '/dashboard/oauth-debug' })
                  }
                  variant="outline"
                  className="w-full"
                >
                  Reconnect (Keep Session)
                </Button>
              </div>
            ) : (
              <Button onClick={handleSignIn} className="w-full">
                Sign In with Google
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Raw Debug Data */}
      {debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Debug Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
