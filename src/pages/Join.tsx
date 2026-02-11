
import React, { useState } from 'react';
import { insforge } from '../lib/insforge';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Chrome, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const JoinPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const location = useLocation();
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

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Using generic signIn if signInWithOtp is missing in types
        // @ts-ignore
        const { error } = await insforge.auth.signIn({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/profile`
            }
        });
        if (error) {
            console.error(error);
            alert(error.message);
        } else {
            setMagicLinkSent(true);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-pink-600/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[150px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10 space-y-8"
            >
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 mb-4 animate-pulse">
                        <Heart className="w-6 h-6 text-pink-500 fill-current" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white capitalize">
                        {isLogin ? 'welcome back' : 'join dateahuman'}
                    </h1>
                    <p className="text-zinc-500">
                        {isLogin ? 'login to continue' : 'create an account to get started'}
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Google Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        <Chrome className="w-5 h-5" />
                        continue with google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black px-2 text-zinc-500">or</span>
                        </div>
                    </div>

                    {/* Email Form */}
                    {!magicLinkSent ? (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="sr-only">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-lg hover:border-pink-500 hover:text-pink-500 transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-xs group"
                            >
                                {loading ? 'Sending...' : 'continue with email'}
                                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    ) : (
                        <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                            <h3 className="text-green-400 font-bold mb-2">Check your inbox!</h3>
                            <p className="text-zinc-400 text-sm">We sent a magic link to <span className="text-white">{email}</span>.</p>
                            <button
                                onClick={() => setMagicLinkSent(false)}
                                className="mt-4 text-xs text-zinc-500 hover:text-white underline"
                            >
                                Try different email
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-center text-sm text-zinc-500">
                    already have an account? <Link to="/join" className="text-white hover:text-pink-500 font-bold ml-1 transition-colors">login</Link>
                </div>

                <p className="text-center text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
                    by signing up you agree to our <a href="#" className="underline hover:text-zinc-400">terms of service</a> and <a href="#" className="underline hover:text-zinc-400">privacy policy</a>.
                    <br />
                    <span className="block mt-4 opacity-50 font-mono tracking-widest uppercase">to initialize profile</span>
                </p>
            </motion.div>
        </div>
    );
};
