
import { useRef, useEffect } from 'react';
import { useTambo, useTamboThreadInput, TamboProvider } from "@tambo-ai/react";
import { z } from "zod";
import { X, Send, User, Bot, Loader2, CheckCircle, MapPin, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ─────────────────────────────────────────────────────────────

const CandidateSchema = z.object({
    candidates: z.array(z.object({
        handle: z.string(),
        role: z.string().optional(),
        skills: z.array(z.string()),
        experience: z.number(),
        location: z.string(),
        availability: z.string(),
        is_bluetech: z.boolean().optional(),
        match_score: z.number().optional()
    }))
});

type CandidateListProps = z.infer<typeof CandidateSchema>;

// ── Components to Render ──────────────────────────────────────────────

const CandidateList = ({ candidates }: CandidateListProps) => {
    return (
        <div className="space-y-3 my-4 w-full">
            {candidates.map((candidate) => (
                <div key={candidate.handle} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-cyan-500/50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                {candidate.handle.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                    @{candidate.handle}
                                    {candidate.is_bluetech && <CheckCircle className="w-3 h-3 text-cyan-500" />}
                                </div>
                                <div className="text-xs text-zinc-500">{candidate.role || 'Software Engineer'}</div>
                            </div>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${candidate.availability === 'AVAILABLE' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                            {candidate.availability}
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

                    <div className="flex flex-wrap gap-1.5">
                        {candidate.skills.slice(0, 4).map(skill => (
                            <span key={skill} className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-300 border border-zinc-700">
                                {skill}
                            </span>
                        ))}
                    </div>

                    <button className="w-full mt-3 py-1.5 text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 rounded transition-colors">
                        View Profile
                    </button>
                </div>
            ))}
        </div>
    );
};

// ── Chat Interface ────────────────────────────────────────────────────

const ChatInterface = ({ onClose }: { onClose: () => void }) => {
    const { messages } = useTambo();
    const { value, setValue, submit, isPending } = useTamboThreadInput();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-black text-white font-sans">
            {/* Header */}
            <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur">
                <div className="flex items-center gap-2">
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
                <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4">
                        <Bot className="w-12 h-12 text-zinc-700" />
                        <div className="space-y-1">
                            <p className="text-zinc-400 text-sm">How can I help you hire today?</p>
                            <p className="text-zinc-600 text-xs">Try: "Find React developers in SF with 5y exp"</p>
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === 'user' ? 'bg-zinc-800' : 'bg-cyan-500/10'
                            }`}>
                            {message.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-cyan-500" />}
                        </div>

                        <div className={`flex flex-col gap-1 max-w-[85%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {message.content.map((block: any, idx: number) => {
                                if (block.type === 'text') {
                                    return (
                                        <div key={idx} className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${message.role === 'user'
                                            ? 'bg-zinc-800 text-white rounded-tr-none'
                                            : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
                                            }`}>
                                            {block.text}
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
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-cyan-500/10 rounded-full flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                        </div>
                        <div className="flex items-center gap-1 h-8">
                            <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full animate-bounce" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={(e) => { e.preventDefault(); submit(); }}
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
    );
};

// ── Wrapper ───────────────────────────────────────────────────────────

export const RecruiterChatbot = ({ isOpen, onClose, userKey }: { isOpen: boolean; onClose: () => void; userKey?: string }) => {
    // Register components
    const components = [{
        name: 'CandidateList',
        description: 'Displays a list of candidates matching the search criteria.',
        component: CandidateList,
        propsSchema: CandidateSchema
    }];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-black border-l border-zinc-800 shadow-2xl z-[101]"
                    >
                        <TamboProvider
                            apiKey={import.meta.env.VITE_TAMBO_API_KEY || "demo"} // Placeholder if missing
                            userKey={userKey || "guest-recruiter"}
                            components={components}
                        >
                            <ChatInterface onClose={onClose} />
                        </TamboProvider>
                    </motion.div >
                </>
            )}
        </AnimatePresence >
    );
};
