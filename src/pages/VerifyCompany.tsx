
import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, Building, Globe, CreditCard, Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, AlertTriangle, Briefcase } from 'lucide-react';
import { insforge } from '../lib/insforge';
import { useNavigate } from 'react-router-dom';

export const VerifyCompanyPage = () => {
    const navigate = useNavigate();

    // Page state
    const [pageLoading, setPageLoading] = useState(true);
    const [step, setStep] = useState<'login' | 'signup' | 'verify-email' | 'company-form' | 'payment' | 'success'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState<any>(null);

    // Auth form state
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authName, setAuthName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');

    // Company form state
    const [companyData, setCompanyData] = useState({
        workEmail: '',
        companyName: '',
        websiteUrl: '',
        linkedinUrl: '',
        businessId: ''
    });

    // Add-on state
    const [isChatbotIncluded, setIsChatbotIncluded] = useState(true);

    // ── Initial Auth Check ──
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // @ts-ignore
                const { data } = await insforge.auth.getCurrentUser();
                if (data?.user) {
                    setUser(data.user);
                    // Check if they already have a company
                    const { data: company } = await insforge.database
                        .from('companies')
                        .select('*')
                        .eq('user_id', data.user.id)
                        .single();
                    if (company) {
                        navigate('/recruiter-dashboard');
                        return;
                    }
                    setStep('company-form');
                } else {
                    setStep('login');
                }
            } catch {
                setStep('login');
            } finally {
                setPageLoading(false);
            }
        };
        checkAuth();
    }, [navigate]);

    // ── Auth Handlers ──

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!authEmail || !authPassword || !authName) {
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        if (authPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            setLoading(false);
            return;
        }

        try {
            const { data, error: signUpError } = await insforge.auth.signUp({
                email: authEmail,
                password: authPassword,
                name: authName,
            });

            if (signUpError) throw signUpError;

            if (data?.requireEmailVerification) {
                setStep('verify-email');
            } else if (data?.accessToken) {
                setUser(data.user);
                setStep('company-form');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error: signInError } = await insforge.auth.signInWithPassword({
                email: authEmail,
                password: authPassword,
            });

            if (signInError) throw signInError;

            if (data?.user) {
                setUser(data.user);
                // Check existing company
                const { data: company } = await insforge.database
                    .from('companies')
                    .select('*')
                    .eq('user_id', data.user.id)
                    .single();
                if (company) {
                    navigate('/recruiter-dashboard');
                } else {
                    setStep('company-form');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Invalid credentials. Please check your email and password.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error: verifyError } = await insforge.auth.verifyEmail({
                email: authEmail,
                otp: verifyCode,
            });

            if (verifyError) throw verifyError;

            if (data?.user) {
                setUser(data.user);
                setStep('company-form');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setError('');
        try {
            await insforge.auth.resendVerificationEmail({ email: authEmail });
            setError(''); // Clear any previous errors
            alert('Verification email resent. Please check your inbox.');
        } catch (err: any) {
            setError(err.message || 'Failed to resend verification email.');
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await insforge.auth.signInWithOAuth({
                provider: 'google',
                redirectTo: `${window.location.origin}/verify`
            });
        } catch (err: any) {
            setError(err.message || 'Google login failed.');
            setLoading(false);
        }
    };

    // ── Company Form Handler ──
    const handleCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!companyData.companyName || !companyData.workEmail || !companyData.websiteUrl || !companyData.businessId) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        try {
            const { error: insertError } = await insforge.database.from('companies').insert({
                user_id: user.id,
                name: companyData.companyName,
                email: companyData.workEmail,
                website: companyData.websiteUrl,
                linkedin: companyData.linkedinUrl,
                business_id: companyData.businessId,
                status: 'pending',
                description: '',
                tech_stack: []
            });

            if (insertError) throw insertError;
            setStep('payment');
        } catch (err: any) {
            console.error("Company insert error:", err);
            setError(err.message || 'Failed to register company. You may already have a company registered.');
        } finally {
            setLoading(false);
        }
    };

    // ── Payment Handler (persists subscription to DB) ──
    const handlePayment = async () => {
        setLoading(true);
        setError('');

        const plan = isChatbotIncluded ? 'verified_plus_chatbot' : 'verified';
        const amount = 199 + (isChatbotIncluded ? 249 : 0);

        try {
            // 1. Get company ID for this user
            const { data: company, error: companyError } = await insforge.database
                .from('companies')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (companyError || !company) throw new Error('Company not found. Please go back and re-submit.');

            // 2. Create subscription record
            const now = new Date();
            const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

            const { error: subError } = await insforge.database
                .from('subscriptions')
                .insert({
                    company_id: company.id,
                    plan,
                    amount_inr: amount,
                    status: 'active',
                    started_at: now.toISOString(),
                    current_period_start: now.toISOString(),
                    current_period_end: periodEnd.toISOString(),
                    payment_method: 'stripe',
                });

            if (subError) throw subError;

            // 3. Update company with subscription details
            const { error: updateError } = await insforge.database
                .from('companies')
                .update({
                    subscription_plan: plan,
                    subscription_status: 'active',
                    subscription_expires_at: periodEnd.toISOString(),
                    chatbot_enabled: isChatbotIncluded,
                })
                .eq('id', company.id);

            if (updateError) throw updateError;

            setStep('success');
        } catch (err: any) {
            console.error('Payment error:', err);
            setError(err.message || 'Failed to process payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Loading Screen ──
    if (pageLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    // ── Progress Bar ──
    const progressMap = { 'login': 0, 'signup': 0, 'verify-email': 15, 'company-form': 40, 'payment': 70, 'success': 100 };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl pointer-events-none" />

            <div className="max-w-xl w-full relative z-10">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-5 shadow-lg shadow-blue-600/20">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Company Verification
                    </h1>
                    <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                        Verify your organization to access our talent network. Only legitimate companies with verified domains are approved.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">

                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-slate-100">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ease-out"
                            style={{ width: `${progressMap[step]}%` }}
                        />
                    </div>

                    <div className="p-8">

                        {/* ═══════════════════════════════════════ */}
                        {/* STEP: LOGIN                             */}
                        {/* ═══════════════════════════════════════ */}
                        {step === 'login' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 mb-1">Welcome back</h2>
                                    <p className="text-slate-500 text-sm">Sign in to your recruiter account</p>
                                </div>

                                <form onSubmit={handleSignIn} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email" required
                                                value={authEmail}
                                                onChange={e => setAuthEmail(e.target.value)}
                                                placeholder="you@company.com"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'} required
                                                value={authPassword}
                                                onChange={e => setAuthPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-12 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                        {loading ? 'Signing in...' : 'Sign in'}
                                    </button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                                    <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-slate-400">or continue with</span></div>
                                </div>

                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                    Sign in with Google
                                </button>

                                <p className="text-center text-sm text-slate-500">
                                    Don't have an account?{' '}
                                    <button onClick={() => { setStep('signup'); setError(''); }} className="text-blue-600 font-medium hover:underline">
                                        Create one
                                    </button>
                                </p>
                            </div>
                        )}

                        {/* ═══════════════════════════════════════ */}
                        {/* STEP: SIGN UP                           */}
                        {/* ═══════════════════════════════════════ */}
                        {step === 'signup' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 mb-1">Create your account</h2>
                                    <p className="text-slate-500 text-sm">Sign up to begin company verification</p>
                                </div>

                                <form onSubmit={handleSignUp} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text" required
                                                value={authName}
                                                onChange={e => setAuthName(e.target.value)}
                                                placeholder="Jane Smith"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email" required
                                                value={authEmail}
                                                onChange={e => setAuthEmail(e.target.value)}
                                                placeholder="you@company.com"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type={showPassword ? 'text' : 'password'} required minLength={8}
                                                value={authPassword}
                                                onChange={e => setAuthPassword(e.target.value)}
                                                placeholder="Minimum 8 characters"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-12 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                        {loading ? 'Creating account...' : 'Create account'}
                                    </button>
                                </form>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                                    <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-slate-400">or continue with</span></div>
                                </div>

                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                    Sign up with Google
                                </button>

                                <p className="text-center text-sm text-slate-500">
                                    Already have an account?{' '}
                                    <button onClick={() => { setStep('login'); setError(''); }} className="text-blue-600 font-medium hover:underline">
                                        Sign in
                                    </button>
                                </p>
                            </div>
                        )}

                        {/* ═══════════════════════════════════════ */}
                        {/* STEP: EMAIL VERIFICATION                */}
                        {/* ═══════════════════════════════════════ */}
                        {step === 'verify-email' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-4">
                                        <Mail className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-slate-900 mb-1">Check your email</h2>
                                    <p className="text-slate-500 text-sm">
                                        We sent a verification code to <span className="font-medium text-slate-700">{authEmail}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyEmail} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Verification code</label>
                                        <input
                                            type="text" required maxLength={6}
                                            value={verifyCode}
                                            onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono placeholder:text-slate-300 placeholder:tracking-[0.5em]"
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || verifyCode.length < 6}
                                        className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        {loading ? 'Verifying...' : 'Verify email'}
                                    </button>
                                </form>

                                <p className="text-center text-sm text-slate-500">
                                    Didn't receive the code?{' '}
                                    <button onClick={handleResendCode} className="text-blue-600 font-medium hover:underline">
                                        Resend
                                    </button>
                                </p>
                            </div>
                        )}

                        {/* ═══════════════════════════════════════ */}
                        {/* STEP: COMPANY DETAILS                   */}
                        {/* ═══════════════════════════════════════ */}
                        {step === 'company-form' && (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900 mb-1">Company details</h2>
                                            <p className="text-slate-500 text-sm">We verify domain ownership, LinkedIn presence, and your business registration.</p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                await insforge.auth.signOut();
                                                setUser(null);
                                                setStep('login');
                                            }}
                                            className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline flex items-center gap-1"
                                        >
                                            Sign out <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 flex items-center gap-2 mb-4">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        Logged in as <span className="font-bold">{user?.email}</span>
                                    </div>
                                </div>

                                <form onSubmit={handleCompanySubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Work email <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email" required
                                                value={companyData.workEmail}
                                                onChange={e => setCompanyData({ ...companyData, workEmail: e.target.value })}
                                                placeholder="recruiting@yourcompany.com"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Company name <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="text" required
                                                    value={companyData.companyName}
                                                    onChange={e => setCompanyData({ ...companyData, companyName: e.target.value })}
                                                    placeholder="Acme Inc."
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Website <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="url" required
                                                    value={companyData.websiteUrl}
                                                    onChange={e => setCompanyData({ ...companyData, websiteUrl: e.target.value })}
                                                    placeholder="https://yourcompany.com"
                                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>



                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">LinkedIn company page</label>
                                            <input
                                                type="url"
                                                value={companyData.linkedinUrl}
                                                onChange={e => setCompanyData({ ...companyData, linkedinUrl: e.target.value })}
                                                placeholder="linkedin.com/company/..."
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Business ID <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text" required
                                                value={companyData.businessId}
                                                onChange={e => setCompanyData({ ...companyData, businessId: e.target.value })}
                                                placeholder="CIN / GST / EIN"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>

                                    {/* What we verify */}
                                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                                        <p className="text-xs font-medium text-blue-700">What we verify:</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
                                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Professional identity</span>
                                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Website validity</span>
                                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Business registration</span>
                                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> LinkedIn presence</span>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                        {loading ? 'Submitting...' : 'Continue to payment'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ═══════════════════════════════════════ */}
                        {/* STEP: PAYMENT (Simulated)               */}
                        {/* ═══════════════════════════════════════ */}
                        {step === 'payment' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 mb-1">Select your plan</h2>
                                    <p className="text-slate-500 text-sm">Choose how you want to hire.</p>
                                </div>

                                {/* Verification Fee */}
                                <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">REQUIRED</div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Company Verification</h3>
                                            <p className="text-xs text-slate-500">Monthly subscription for trust badge & access.</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-slate-900">₹199<span className="text-xs font-normal text-slate-500">/mo</span></div>
                                            <span className="text-xs text-slate-400 block line-through">₹800</span>
                                        </div>
                                    </div>
                                    <ul className="space-y-1.5 mt-3">
                                        <li className="flex items-center gap-2 text-xs text-slate-600">
                                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                            <span>Verified Badge on profile</span>
                                        </li>
                                        <li className="flex items-center gap-2 text-xs text-slate-600">
                                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                            <span>Access to candidate database</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Chatbot Add-on */}
                                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 shadow-sm relative">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-indigo-900">AI Recruiter Agent</h3>
                                                <span className="bg-indigo-200 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded">RECOMMENDED</span>
                                            </div>
                                            <p className="text-xs text-indigo-700 mb-3">
                                                Automated screening, code analysis, and candidate matching.
                                            </p>
                                            <ul className="space-y-1.5">
                                                <li className="flex items-center gap-2 text-xs text-indigo-800">
                                                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span>Deep GitHub analysis</span>
                                                </li>
                                                <li className="flex items-center gap-2 text-xs text-indigo-800">
                                                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                                                    <span>Auto-outreach & scheduling</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-indigo-900">₹249<span className="text-xs font-normal text-indigo-500">/mo</span></div>
                                            <label className="flex items-center justify-end gap-2 mt-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isChatbotIncluded}
                                                    onChange={(e) => setIsChatbotIncluded(e.target.checked)}
                                                    className="w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-xs font-medium text-indigo-700">Add</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center py-2 border-t border-slate-100">
                                    <span className="text-sm font-medium text-slate-600">Total due now</span>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-slate-900">₹{199 + (isChatbotIncluded ? 249 : 0)}</div>
                                        <div className="text-xs text-slate-400">Includes taxes</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={loading}
                                    className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                    {loading ? 'Processing payment...' : `Pay ₹${199 + (isChatbotIncluded ? 249 : 0)} & Verify`}
                                </button>

                                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                                    <Lock className="w-3 h-3" /> Secure payment via Stripe
                                </div>

                                <button
                                    onClick={() => setStep('company-form')}
                                    className="w-full text-center text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center gap-1 mt-4"
                                >
                                    <ArrowLeft className="w-3 h-3" /> Back to details
                                </button>
                            </div>
                        )}

                        {/* ═══════════════════════════════════════ */}
                        {/* STEP: SUCCESS                           */}
                        {/* ═══════════════════════════════════════ */}
                        {step === 'success' && (
                            <div className="text-center py-6 space-y-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 border-2 border-green-200">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Verification submitted</h2>
                                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                                        Your documents and deposit have been received. Our team will verify your details within <span className="font-medium text-slate-700">24–48 hours</span>.
                                    </p>
                                </div>

                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block">
                                    <div className="text-xs text-slate-400 mb-1">Application reference</div>
                                    <div className="text-blue-600 font-mono font-medium tracking-wider">
                                        VFY-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/recruiter-dashboard')}
                                    className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                                >
                                    Go to Dashboard
                                </button>

                                <p className="text-xs text-slate-400">
                                    You'll receive an email once verification is complete.
                                </p>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};
