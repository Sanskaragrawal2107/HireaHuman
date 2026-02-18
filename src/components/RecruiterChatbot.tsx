import { useRef, useEffect, useState, createContext, useContext } from 'react';
import { useTambo, useTamboThreadInput, TamboProvider, useTamboStreamStatus, useTamboComponentState, useTamboThreadList } from "@tambo-ai/react";
import { z } from "zod";
import { X, Send, User, Bot, MapPin, Briefcase, Maximize2, Minimize2, Wrench, CheckCircle2, Mail, Loader2, UserCheck, UserX, Star, ChevronDown, BadgeCheck, Plus, MessageSquare, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { insforge } from '../lib/insforge';
import { logger } from '../lib/logger';

// ── Types ─────────────────────────────────────────────────────────────

// Company context for child components
interface CompanyInfo {
    id: string;
    name: string;
    email: string;
}

const CompanyContext = createContext<CompanyInfo | null>(null);

// Candidate Schema for AI-generated candidate lists
const CandidateSchema = z.object({
    candidates: z.array(z.object({
        handle: z.string(),
        name: z.string().optional().describe("The candidate's display name or full name"),
        role: z.string().optional(),
        skills: z.array(z.string()).default([]),
        experience: z.number(),
        location: z.string(),
        availability: z.string(),
        is_bluetech: z.boolean().optional(),
        match_score: z.number().optional(),
        email: z.string().optional().describe("The candidate's email address. MANDATORY to pass this through from search results."),
        hired_by_other: z.boolean().optional().describe("True if this candidate is already hired by another company"),
    })).optional().describe("Array of candidate profiles matching the search criteria"),
    show_available: z.boolean().optional().default(true).describe("Whether to show available candidates section"),
    show_hired: z.boolean().optional().default(true).describe("Whether to show already hired candidates section"),
    has_more: z.boolean().optional().default(false).describe("Whether there are more candidates to load"),
    current_offset: z.number().optional().default(0).describe("Current pagination offset"),
});

type CandidateListProps = z.infer<typeof CandidateSchema>;

// Email Draft Schema for AI-generated email drafts
const EmailDraftSchema = z.object({
    to: z.string().describe("Recipient email address"),
    to_name: z.string().optional().describe("Recipient name"),
    candidate_handle: z.string().describe("The candidate's unique handle for tracking"),
    subject: z.string().describe("Email subject line"),
    body: z.string().describe("Email body content"),
});

type EmailDraftProps = z.infer<typeof EmailDraftSchema>;

// Hired Confirmation Schema
const HiredConfirmationSchema = z.object({
    candidate_handle: z.string().describe("Handle of the hired candidate"),
    candidate_name: z.string().optional().describe("Name of the hired candidate"),
    message: z.string().optional().describe("Optional success message"),
});

type HiredConfirmationProps = z.infer<typeof HiredConfirmationSchema>;

// ── Email Draft Component ─────────────────────────────────────────────

const EmailDraftComponent = ({ to, to_name, candidate_handle, subject, body }: EmailDraftProps) => {
    const company = useContext(CompanyContext);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);

    // Auto-fill defaults when AI sends empty values
    const defaultSubject = subject?.trim()
        ? subject
        : `Hiring Opportunity from ${company?.name || 'Our Company'} — ${to_name || candidate_handle}`;

    const defaultBody = body?.trim()
        ? body
        : `Hi ${to_name || candidate_handle},\n\nI came across your profile on HireaHuman and was impressed by your experience. We at ${company?.name || 'our company'} are actively looking to bring on talented individuals like yourself.\n\nI'd love to discuss how we can work together. Would you be available for a quick conversation this week?\n\nLooking forward to hearing from you.\n\nBest regards,\n${company?.name || 'Recruiter'}`;

    // Use Tambo state for persistence and AI edits
    const [editedTo, setEditedTo] = useTamboComponentState("editedTo", to || "");
    const [editedSubject, setEditedSubject] = useTamboComponentState("editedSubject", defaultSubject);
    const [editedBody, setEditedBody] = useTamboComponentState("editedBody", defaultBody);
    
    // Ensure defaults update if props change (e.g. streaming update)
    useEffect(() => {
        if (to && to !== editedTo && !editMode) setEditedTo(to);
    }, [to, editMode]);

    useEffect(() => {
        if (subject && subject !== editedSubject && !editMode) setEditedSubject(subject);
    }, [subject, editMode]);

    useEffect(() => {
        if (body && body !== editedBody && !editMode) setEditedBody(body);
    }, [body, editMode]);

    const handleSendEmail = async () => {
        if (!company) {
            setError('Company context not available');
            return;
        }

        setSending(true);
        setError(null);

        try {
            // Send via server-side edge function (webhook URL stays server-side)
            const { data, error: fnError } = await insforge.functions.invoke('send-recruiter-email', {
                body: {
                    to: editedTo,
                    subject: editedSubject,
                    emailBody: editedBody,
                    candidate_handle,
                },
            });

            if (fnError) {
                throw new Error(fnError.message || 'Failed to send email');
            }

            if (data?.error) {
                throw new Error(data.error);
            }

            logger.info('Email sent via edge function');
            setSent(true);
        } catch (err) {
            logger.error('Email send error:', err);
            setError(err instanceof Error ? err.message : 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 my-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-green-400 text-sm">Email Sent Successfully!</h3>
                        <p className="text-xs text-green-400/70">Your hiring interest has been recorded</p>
                    </div>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                    The candidate will receive your email at <span className="text-white font-mono">{editedTo}</span>
                </p>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden my-4">
            {/* Header */}
            <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold text-white">Draft Email to {to_name || candidate_handle}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">From: {company?.name || 'Your Company'}</span>
                </div>
            </div>

            {/* Email Content */}
            <div className="p-4 space-y-4">
                {/* To Field — editable so recruiter can correct */}
                <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider">To</label>
                    {editMode ? (
                        <input
                            type="email"
                            value={editedTo}
                            onChange={(e) => setEditedTo(e.target.value)}
                            className="w-full bg-zinc-950 border border-cyan-500/50 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                    ) : (
                        <div className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 font-mono">
                            {editedTo}
                        </div>
                    )}
                </div>

                {/* Subject Field */}
                <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Subject</label>
                    {editMode ? (
                        <input
                            type="text"
                            value={editedSubject}
                            onChange={(e) => setEditedSubject(e.target.value)}
                            className="w-full bg-zinc-950 border border-cyan-500/50 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                    ) : (
                        <div className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white">
                            {editedSubject}
                        </div>
                    )}
                </div>

                {/* Body Field */}
                <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider">Message</label>
                    {editMode ? (
                        <textarea
                            value={editedBody}
                            onChange={(e) => setEditedBody(e.target.value)}
                            rows={8}
                            className="w-full bg-zinc-950 border border-cyan-500/50 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
                        />
                    ) : (
                        <div className="bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 whitespace-pre-wrap min-h-[120px]">
                            {editedBody}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded px-3 py-2 text-xs text-red-400">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={handleSendEmail}
                        disabled={sending}
                        className="flex-1 py-2.5 bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {sending ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-3.5 h-3.5" />
                                Send Email
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => setEditMode(!editMode)}
                        disabled={sending}
                        className="px-4 py-2.5 bg-zinc-800 text-zinc-300 font-medium text-xs uppercase tracking-wider rounded hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                        {editMode ? 'Preview' : 'Edit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Hired Confirmation Component ──────────────────────────────────────

const HiredConfirmationComponent = ({ candidate_handle, candidate_name, message }: HiredConfirmationProps) => {
    const company = useContext(CompanyContext);
    const [marking, setMarking] = useState(false);
    const [marked, setMarked] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMarkAsHired = async () => {
        if (!company) {
            setError('Company context not available');
            return;
        }

        setMarking(true);
        setError(null);

        try {
            // Call edge function to mark as hired (server-side, bypasses RLS)
            // @ts-ignore
            const { data: markResult, error: markError } = await insforge.functions.invoke('mark-hired', {
                body: { candidate_handle },
            });

            if (markError) throw new Error(markError.message || 'Failed to mark as hired');
            if (!markResult?.success) throw new Error('Server returned failure');

            logger.info('Candidate marked as hired via edge function');
            setMarked(true);
        } catch (err) {
            logger.error('Mark hired error:', err);
            setError(err instanceof Error ? err.message : 'Failed to mark as hired');
        } finally {
            setMarking(false);
        }
    };

    if (marked) {
        return (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 my-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-green-400">Candidate Marked as Hired!</h3>
                        <p className="text-sm text-zinc-400">
                            <span className="text-white font-medium">@{candidate_handle}</span> has been marked as hired by <span className="text-cyan-400">{company?.name}</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-5 my-4">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                    <UserCheck className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">Mark as Hired?</h3>
                    <p className="text-sm text-zinc-400 mb-4">
                        {message || `Confirm that you've hired ${candidate_name || '@' + candidate_handle}. This will update their availability status.`}
                    </p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded px-3 py-2 text-xs text-red-400 mb-4">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleMarkAsHired}
                            disabled={marking}
                            className="px-5 py-2 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {marking ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Confirm Hired
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Candidate List Component ──────────────────────────────────────────

const CandidateList = ({ candidates, show_available = true, show_hired = true, has_more = false }: CandidateListProps) => {
    const { streamStatus } = useTamboStreamStatus();
    const { setValue, submit } = useTamboThreadInput();

    const hasData = candidates && candidates.length > 0;
    const isLoading = (streamStatus.isStreaming || streamStatus.isPending) && !hasData;

    // Split candidates into available and hired
    const availableCandidates = candidates?.filter(c => c.availability === 'AVAILABLE' && !c.hired_by_other) || [];
    const hiredCandidates = candidates?.filter(c => c.availability === 'HIRED' || c.hired_by_other) || [];

    // Sort each group: bluetech first, then by experience
    const sortCandidates = (list: typeof availableCandidates) => {
        return [...list].sort((a, b) => {
            if (a.is_bluetech && !b.is_bluetech) return -1;
            if (!a.is_bluetech && b.is_bluetech) return 1;
            return (b.experience || 0) - (a.experience || 0);
        });
    };

    const sortedAvailable = sortCandidates(availableCandidates);
    const sortedHired = sortCandidates(hiredCandidates);

    // Limit to show 3 verified + 7 unverified max (or actual count if less)
    const limitCandidates = (list: typeof availableCandidates) => {
        const verified = list.filter(c => c.is_bluetech);
        const unverified = list.filter(c => !c.is_bluetech);
        return [...verified.slice(0, 3), ...unverified.slice(0, 7)];
    };

    const displayAvailable = limitCandidates(sortedAvailable);
    const displayHired = limitCandidates(sortedHired);

    type CandidateType = NonNullable<typeof candidates>[number];
    
    const handleWantToHire = (candidate: CandidateType) => {
        const candidateName = candidate.name || candidate.handle;
        const candidateEmail = candidate.email || 'unknown';
        
        setValue(`I want to hire @${candidate.handle}. Their email is ${candidateEmail}. Their name is ${candidateName}. Please draft a professional hiring email for me with a filled-in subject and body.`);
        setTimeout(() => submit(), 100);
    };

    const handleLoadMore = () => {
        setValue(`Show me 10 more candidates`);
        setTimeout(() => submit(), 100);
    };

    if (isLoading) {
        return (
            <div className="space-y-3 my-4 w-full">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-zinc-800 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-zinc-800 rounded w-2/3 mb-3"></div>
                    <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
                </div>
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className="space-y-3 my-4 w-full">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                    <p className="text-zinc-500 text-sm">No candidates found. Try adjusting your search criteria.</p>
                </div>
            </div>
        );
    }

    const CandidateCard = ({ candidate, isHired = false }: { candidate: CandidateType; isHired?: boolean }) => (
        <div key={candidate.handle} className={`bg-zinc-900 border rounded-xl p-4 transition-colors group ${
            isHired ? 'border-zinc-700 opacity-75' : 'border-zinc-800 hover:border-cyan-500/50'
        }`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 relative">
                        {candidate.handle.substring(0, 2).toUpperCase()}
                        {candidate.is_bluetech && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                                <Star className="w-2.5 h-2.5 text-black" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            @{candidate.handle}
                            {candidate.is_bluetech && (
                                <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[9px] font-bold uppercase rounded flex items-center gap-0.5">
                                    <BadgeCheck className="w-2.5 h-2.5" /> Verified
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-zinc-500">{candidate.role || 'Software Engineer'}</div>
                    </div>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    isHired 
                        ? 'bg-red-500/10 text-red-400' 
                        : 'bg-green-500/10 text-green-500'
                }`}>
                    {isHired ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                    {isHired ? 'HIRED' : 'AVAILABLE'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3 h-3" /> {candidate.experience}y exp
                </div>
                <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> {candidate.location}
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
                {(candidate.skills || []).slice(0, 4).map(skill => (
                    <span key={skill} className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-300 border border-zinc-700">
                        {skill}
                    </span>
                ))}
                {(candidate.skills || []).length > 4 && (
                    <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-500">
                        +{(candidate.skills || []).length - 4}
                    </span>
                )}
            </div>

            {!isHired && (
                <button 
                    onClick={() => handleWantToHire(candidate)}
                    className="w-full py-2 text-xs font-bold bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 rounded transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                    <Mail className="w-3.5 h-3.5" />
                    Want to Hire
                </button>
            )}
            {isHired && (
                <div className="w-full py-2 text-xs font-medium bg-zinc-800 text-zinc-500 border border-zinc-700 rounded text-center">
                    Already hired by another company
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6 my-4 w-full">
            {/* Available Candidates Section */}
            {show_available && displayAvailable.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <UserCheck className="w-4 h-4 text-green-400" />
                        <h3 className="text-sm font-bold text-white">Available Candidates</h3>
                        <span className="text-xs text-zinc-500">({displayAvailable.length})</span>
                    </div>
                    <div className="space-y-3">
                        {displayAvailable.map((candidate) => (
                            <CandidateCard key={candidate.handle} candidate={candidate} isHired={false} />
                        ))}
                    </div>
                </div>
            )}

            {/* Hired Candidates Section */}
            {show_hired && displayHired.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <UserX className="w-4 h-4 text-red-400" />
                        <h3 className="text-sm font-bold text-white">Already Hired</h3>
                        <span className="text-xs text-zinc-500">({displayHired.length})</span>
                    </div>
                    <div className="space-y-3 opacity-60">
                        {displayHired.map((candidate) => (
                            <CandidateCard key={candidate.handle} candidate={candidate} isHired={true} />
                        ))}
                    </div>
                </div>
            )}

            {/* Load More Button */}
            {has_more && (
                <button
                    onClick={handleLoadMore}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-medium text-zinc-300 flex items-center justify-center gap-2 transition-colors"
                >
                    <ChevronDown className="w-4 h-4" />
                    Load More Candidates
                </button>
            )}
        </div>
    );
};

// ── Thread List Sidebar ───────────────────────────────────────────────

const ThreadListSidebar = ({ onNewThread, onSelectThread, activeThreadId }: { onNewThread: () => void; onSelectThread: (threadId: string) => void; activeThreadId: string }) => {
    const { data: threadListData, isLoading, refetch } = useTamboThreadList();

    useEffect(() => {
        refetch?.();
    }, []);

    const threadsList = threadListData?.threads ?? [];

    return (
        <div className="w-full h-full flex flex-col bg-zinc-950 border-r border-zinc-800">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Conversations</h3>
                <button
                    onClick={onNewThread}
                    className="p-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                    title="New conversation"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {isLoading && (
                    <div className="p-4 text-center">
                        <Loader2 className="w-4 h-4 text-zinc-500 animate-spin mx-auto" />
                    </div>
                )}
                {threadsList.length > 0 ? (
                    <div className="space-y-0.5 p-1">
                        {threadsList.map((thread: any) => (
                            <button
                                key={thread.id}
                                onClick={() => onSelectThread(thread.id)}
                                className={`w-full text-left p-3 rounded-lg transition-colors group ${
                                    activeThreadId === thread.id
                                        ? 'bg-cyan-500/10 border border-cyan-500/30'
                                        : 'hover:bg-zinc-900 border border-transparent'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <MessageSquare className={`w-3 h-3 ${activeThreadId === thread.id ? 'text-cyan-400' : 'text-zinc-600'}`} />
                                    <span className={`text-xs font-medium truncate ${activeThreadId === thread.id ? 'text-cyan-300' : 'text-zinc-400'}`}>
                                        {thread.name || 'Conversation'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 ml-5">
                                    <Clock className="w-2.5 h-2.5 text-zinc-600" />
                                    <span className="text-[10px] text-zinc-600">
                                        {new Date(thread.createdAt || thread.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : !isLoading ? (
                    <div className="p-4 text-center">
                        <MessageSquare className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                        <p className="text-[10px] text-zinc-600">No conversations yet</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

// ── Chat Interface ────────────────────────────────────────────────────

const ChatInterface = ({ onClose, isFullscreen, toggleFullscreen }: { onClose: () => void; isFullscreen: boolean; toggleFullscreen: () => void }) => {
    const { messages, switchThread, startNewThread, currentThreadId } = useTambo();
    const { value, setValue, submit, isPending } = useTamboThreadInput();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showThreads, setShowThreads] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isPending]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!value.trim()) return;
        submit();
        setValue('');
    };

    const handleNewThread = () => {
        // Start a fresh thread — Tambo generates a new placeholder ID
        startNewThread();
        setShowThreads(false);
    };

    const handleSelectThread = (threadId: string) => {
        switchThread(threadId);
        setShowThreads(false);
    };

    return (
        <div className="flex h-full bg-black text-white font-sans">
            {/* Thread sidebar - shown in fullscreen or when toggled */}
            {(isFullscreen || showThreads) && (
                <div className={`${isFullscreen ? 'w-64' : 'w-56'} shrink-0 h-full`}>
                    <ThreadListSidebar onNewThread={handleNewThread} onSelectThread={handleSelectThread} activeThreadId={currentThreadId} />
                </div>
            )}

            <div className="flex flex-col flex-1 min-w-0">
                {/* Header */}
                <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur shrink-0">
                    <div className="flex items-center gap-2">
                        {!isFullscreen && (
                            <button
                                onClick={() => setShowThreads(!showThreads)}
                                className={`p-2 rounded-lg transition-colors ${showThreads ? 'bg-cyan-500/10 text-cyan-400' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}
                                title="Chat history"
                            >
                                <MessageSquare className="w-4 h-4" />
                            </button>
                        )}
                        <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                            <Bot className="w-4 h-4 text-cyan-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Talent Agent</h3>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                ONLINE
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleNewThread}
                            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            title="New conversation"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {messages.filter((m) => m.role !== 'system').length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
                        <Bot className="w-12 h-12 text-zinc-700" />
                        <div className="space-y-1">
                            <p className="text-zinc-400 text-sm">How can I help you hire today?</p>
                            <p className="text-zinc-600 text-xs">Try: "Find React developers in SF with 5y exp"</p>
                        </div>
                    </div>
                )}

                {messages.filter((m) => m.role !== 'system').map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === 'user' ? 'bg-zinc-800' : 'bg-cyan-500/10'
                            }`}>
                            {message.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-cyan-500" />}
                        </div>

                        <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {message.content.map((block: any, idx: number) => {
                                if (block.type === 'text') {
                                    return (
                                        <div key={idx} className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${message.role === 'user'
                                            ? 'bg-zinc-800 text-white rounded-tr-none'
                                            : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
                                            }`}>
                                            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-white prose-headings:text-white prose-a:text-cyan-400 prose-code:text-cyan-300 prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded whitespace-pre-wrap">
                                                <ReactMarkdown>{block.text}</ReactMarkdown>
                                            </div>
                                        </div>
                                    );
                                }

                                if (block.type === 'tool_use') {
                                    return (
                                        <div key={idx} className="w-full">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                <Wrench className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-amber-300 font-medium">Using tool: {block.name}</p>
                                                    {block.input && (
                                                        <p className="text-[10px] text-amber-400/70 mt-0.5 font-mono">
                                                            {JSON.stringify(block.input).substring(0, 100)}{JSON.stringify(block.input).length > 100 ? '...' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                if (block.type === 'tool_result') {
                                    return (
                                        <div key={idx} className="w-full">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                                <p className="text-xs text-green-300">Tool completed successfully</p>
                                            </div>
                                        </div>
                                    );
                                }

                                if (block.type === 'component' && block.renderedComponent) {
                                    return (
                                        <div key={idx} className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            {block.renderedComponent}
                                        </div>
                                    );
                                }

                                return null;
                            })}
                        </div>
                    </div>
                ))}

                {isPending && (
                    <div className="flex gap-3 animate-in fade-in duration-300">
                        <div className="w-8 h-8 bg-cyan-500/10 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-cyan-500 animate-bounce" />
                        </div>
                        <div className="flex flex-col gap-1 items-start justify-center">
                            <div className="text-xs text-zinc-500 font-medium mb-1">Thinking...</div>
                            <div className="flex items-center gap-1 h-2">
                                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-zinc-800 bg-zinc-900/30 backdrop-blur"
            >
                <div className="relative flex items-center gap-2">
                    <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Ask to find talent..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-zinc-600"
                    />
                    <button
                        type="submit"
                        disabled={!value.trim() || isPending}
                        className="absolute right-2 p-1.5 bg-white text-black rounded-lg hover:bg-cyan-50 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
            </div>
        </div>
    );
};

// ── Wrapper ───────────────────────────────────────────────────────────

interface RecruiterChatbotProps {
    isOpen: boolean;
    onClose: () => void;
    userKey?: string;
    company?: CompanyInfo;
}

export const RecruiterChatbot = ({ isOpen, onClose, userKey, company }: RecruiterChatbotProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Register components for Tambo
    const components = [
        {
            name: 'CandidateList',
            description: `Displays a list of candidates matching the search criteria. Shows up to 10 candidates per batch (3 verified BlueTech badge holders first, then 7 regular). Separates candidates into "Available" and "Already Hired" sections. Each candidate card has a "Want to Hire" button for available candidates. Set has_more=true if more candidates exist to show a "Load More" button.`,
            component: CandidateList,
            propsSchema: CandidateSchema
        },
        {
            name: 'EmailDraft',
            description: `Renders an email draft UI when a recruiter wants to hire a candidate. You MUST fill in ALL fields:
- "to": The candidate's actual email from the search results or profile data (NOT the recruiter's email).
- "to_name": The candidate's display name.
- "candidate_handle": The candidate's handle for tracking.
- "subject": A professional subject line, e.g. "Exciting Opportunity at ${company?.name || 'Our Company'} — We'd Love to Work With You".
- "body": A professional, warm hiring email body. Include: greeting with candidate name, why they caught your eye, what ${company?.name || 'the company'} does, invitation to chat, and a sign-off from ${company?.name || 'the company'}.
NEVER leave subject or body empty. Always generate compelling, ready-to-send content.`,
            component: EmailDraftComponent,
            propsSchema: EmailDraftSchema
        },
        {
            name: 'HiredConfirmation',
            description: `Shows a confirmation UI to mark a candidate as officially hired. Use this when the recruiter says they've completed the hiring process and want to mark the candidate as hired.`,
            component: HiredConfirmationComponent,
            propsSchema: HiredConfirmationSchema
        }
    ];

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    // Keep TamboProvider always mounted so chat history persists across open/close
    return (
        <CompanyContext.Provider value={company || null}>
            <TamboProvider
                apiKey={import.meta.env.VITE_TAMBO_API_KEY || "demo"}
                userKey={userKey || "guest-recruiter"}
                components={components}
            >
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={onClose}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                            />

                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className={`fixed top-0 bottom-0 bg-black shadow-2xl z-[101] ${isFullscreen
                                    ? 'left-0 right-0 border-none'
                                    : 'right-0 w-full max-w-md border-l border-zinc-800'
                                    }`}
                            >
                                <ChatInterface
                                    onClose={onClose}
                                    isFullscreen={isFullscreen}
                                    toggleFullscreen={toggleFullscreen}
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </TamboProvider>
        </CompanyContext.Provider>
    );
};
