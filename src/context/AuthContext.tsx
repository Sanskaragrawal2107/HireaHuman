
import React, { createContext, useContext, useEffect, useState } from 'react';
import { insforge } from '../lib/insforge';
import { logger } from '../lib/logger';

interface AuthContextType {
    user: any | null;
    session: any | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
    refreshSession: async () => { },
});

export const useAuth = () => useContext(AuthContext);

// Helper function to check if JWT token is expired
function isTokenExpired(token: string): boolean {
    try {
        // JWT format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) return true;

        // Decode the payload (second part)
        const payload = parts[1];
        const decoded = JSON.parse(atob(payload));

        // Check if exp claim exists and is in the past
        if (!decoded.exp) return false; // No expiry claim, assume valid

        const expiryTime = decoded.exp * 1000; // Convert seconds to milliseconds
        return Date.now() > expiryTime;
    } catch (error) {
        logger.error('Error checking token expiration:', error);
        return true; // If we can't parse it, assume it's invalid
    }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const clearAuth = () => {
        setUser(null);
        setSession(null);
        localStorage.removeItem('hireahuman_manual_session');
        sessionStorage.setItem('hireahuman_logged_out', 'true');
    };

    const checkSession = async () => {
        try {
            // Detect OAuth callback tokens in URL (hash fragment or query params)
            const hash = window.location.hash;
            const search = window.location.search;
            const isOAuthCallback = hash.includes('access_token') || search.includes('code=') || search.includes('access_token');

            // If this is an OAuth callback, clear the logout flag so we don't block it
            if (isOAuthCallback) {
                sessionStorage.removeItem('hireahuman_logged_out');
            }

            // Check if user explicitly logged out (flag set by signOut)
            const loggedOut = sessionStorage.getItem('hireahuman_logged_out');
            if (loggedOut) {
                setUser(null);
                setSession(null);
                setLoading(false);
                return;
            }

            // Try getCurrentSession first — this handles OAuth callbacks, cookie refresh, etc.
            // @ts-ignore
            const sessionResult = await insforge.auth.getCurrentSession();
            const activeSession = sessionResult?.data?.session;

            if (activeSession?.user && activeSession?.accessToken) {
                const newUser = activeSession.user;
                const newToken = activeSession.accessToken;
                // @ts-ignore - refreshToken may not be in SDK types but exists in runtime
                const newRefreshToken = activeSession.refreshToken;

                // Validate token is not expired
                if (isTokenExpired(newToken)) {
                    logger.warn('Session token is expired, clearing session');
                    clearAuth();
                    setLoading(false);
                    return;
                }

                if (!user || user.id !== newUser.id) {
                    setUser(newUser);
                    sessionStorage.removeItem('hireahuman_logged_out');
                }

                const newSession = { 
                    user: newUser, 
                    accessToken: newToken,
                    refreshToken: newRefreshToken
                };
                setSession(newSession);
                localStorage.setItem('hireahuman_manual_session', JSON.stringify(newSession));

                // Clean OAuth tokens from URL if present
                if (isOAuthCallback) {
                    window.history.replaceState(null, '', window.location.pathname);
                }

                setLoading(false);
                return;
            }

            // Try to recover from local storage (manual persistence)
            const stored = localStorage.getItem('hireahuman_manual_session');
            if (stored && !user) {
                try {
                    const { user: storedUser, accessToken: storedToken, refreshToken: storedRefreshToken } = JSON.parse(stored);

                    // Validate token is not expired before using it
                    if (storedToken && isTokenExpired(storedToken)) {
                        logger.warn('Stored token is expired, clearing session');
                        clearAuth();
                        setLoading(false);
                        return;
                    }

                    // @ts-ignore
                    const currentSDKToken = insforge.auth.tokenManager?.getAccessToken();

                    if (storedUser && storedToken && !currentSDKToken) {
                        // Restore to SDK internals
                        // @ts-ignore
                        if (insforge.auth.tokenManager) {
                            // @ts-ignore
                            insforge.auth.tokenManager.setAccessToken(storedToken);
                            // @ts-ignore
                            if (storedRefreshToken) {
                                // @ts-ignore
                                insforge.auth.tokenManager.setRefreshToken(storedRefreshToken);
                            }
                            // @ts-ignore
                            insforge.auth.tokenManager.saveSession({ 
                                user: storedUser, 
                                accessToken: storedToken,
                                refreshToken: storedRefreshToken
                            });
                        }
                        // @ts-ignore
                        if (insforge.http) {
                            // @ts-ignore
                            insforge.http.setAuthToken(storedToken);
                        }

                        // Optimistically set state
                        setUser(storedUser);
                        setSession({ 
                            user: storedUser, 
                            accessToken: storedToken,
                            refreshToken: storedRefreshToken
                        });
                    }
                } catch (e) {
                    logger.error('Failed to parse or validate stored session:', e);
                    clearAuth();
                    setLoading(false);
                    return;
                }
            }

            // Fallback: verify with getCurrentUser
            // @ts-ignore
            const { data, error } = await insforge.auth.getCurrentUser();

            if (error) {
                logger.error('Auth error:', error);
                clearAuth();
                setLoading(false);
                return;
            }

            if (data?.user) {
                const newUser = data.user;
                if (!user || user.id !== newUser.id) {
                    setUser(newUser);
                    sessionStorage.removeItem('hireahuman_logged_out');
                }

                // Attempt to get session token
                // @ts-ignore
                const currentToken = insforge.auth.tokenManager?.getAccessToken();
                // @ts-ignore
                const currentRefreshToken = insforge.auth.tokenManager?.getRefreshToken();

                const newSession = {
                    user: newUser,
                    accessToken: currentToken || (session?.accessToken),
                    refreshToken: currentRefreshToken || (session?.refreshToken)
                };

                setSession(newSession);

                if (newSession.accessToken) {
                    localStorage.setItem('hireahuman_manual_session', JSON.stringify(newSession));
                }
            } else {
                if (user) {
                    clearAuth();
                }
            }
        } catch (error: any) {
            logger.error('Error checking session:', error);
            if (error?.message?.includes('JWT') || error?.code === 'PGRST301') {
                clearAuth();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
        // Poll for session changes conservatively (every 60 seconds)
        const interval = setInterval(checkSession, 60000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const signOut = async () => {
        try {
            await insforge.auth.signOut();
        } catch (err) {
            logger.error('SignOut error:', err);
        }

        clearAuth();
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut, refreshSession: checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};
