import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const PicaCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const connectorId = searchParams.get('connectorId');
    const accessToken = searchParams.get('accessToken');
    const userId = searchParams.get('userId');
    const platform = searchParams.get('platform');
    const username = searchParams.get('username');
    const error = searchParams.get('error');

    if (error) {
      // Send error message to parent window
      window.opener?.postMessage({
        type: 'PICA_AUTH_ERROR',
        error: error,
      }, window.location.origin);
      window.close();
      return;
    }

    if (connectorId && accessToken && userId && platform) {
      // Send success message to parent window
      window.opener?.postMessage({
        type: 'PICA_AUTH_SUCCESS',
        connectorId,
        accessToken,
        userId,
        platform,
        username,
      }, window.location.origin);
      window.close();
    }
  }, [searchParams]);

  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-deep-blue flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {error ? (
            <>
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Connection Failed
              </h2>
              <p className="text-white/70 mb-4">
                {error}
              </p>
              <p className="text-sm text-white/50">
                This window will close automatically.
              </p>
            </>
          ) : (
            <>
              <div className="mb-4">
                {searchParams.get('connectorId') ? (
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                ) : (
                  <Loader2 className="w-16 h-16 text-neon-blue mx-auto animate-spin" />
                )}
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {searchParams.get('connectorId') ? 'Connected Successfully!' : 'Connecting...'}
              </h2>
              <p className="text-white/70 mb-4">
                {searchParams.get('connectorId') 
                  ? 'Your social media account has been connected.'
                  : 'Please wait while we complete the connection.'
                }
              </p>
              <p className="text-sm text-white/50">
                This window will close automatically.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};