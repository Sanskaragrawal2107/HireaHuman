
import React, { useState } from 'react';
import { insforge } from '../lib/insforge';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Terminal, Cpu, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export const JoinPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [useMagicLink, setUseMagicLink] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const [error, setError] = useState('');
    const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isLogin = location.pathname === '/login';

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await insforge.auth.signInWithOAuth({
            provider: 'google',
            redirectTo: `${window.location.origin}/profile`
        });
        if (error) console.error(error);
        setLoading(false);
    };

    const handlePasswordAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            if (isLogin) {
                // Login with password
                const { data, error } = await insforge.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) {
                    // Handle specific login errors
                    if (error.message?.includes('Email not confirmed')) {
                        setError('Please verify your email first. Check your inbox for verification link.');
                        setNeedsEmailVerification(true);
                    } else if (error.message?.includes('Invalid login credentials')) {
                        setError('Invalid email or password. Please try again.');
                    } else {
                        setError(error.message || 'Login failed. Please try again.');
                    }
                    throw error;
                }
                
                if (data?.user) {
                    // Successfully logged in
                    navigate('/profile');
                }
            } else {
                // Sign up with password
                if (password !== confirmPassword) {
                    setError('Passwords do not match!');
                    setLoading(false);
                    return;
                }
                if (password.length < 6) {
                    setError('Password must be at least 6 characters long');
                    setLoading(false);
                    return;
                }
                
                const { data, error } = await insforge.auth.signUp({
                    email,
                    password
                });
                
                if (error) {
                    // Handle specific signup errors
                    if (error.message?.includes('User already registered')) {
                        setError('Account already exists. Please login instead.');
                    } else if (error.message?.includes('already exists')) {
                        setError('This email is already registered. Please login or use a different email.');
                    } else {
                        setError(error.message || 'Signup failed. Please try again.');
                    }
                    throw error;
                }
                
                // Check if email verification is required
                if (data?.requireEmailVerification) {
                    setNeedsEmailVerification(true);
                    setError('Account created! Please check your email to verify your account.');
                } else if (data?.user) {
                    // Successfully signed up and logged in
                    navigate('/profile');
                }
            }
        } catch (error: any) {
            console.error(error);
            // Error already set in specific handlers above
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // @ts-ignore
        const { error } = await insforge.auth.signIn({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/profile`
            }
        });
        if (error) {
            console.error(error);
            setError(error.message || 'Failed to send magic link. Please try again.');
        } else {
            setMagicLinkSent(true);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-cyan-500/30">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[150px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md z-10 space-y-8 bg-zinc-900/40 backdrop-blur-md p-8 rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 mb-2 shadow-[0_0_15px_rgba(6,182,212,0.1)] group">
                        <Terminal className="w-8 h-8 text-cyan-500 group-hover:text-white transition-colors" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tighter text-white uppercase font-mono">
                        {isLogin ? 'SYSTEM_ACCESS' : 'INITIALIZE_PROFILE'}
                    </h1>
                    <p className="text-zinc-500 text-sm font-mono">
                        {isLogin ? 'Authenticate to continue session.' : 'Begin verification protocol.'}
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-black font-bold text-sm tracking-widest uppercase hover:bg-cyan-50 transition-colors disabled:opacity-50 font-mono shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                    >
                        <Cpu className="w-4 h-4" />
                        Auth with Google
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-mono">
                            <span className="bg-black/50 px-2 text-zinc-500 backdrop-blur">or use email</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={`p-4 rounded border ${
                            error.includes('created') || error.includes('verify your email') 
                                ? 'bg-green-500/5 border-green-500/20 text-green-400' 
                                : error.includes('already exists') || error.includes('already registered')
                                ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/5 border-red-500/20 text-red-400'
                        }`}>
                            <p className="text-xs font-mono">{error}</p>
                            {error.includes('already exists') && (
                                <Link 
                                    to="/login" 
                                    className="text-cyan-400 hover:text-white underline text-xs font-mono mt-2 inline-block"
                                >
                                    → Go to Login
                                </Link>
                            )}
                        </div>
                    )}

                    {/* Email Verification Message */}
                    {needsEmailVerification && (
                        <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded text-center">
                            <h3 className="text-blue-400 font-bold mb-2 font-mono uppercase tracking-wider text-sm">Verify Your Email</h3>
                            <p className="text-zinc-400 text-xs font-mono mb-2">We've sent a verification link to:</p>
                            <p className="text-white font-mono text-xs mb-3">{email}</p>
                            <p className="text-zinc-500 text-[10px] font-mono">Click the link in the email to activate your account, then come back to login.</p>
                        </div>
                    )}

                    {/* Email/Password Form */}
                    {!magicLinkSent && !needsEmailVerification ? (
                        <form onSubmit={useMagicLink ? handleMagicLink : handlePasswordAuth} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="sr-only">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-cyan-500 transition-colors" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="user@domain.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-zinc-950/50 border border-zinc-700 rounded-none py-3 pl-10 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono text-sm"
                                    />
                                </div>
                            </div>
                            
                            {/* Password fields - only show if not using magic link */}
                            {!useMagicLink && (
                                <>
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="sr-only">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-cyan-500 transition-colors" />
                                            <input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                minLength={6}
                                                className="w-full bg-zinc-950/50 border border-zinc-700 rounded-none py-3 pl-10 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Confirm Password - only for signup */}
                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-cyan-500 transition-colors" />
                                                <input
                                                    id="confirmPassword"
                                                    type="password"
                                                    placeholder="Confirm password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                    className="w-full bg-zinc-950/50 border border-zinc-700 rounded-none py-3 pl-10 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-mono text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-zinc-900 border border-zinc-700 text-cyan-500 font-bold rounded-none hover:bg-cyan-500/10 hover:border-cyan-500 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-xs font-mono group"
                            >
                                {loading ? 'PROCESSING...' : (useMagicLink ? 'SEND_MAGIC_LINK' : (isLogin ? 'LOGIN' : 'SIGN_UP'))}
                                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </button>
                            
                            {/* Toggle for magic link */}
                            <button
                                type="button"
                                onClick={() => setUseMagicLink(!useMagicLink)}
                                className="w-full text-[10px] text-zinc-500 hover:text-cyan-400 underline uppercase tracking-widest font-mono transition-colors"
                            >
                                {useMagicLink ? 'Use password instead' : 'Use magic link instead'}
                            </button>
                        </form>
                    ) : magicLinkSent ? (
                        <div className="p-6 bg-green-500/5 border border-green-500/20 rounded text-center">
                            <h3 className="text-green-400 font-bold mb-2 font-mono uppercase tracking-wider">Magic Link Sent!</h3>
                            <p className="text-zinc-400 text-xs font-mono mb-4">Check your inbox for the login link: <span className="text-white block mt-1">{email}</span></p>
                            <p className="text-zinc-500 text-[10px] font-mono mb-4">Click the link in the email to sign in automatically.</p>
                            <button
                                onClick={() => { setMagicLinkSent(false); setError(''); }}
                                className="text-[10px] text-zinc-500 hover:text-cyan-400 underline uppercase tracking-widest font-mono"
                            >
                                Use different email
                            </button>
                        </div>
                    ) : null}
                </div>

                <div className="text-center text-xs text-zinc-600 font-mono">
                    {isLogin ? (
                        <>
                            Need an account? <Link to="/join" className="text-cyan-500 hover:text-white transition-colors ml-1">SIGN UP</Link>
                        </>
                    ) : (
                        <>
                            Already have access? <Link to="/login" className="text-cyan-500 hover:text-white transition-colors ml-1">LOGIN</Link>
                        </>
                    )}
                </div>

                <p className="text-center text-[10px] text-zinc-700 leading-relaxed max-w-xs mx-auto font-mono mt-8 border-t border-zinc-800 pt-4">
                    By initializing, you agree to Protocol <a href="#" className="underline hover:text-cyan-500">Terms</a> & <a href="#" className="underline hover:text-cyan-500">Privacy</a>.
                </p>
            </motion.div>
        </div>
    );
};
