
import { useEffect, useState } from 'react';
import { Settings, Clock, CheckCircle, XCircle, Building2, Users, Briefcase, ExternalLink, Globe, Loader2, LogOut, Shield, UserCheck, Mail, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { RecruiterChatbot } from '../components/RecruiterChatbot';
import { logger } from '../lib/logger';

interface HiringRecord {
    id: string;
    candidate_id: string;
    status: string;
    email_sent: boolean;
    notes: string;
    created_at: string;
    hired_at: string;
    interview_scheduled: boolean;
    handle: string;
    display_name: string;
    role_title: string;
    skills: string[];
    employment_status: string;
    avatar_url: string;
    location: string;
}

export const RecruiterDashboard = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [profileCount, setProfileCount] = useState(0);
    const [description, setDescription] = useState('');
    const [savingDesc, setSavingDesc] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Real hiring data
    const [hiredCandidates, setHiredCandidates] = useState<HiringRecord[]>([]);
    const [shortlistedCandidates, setShortlistedCandidates] = useState<HiringRecord[]>([]);
    const [allHirings, setAllHirings] = useState<HiringRecord[]>([]);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                // @ts-ignore
                const { data: { user } } = await insforge.auth.getCurrentUser();
                if (!user) {
                    navigate('/verify');
                    return;
                }

                const { data, error } = await insforge.database.from('companies').select('*').eq('user_id', user.id).single();
                if (error || !data) {
                    navigate('/verify');
                    return;
                }

                // Block access if payment was never completed
                if (data.subscription_status !== 'paid' && data.subscription_status !== 'active') {
                    navigate('/verify');
                    return;
                }

                setCompany(data);
                setDescription(data.description || '');

                // Get total profile count
                const { count } = await insforge.database.from('profiles').select('*', { count: 'exact', head: true });
                if (count) setProfileCount(count);

                // Fetch all hiring records with candidate profile data using a view/join
                const { data: hirings, error: hiringsError } = await insforge.database
                    .from('hirings')
                    .select('*')
                    .eq('company_id', data.id)
                    .order('created_at', { ascending: false });

                if (!hiringsError && hirings && hirings.length > 0) {
                    // Fetch candidate profiles for all hiring records
                    const candidateIds = hirings.map((h: any) => h.candidate_id);
                    const { data: profiles } = await insforge.database
                        .from('profiles')
                        .select('id, handle, display_name, role_title, skills, employment_status, avatar_url, location')
                        .in('id', candidateIds);

                    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

                    const enriched: HiringRecord[] = hirings.map((h: any) => {
                        const p = profileMap.get(h.candidate_id) || {};
                        return { ...h, ...p };
                    });

                    setAllHirings(enriched);
                    setHiredCandidates(enriched.filter((h: HiringRecord) => h.status === 'hired'));
                    setShortlistedCandidates(enriched.filter((h: HiringRecord) => h.status === 'offered'));
                }
            } catch {
                navigate('/verify');
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [navigate]);

    const handleSaveDescription = async () => {
        if (!company) return;
        setSavingDesc(true);
        try {
            await insforge.database.from('companies').update({ description }).eq('id', company.id);
        } catch (err) {
            logger.error('Failed to update description:', err);
        } finally {
            setSavingDesc(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await insforge.auth.signOut();
            window.location.href = '/';
        } catch (err) {
            logger.error('Logout error:', err);
            window.location.href = '/';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!company) return null;

    const status = company.status as 'pending' | 'verified' | 'rejected';
    const isVerified = status === 'verified';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 text-slate-900">

            {/* Top Nav */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900">{company.name}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                {company.website && (
                                    <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                        <Globe className="w-3 h-3" /> {new URL(company.website.startsWith('http') ? company.website : `https://${company.website}`).hostname}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${status === 'verified' ? 'bg-green-50 text-green-700 border border-green-200' :
                            status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {status === 'verified' ? <CheckCircle className="w-3.5 h-3.5" /> :
                                status === 'pending' ? <Clock className="w-3.5 h-3.5" /> :
                                    <XCircle className="w-3.5 h-3.5" />}
                            {status === 'verified' ? 'Verified' : status === 'pending' ? 'Pending Review' : 'Rejected'}
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Status Banner */}
                {status === 'pending' && (
                    <div className="mb-8 bg-white border border-amber-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Verification in progress</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Your documents and security deposit have been received. Our team is verifying your domain records, business registration, and LinkedIn presence. This typically takes <span className="font-medium text-slate-700">24–48 hours</span>.
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                You'll receive an email once the review is complete. In the meantime, you can set up your company profile below.
                            </p>
                        </div>
                    </div>
                )}

                {status === 'rejected' && (
                    <div className="mb-8 bg-white border border-red-200 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-1">Verification declined</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-3">
                                We were unable to verify your organization. Your security deposit will be fully refunded within 5–7 business days.
                            </p>
                            {company.rejection_reason && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700">
                                    <span className="font-medium block mb-1">Reason provided:</span>
                                    {company.rejection_reason}
                                </div>
                            )}
                            <p className="text-xs text-slate-400 mt-2">Please contact support if you believe this was an error.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
                                    <Users className="w-3.5 h-3.5" /> Talent Pool
                                </div>
                                <div className="text-2xl font-bold text-slate-900">{profileCount.toLocaleString()}</div>
                                <div className="text-xs text-slate-400 mt-1">engineers indexed</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
                                    <UserCheck className="w-3.5 h-3.5" /> Hired
                                </div>
                                <div className="text-2xl font-bold text-green-600">{hiredCandidates.length}</div>
                                <div className="text-xs text-slate-400 mt-1">candidates hired</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
                                    <Mail className="w-3.5 h-3.5" /> Shortlisted
                                </div>
                                <div className="text-2xl font-bold text-blue-600">{shortlistedCandidates.length}</div>
                                <div className="text-xs text-slate-400 mt-1">offers sent</div>
                            </div>
                        </div>

                        {/* Hired Candidates - Real Data */}
                        {hiredCandidates.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                                    <UserCheck className="w-4 h-4 text-green-600" /> Hired Candidates ({hiredCandidates.length})
                                </h3>
                                <div className="space-y-3">
                                    {hiredCandidates.map((h) => (
                                        <div key={h.id} className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {h.avatar_url ? (
                                                    <img src={h.avatar_url} alt={h.display_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserCheck className="w-5 h-5 text-green-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 text-sm">{h.display_name || h.handle}</span>
                                                    <span className="text-xs text-slate-500">@{h.handle}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">{h.role_title || 'Engineer'}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {h.location && (
                                                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                                            <MapPin className="w-2.5 h-2.5" /> {h.location}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                                                        <CheckCircle className="w-2.5 h-2.5" /> Hired {h.hired_at ? new Date(h.hired_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                {(h.skills || []).slice(0, 3).map((s: string) => (
                                                    <span key={s} className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full border border-green-200">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Shortlisted / Offered Candidates - Real Data */}
                        {shortlistedCandidates.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-blue-600" /> Shortlisted — Offers Sent ({shortlistedCandidates.length})
                                </h3>
                                <div className="space-y-3">
                                    {shortlistedCandidates.map((h) => (
                                        <div key={h.id} className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                                                {h.avatar_url ? (
                                                    <img src={h.avatar_url} alt={h.display_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Mail className="w-5 h-5 text-blue-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-900 text-sm">{h.display_name || h.handle}</span>
                                                    <span className="text-xs text-slate-500">@{h.handle}</span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">{h.role_title || 'Engineer'}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {h.location && (
                                                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                                            <MapPin className="w-2.5 h-2.5" /> {h.location}
                                                        </span>
                                                    )}
                                                    {h.email_sent && (
                                                        <span className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                                                            <Mail className="w-2.5 h-2.5" /> Email sent
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                {(h.skills || []).slice(0, 3).map((s: string) => (
                                                    <span key={s} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full border border-blue-200">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty state if no hiring activity */}
                        {hiredCandidates.length === 0 && shortlistedCandidates.length === 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
                                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                <h3 className="font-semibold text-slate-700 mb-1">No hiring activity yet</h3>
                                <p className="text-sm text-slate-400 mb-4">Use the AI Talent Search to find and reach out to candidates.</p>
                                <button
                                    onClick={() => isVerified && setIsChatOpen(true)}
                                    disabled={!isVerified}
                                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 shadow-lg shadow-blue-600/20"
                                >
                                    Start Searching
                                </button>
                            </div>
                        )}

                        {/* Company Profile Editor */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-slate-500" /> Company Profile
                                </h3>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Company name</label>
                                        <div className="text-slate-900 font-medium">{company.name}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Contact email</label>
                                        <div className="text-slate-900">{company.email}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Website</label>
                                        <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                            {company.website} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-500 mb-1 block">Business ID</label>
                                        <div className="text-slate-900 font-mono text-xs">{company.business_id || '—'}</div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <label className="text-xs font-medium text-slate-500 mb-2 block">Company description</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Describe your company, mission, and what you're building..."
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none placeholder:text-slate-400 text-sm"
                                    />
                                    <div className="flex justify-end mt-3">
                                        <button
                                            onClick={handleSaveDescription}
                                            disabled={savingDesc}
                                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-blue-600/20"
                                        >
                                            {savingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                            {savingDesc ? 'Saving...' : 'Save changes'}
                                        </button>
                                    </div>
                                </div>

                                {/* Tech Stack */}
                                <div className="border-t border-slate-100 pt-5">
                                    <label className="text-xs font-medium text-slate-500 mb-2 block">Tech stack</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(company.tech_stack || []).map((tag: string) => (
                                            <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200 font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                        {(!company.tech_stack || company.tech_stack.length === 0) && (
                                            <span className="text-xs text-slate-400">No tech stack specified yet.</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Tech stack is used for AI-powered candidate matching.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Primary Action */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-slate-500" /> Browse Talent
                            </h3>
                            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                                {isVerified
                                    ? 'Search and filter engineers by skills, experience, and availability.'
                                    : 'Complete verification to access the talent directory.'
                                }
                            </p>
                            <button
                                onClick={() => isVerified && setIsChatOpen(true)}
                                disabled={!isVerified}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${isVerified
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {isVerified ? <><Users className="w-4 h-4" /> AI Talent Search</> : <><Shield className="w-4 h-4" /> Verification Required</>}
                            </button>
                        </div>

                        {/* Scheduled Interviews */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-slate-500" /> Scheduled Interviews
                            </h3>
                            {(() => {
                                const interviewCandidates = allHirings.filter(h => h.interview_scheduled);
                                if (interviewCandidates.length === 0) {
                                    return (
                                        <div className="text-center py-4">
                                            <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                            <p className="text-xs text-slate-400">No interviews scheduled yet.</p>
                                            <p className="text-[10px] text-slate-300 mt-1">Use the AI agent to schedule interviews.</p>
                                        </div>
                                    );
                                }
                                return (
                                    <div className="space-y-3">
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-indigo-600 font-medium">Total Scheduled</span>
                                                <span className="text-lg font-bold text-indigo-700">{interviewCandidates.length}</span>
                                            </div>
                                        </div>
                                        {interviewCandidates.map(h => (
                                            <div key={h.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {h.avatar_url ? (
                                                        <img src={h.avatar_url} alt={h.display_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Calendar className="w-4 h-4 text-indigo-600" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-semibold text-slate-900 truncate">{h.display_name || h.handle}</div>
                                                    <div className="text-[10px] text-slate-400">{h.role_title || 'Engineer'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Recent Activity Timeline */}
                        {allHirings.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-slate-500" /> Recent Activity
                                </h3>
                                <div className="space-y-4">
                                    {allHirings.slice(0, 5).map(h => (
                                        <div key={h.id} className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                                h.status === 'hired' ? 'bg-green-500' : 'bg-blue-500'
                                            }`} />
                                            <div className="min-w-0">
                                                <div className="text-xs text-slate-700">
                                                    {h.status === 'hired' ? (
                                                        <><span className="font-semibold">{h.display_name || h.handle}</span> was hired</>
                                                    ) : (
                                                        <>Offer sent to <span className="font-semibold">{h.display_name || h.handle}</span></>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">
                                                    {new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    {h.email_sent && ' · Email sent'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Account Info */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Account</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Status</span>
                                    <span className={`font-medium ${isVerified ? 'text-green-600' : status === 'pending' ? 'text-amber-600' : 'text-red-600'}`}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Member since</span>
                                    <span className="text-slate-700">
                                        {new Date(company.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Plan</span>
                                    <span className={`font-medium ${company.subscription_status === 'active' || company.subscription_status === 'paid' ? 'text-blue-600' : 'text-slate-400'}`}>
                                        {company.subscription_plan === 'verified_plus_chatbot' ? 'Verified + AI Agent' :
                                            company.subscription_plan === 'verified' ? 'Verified' :
                                            company.subscription_status === 'paid' ? 'Verified' : 'No Plan'}
                                    </span>
                                </div>
                                {(company.subscription_status === 'active' || company.subscription_status === 'paid') && company.subscription_expires_at && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Renews</span>
                                        <span className="text-slate-700">
                                            {new Date(company.subscription_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                                {company.chatbot_enabled && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">AI Agent</span>
                                        <span className="text-green-600 font-medium">Active</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RecruiterChatbot 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                userKey={company?.id || "guest-recruiter"}
                company={company ? { id: company.id, name: company.name, email: company.email } : undefined}
            />
        </div>
    );
};
