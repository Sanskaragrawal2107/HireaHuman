
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const clearAuth = useCallback(() => {
        setUser(null);
        setSession(null);
        sessionStorage.setItem('hireahuman_logged_out', 'true');
    }, []);

    const checkSession = useCallback(async () => {
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

            // Use getCurrentSession — SDK handles token refresh via httpOnly cookies automatically
            const sessionResult = await insforge.auth.getCurrentSession();
            const activeSession = sessionResult?.data?.session;

            if (activeSession?.user && activeSession?.accessToken) {
                setUser(activeSession.user);
                setSession({
                    user: activeSession.user,
                    accessToken: activeSession.accessToken,
                });
                sessionStorage.removeItem('hireahuman_logged_out');

                // Clean OAuth tokens from URL if present
                if (isOAuthCallback) {
                    window.history.replaceState(null, '', window.location.pathname);
                }

                setLoading(false);
                return;
            }

            // No active session — clear state if we thought we had one
            if (user) {
                clearAuth();
            } else {
                setUser(null);
                setSession(null);
            }
        } catch (error: any) {
            logger.error('Error checking session:', error);
            clearAuth();
        } finally {
            setLoading(false);
        }
    }, [user, clearAuth]);

    useEffect(() => {
        checkSession();
        // Poll for session changes conservatively (every 60 seconds)
        const interval = setInterval(checkSession, 60000);
        return () => clearInterval(interval);
    }, []);

    const signOut = useCallback(async () => {
        try {
            await insforge.auth.signOut();
        } catch (err) {
            logger.error('SignOut error:', err);
        }
        clearAuth();
        window.location.href = '/';
    }, [clearAuth]);

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut, refreshSession: checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};
