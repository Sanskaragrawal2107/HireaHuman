
import React, { useEffect, useState, useRef } from 'react';
import { Shield, Loader, Upload, User, Code, MapPin, Briefcase, FileText, Github, Linkedin, Star, Zap, Eye, Printer, Globe, FolderGit2, Target, ExternalLink, TrendingUp, BarChart3 } from 'lucide-react';
import { insforge } from '../lib/insforge';
import { useNavigate, Link } from 'react-router-dom';
import { logger } from '../lib/logger';
import { useAuth } from '../context/AuthContext';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const { user: authUser, loading: authLoading } = useAuth(); // Get user from context
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showResume, setShowResume] = useState(false);
    const [monthlyViews, setMonthlyViews] = useState(0);

    useEffect(() => {
        if (!authLoading) {
            if (!authUser) {
                navigate('/join');
            } else {
                setUser(authUser);
                loadDashboard(authUser);
            }
        }

        // Load PayU Bolt Script
        const script = document.createElement('script');
        script.src = 'https://jssdk.payu.in/bolt/bolt.min.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Only remove if script is still in DOM
            if (script.parentNode) {
                document.body.removeChild(script);
            }
        };
    }, [authUser, authLoading, navigate]);

    const loadDashboard = async (currentUser: any) => {
        try {
            // No need to fetch user again

            // @ts-ignore
            const { data: profileData } = await insforge.database
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .maybeSingle();

            if (!profileData) {
                navigate('/profile');
                return;
            }
            setProfile(profileData);

            // Fetch monthly profile views
            try {
                const now = new Date();
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                // @ts-ignore
                const { data: viewsData, error: viewsError } = await insforge.database
                    .from('profile_views')
                    .select('id')
                    .eq('profile_id', currentUser.id)
                    .gte('viewed_at', monthStart);
                if (!viewsError && viewsData) {
                    setMonthlyViews(viewsData.length);
                }
            } catch (viewErr) {
                logger.error('Failed to load profile views:', viewErr);
            }
        } catch (err) {
            logger.error("Dashboard load error:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: any) => {
        if (!user || updating) return;
        setUpdating(true);
        try {
            // @ts-ignore
            const { error } = await insforge.database
                .from('profiles')
                .update(updates)
                .eq('id', user.id);
            if (error) throw error;
            setProfile({ ...profile, ...updates });
        } catch (err) {
            logger.error("Update error:", err);
        } finally {
            setUpdating(false);
        }
    };

    const toggleAvailability = () => {
        const newStatus = profile.employment_status === 'AVAILABLE' ? 'HIRED' : 'AVAILABLE';
        updateProfile({ employment_status: newStatus });
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            // @ts-ignore
            const { data, error } = await insforge.storage
                .from('avatars')
                .uploadAuto(file);

            if (error) throw error;
            if (!data) throw new Error('Upload failed');

            await updateProfile({ avatar_url: data.url });
        } catch (err) {
            logger.error('Upload error:', err);
            alert('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = async () => {
        try {
            // Clear authentication
            await insforge.auth.signOut();
            
            // Force a full page reload to clear all state
            window.location.href = '/';
        } catch (err) {
            logger.error('Logout error:', err);
            // Still redirect even if signOut fails
            window.location.href = '/';
        }
    };

    // Profile completeness
    const calculateCompleteness = () => {
        if (!profile) return 0;
        const fields = ['display_name', 'bio', 'location', 'role_title', 'preferred_location', 'github_url', 'linkedin_url', 'avatar_url'];
        const filled = fields.filter(f => profile[f] && profile[f].length > 0).length;
        const hasSkills = profile.skills && profile.skills.length > 0 ? 1 : 0;
        const hasExp = profile.experience_history && profile.experience_history.length > 0 ? 1 : 0;
        return Math.round(((filled + hasSkills + hasExp) / (fields.length + 2)) * 100);
    };

    const handleSubscribe = async () => {
        if (!user || !profile) return;
        setUpdating(true);
        try {
            // 1. Create Payment params via Edge Function
            // @ts-ignore
            const { data, error } = await insforge.functions.invoke('create-subscription', {
                body: { user_id: user.id, email: user.email }
            });

            if (error) throw error;
            const { key, txnid, amount, productinfo, firstname, email, surl, furl, hash, udf1, payu_base_url: _payu_base_url } = data;

            // 2. Launch PayU Bolt checkout
            // @ts-ignore
            if (!window.bolt) {
                throw new Error('PayU SDK not loaded. Please refresh and try again.');
            }

            const payuData = {
                key,
                txnid,
                hash,
                amount,
                firstname: profile.display_name || firstname,
                email,
                phone: '9406820661',
                productinfo,
                surl,
                furl,
                udf1,
            };

            // @ts-ignore
            window.bolt.launch(payuData, {
                responseHandler: async function (response: any) {
                    if (response.response.txnStatus === 'SUCCESS') {
                        // 3. Verify Payment via Edge Function
                        // @ts-ignore
                        const { data: verifyData, error: verifyError } = await insforge.functions.invoke('verify-subscription', {
                            body: {
                                txnid: txnid,
                                user_id: user.id
                            }
                        });

                        if (verifyError || !verifyData?.success) {
                            alert("Verification failed. Please contact support.");
                        } else {
                            // Success! Update local state
                            setProfile({ ...profile, bluetech_badge: true, bluetech_subscription_status: 'active' });
                            alert("Membership active! You now have the BlueTech Badge.");
                        }
                    } else {
                        alert("Payment was not successful. Please try again.");
                    }
                },
                catchException: function (error: any) {
                    logger.error("PayU Bolt error:", JSON.stringify(error));
                    alert("Payment failed: " + (typeof error === 'string' ? error : error?.message || JSON.stringify(error)));
                }
            });

        } catch (err: any) {
            logger.error("Subscription error:", err);
            alert("Failed to start subscription: " + err.message);
        } finally {
            setUpdating(false);
        }
    };

    const completeness = calculateCompleteness();
    // Profile edit counter with 30-day rolling window
    const getProfileEditsLeft = () => {
        if (!profile) return 2;
        const count = profile.profile_edit_count || 0;
        const lastEdit = profile.last_profile_edit ? new Date(profile.last_profile_edit) : null;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (lastEdit && lastEdit < thirtyDaysAgo) {
            return 2; // Reset after 30 days
        }
        return Math.max(0, 2 - count);
    };
    const profileEditsLeft = getProfileEditsLeft();

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader className="animate-spin text-cyan-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-mono">CANDIDATE_DASHBOARD</h1>
                        <p className="text-zinc-500 font-mono text-sm">Manage your professional profile & visibility.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleAvailability}
                            disabled={updating}
                            className={`flex items-center gap-2 px-4 py-2 border rounded font-mono text-xs uppercase tracking-widest transition-all ${profile?.employment_status === 'AVAILABLE'
                                ? 'text-green-400 border-green-500/30 bg-green-500/5 hover:bg-green-500/10'
                                : 'text-red-400 border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
                                }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${profile?.employment_status === 'AVAILABLE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            {profile?.employment_status || 'AVAILABLE'}
                        </button>
                        <button onClick={handleLogout} className="text-zinc-600 hover:text-white text-xs font-mono uppercase transition-colors">
                            LOGOUT
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Profile Card */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-xl">
                            <div className="flex items-start gap-6">
                                <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                                    {profile?.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt="Avatar"
                                            className="w-24 h-24 rounded-xl object-cover border-2 border-cyan-500/30 group-hover:border-cyan-500 transition-colors"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center group-hover:border-cyan-500 transition-colors">
                                            <User className="w-10 h-10 text-zinc-600" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        {uploading ? <Loader className="animate-spin text-cyan-500" /> : <Upload className="w-5 h-5 text-white" />}
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold text-white">{profile?.display_name}</h2>
                                        {profile?.bluetech_badge && (
                                            <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[10px] font-mono uppercase rounded flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> BlueTech
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-cyan-500 font-mono text-sm mb-1">@{profile?.handle}</p>
                                    <p className="text-zinc-400 text-sm flex items-center gap-2 flex-wrap">
                                        {profile?.role_title && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {profile.role_title}</span>}
                                        {profile?.location && <span className="flex items-center gap-1"><span className="text-zinc-700">•</span><MapPin className="w-3 h-3" /> {profile.location}</span>}
                                        {profile?.preferred_location && <span className="flex items-center gap-1 text-indigo-400"><span className="text-zinc-700">•</span><Globe className="w-3 h-3" /> Preferred: {profile.preferred_location}</span>}
                                    </p>
                                    <p className="text-zinc-500 text-sm mt-2 line-clamp-2">{profile?.bio}</p>
                                    {profile?.job_target && (
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <Target className="w-3 h-3 text-teal-500" />
                                            <span className="text-xs font-mono text-teal-400 uppercase tracking-wider">
                                                {profile.job_target === 'internship' ? '🎓 Seeking Internship' : '💼 Seeking Full-Time'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <Link to="/profile?edit=true" className="text-xs text-cyan-500 hover:text-white font-mono uppercase border border-cyan-500/30 px-3 py-1.5 rounded hover:bg-cyan-500/10 transition-all">
                                    Edit
                                </Link>
                            </div>
                        </section>

                        {/* Skills */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-xl">
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Code className="w-4 h-4" /> Technical Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {(profile?.skills || []).map((skill: string) => (
                                    <span key={skill} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono rounded">
                                        {skill}
                                    </span>
                                ))}
                                {(!profile?.skills || profile.skills.length === 0) && (
                                    <p className="text-zinc-600 text-sm font-mono">No skills added yet. <Link to="/profile?edit=true" className="text-cyan-500 hover:underline">Add skills →</Link></p>
                                )}
                            </div>
                        </section>

                        {/* Experience */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-xl">
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Experience History</h3>
                            {(profile?.experience_history || []).length > 0 ? (
                                <div className="space-y-4">
                                    {profile.experience_history.map((exp: any, i: number) => (
                                        <div key={i} className="flex items-start gap-4 p-3 bg-black/30 border border-zinc-800/50 rounded">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 shrink-0" />
                                            <div>
                                                <div className="font-bold text-white text-sm">{exp.role}</div>
                                                <div className="text-zinc-400 text-xs">{exp.company}</div>
                                                <div className="text-zinc-600 text-xs font-mono mt-1">{exp.from} — {exp.to || 'Present'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-600 text-sm font-mono">No experience added. <Link to="/profile?edit=true" className="text-cyan-500 hover:underline">Add experience →</Link></p>
                            )}
                        </section>

                        {/* Projects */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-xl">
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><FolderGit2 className="w-4 h-4" /> Projects</h3>
                            {(profile?.projects || []).length > 0 ? (
                                <div className="space-y-4">
                                    {profile.projects.map((proj: any, i: number) => (
                                        <div key={i} className="p-4 bg-black/30 border border-zinc-800/50 rounded space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="font-bold text-white text-sm">{proj.title}</div>
                                                {proj.url && (
                                                    <a href={proj.url} target="_blank" rel="noreferrer" className="text-cyan-500 hover:text-cyan-400 transition-colors">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                            {proj.description && <p className="text-zinc-400 text-xs">{proj.description}</p>}
                                            {proj.tech_stack && (
                                                <div className="flex flex-wrap gap-1">
                                                    {proj.tech_stack.split(',').map((tech: string, j: number) => (
                                                        <span key={j} className="px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[10px] font-mono rounded">
                                                            {tech.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-600 text-sm font-mono">No projects added. <Link to="/profile?edit=true" className="text-cyan-500 hover:underline">Add projects →</Link></p>
                            )}
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Profile Completeness */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-xl">
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Profile Completeness</h3>
                            <div className="relative w-full h-3 bg-zinc-800 rounded-full overflow-hidden mb-3">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${completeness >= 80 ? 'bg-green-500' : completeness >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${completeness}%` }}
                                />
                            </div>
                            <div className="text-3xl font-bold font-mono text-white">{completeness}%</div>
                            {completeness < 100 && (
                                <p className="text-zinc-600 text-xs mt-2 font-mono">Complete your profile for better AI matching</p>
                            )}
                        </section>

                        {/* Monthly Profile Views */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-xl">
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Profile Views</h3>
                            <div className="p-4 rounded border bg-cyan-500/5 border-cyan-500/20">
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-400 text-xs font-mono">This Month</span>
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
                                        <span className="text-2xl font-bold font-mono text-cyan-400">{monthlyViews}</span>
                                    </div>
                                </div>
                                <p className="text-zinc-600 text-[10px] font-mono mt-2">Times your profile was shown to recruiters via AI chatbot or agent this month.</p>
                            </div>
                        </section>

                        {/* Employment Status */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-xl">
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Employment Status</h3>
                            <div className={`p-4 rounded border text-center font-mono text-lg font-bold ${profile?.employment_status === 'AVAILABLE'
                                ? 'bg-green-500/5 border-green-500/30 text-green-400'
                                : 'bg-red-500/5 border-red-500/30 text-red-400'
                                }`}>
                                {profile?.employment_status === 'AVAILABLE' ? '🟢 AVAILABLE' : '🔴 HIRED'}
                            </div>
                        </section>

                        {/* Profile Edits */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-xl">
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Profile Edits</h3>

                            <div className={`p-3 rounded border mb-4 ${profileEditsLeft > 0 ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-400 text-xs font-mono">Edits remaining</span>
                                    <span className={`text-lg font-bold font-mono ${profileEditsLeft > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {profileEditsLeft}/2
                                    </span>
                                </div>
                                <p className="text-zinc-600 text-[10px] font-mono mt-1">Resets every 30 days. Prevents resume tailoring per job.</p>
                            </div>

                            <button
                                onClick={() => setShowResume(true)}
                                className="w-full py-2.5 border border-cyan-500/30 text-cyan-400 text-xs font-bold font-mono uppercase hover:bg-cyan-500/10 transition-all rounded flex items-center justify-center gap-2"
                            >
                                <Eye className="w-3.5 h-3.5" /> View Auto-Generated Resume
                            </button>
                        </section>

                        {/* Links */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-xl">
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Links</h3>
                            <div className="space-y-3">
                                {profile?.github_url && (
                                    <a href={profile.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                                        <Github className="w-4 h-4" /> GitHub
                                    </a>
                                )}
                                {profile?.linkedin_url && (
                                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                                        <Linkedin className="w-4 h-4" /> LinkedIn
                                    </a>
                                )}
                                {profile?.leetcode_url && (
                                    <a href={profile.leetcode_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                                        <Code className="w-4 h-4" /> LeetCode
                                    </a>
                                )}
                                {!profile?.github_url && !profile?.linkedin_url && !profile?.leetcode_url && (
                                    <p className="text-zinc-600 text-xs font-mono">No links added.</p>
                                )}
                            </div>
                        </section>

                        {/* BlueTech Badge */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-xl">
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Star className="w-4 h-4" /> BlueTech Badge</h3>
                            {profile?.bluetech_badge ? (
                                <div className="text-blue-400 font-mono text-sm flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Active — Priority visibility in search
                                </div>
                            ) : (
                                <div>
                                    <p className="text-zinc-600 text-xs font-mono mb-3">₹199/month for priority ranking and badge.</p>
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={updating}
                                        className="w-full py-2 border border-blue-500/30 text-blue-400 text-xs font-bold font-mono uppercase hover:bg-blue-500/10 transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed">
                                        {updating ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'Subscribe'}
                                    </button>
                                </div>
                            )}
                        </section>

                        {/* Verification */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 rounded-xl">
                            <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Verification</h3>
                            <div className="flex items-center gap-3">
                                <Shield className={`w-8 h-8 ${profile?.avatar_url ? 'text-green-500' : 'text-zinc-600'}`} />
                                <div>
                                    <div className="font-bold text-white text-sm">{profile?.avatar_url ? 'Photo Verified' : 'Unverified'}</div>
                                    <div className="text-xs text-zinc-500">{profile?.avatar_url ? 'Profile photo uploaded' : 'Upload photo to verify'}</div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* AUTO-GENERATED RESUME PREVIEW MODAL        */}
            {/* ═══════════════════════════════════════════ */}
            {showResume && profile && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowResume(false)}>
                    <div className="bg-white text-black max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Resume toolbar */}
                        <div className="sticky top-0 bg-zinc-100 border-b px-6 py-3 flex items-center justify-between rounded-t-xl">
                            <span className="text-xs font-mono text-zinc-500 uppercase">Auto-Generated Resume</span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => window.print()}
                                    className="text-xs text-zinc-600 hover:text-black flex items-center gap-1 font-mono"
                                >
                                    <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                                </button>
                                <button onClick={() => setShowResume(false)} className="text-zinc-400 hover:text-black text-lg font-mono">×</button>
                            </div>
                        </div>

                        {/* Resume content */}
                        <div className="p-8 space-y-6 print:p-4" id="resume-preview">
                            {/* Header */}
                            <div className="border-b-2 border-black pb-4">
                                <h1 className="text-2xl font-bold tracking-tight">{profile.display_name}</h1>
                                <p className="text-sm text-zinc-600 mt-1">{profile.role_title}</p>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-500">
                                    {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>}
                                    {profile.preferred_location && <span className="flex items-center gap-1 text-indigo-600"><Globe className="w-3 h-3" />Preferred: {profile.preferred_location}</span>}
                                    {profile.github_url && <a href={profile.github_url} className="flex items-center gap-1 text-blue-600 hover:underline"><Github className="w-3 h-3" />GitHub</a>}
                                    {profile.linkedin_url && <a href={profile.linkedin_url} className="flex items-center gap-1 text-blue-600 hover:underline"><Linkedin className="w-3 h-3" />LinkedIn</a>}
                                    {profile.leetcode_url && <a href={profile.leetcode_url} className="flex items-center gap-1 text-blue-600 hover:underline"><Code className="w-3 h-3" />LeetCode</a>}
                                </div>
                            </div>

                            {/* Summary */}
                            {profile.bio && (
                                <div>
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Summary</h2>
                                    <p className="text-sm text-zinc-700 leading-relaxed">{profile.bio}</p>
                                </div>
                            )}

                            {/* Skills */}
                            {profile.skills?.length > 0 && (
                                <div>
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Technical Skills</h2>
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.skills.map((skill: string) => (
                                            <span key={skill} className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Experience */}
                            {profile.experience_history?.length > 0 && (
                                <div>
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Experience</h2>
                                    <div className="space-y-4">
                                        {profile.experience_history.map((exp: any, i: number) => (
                                            <div key={i} className="border-l-2 border-zinc-200 pl-4">
                                                <div className="font-semibold text-sm">{exp.role}</div>
                                                <div className="text-xs text-zinc-500">{exp.company}</div>
                                                <div className="text-xs text-zinc-400 mt-0.5">{exp.from} — {exp.to || 'Present'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Info */}
                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between text-xs text-zinc-400">
                                    <span>Experience: {profile.years_of_experience || 0} years</span>
                                    <span>Status: {profile.employment_status}</span>
                                    {profile.bluetech_badge && <span className="text-blue-500 flex items-center gap-1"><Zap className="w-3 h-3" /> BlueTech Verified</span>}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center text-[10px] text-zinc-300 pt-2">
                                Generated by HireAHuman.ai • {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
