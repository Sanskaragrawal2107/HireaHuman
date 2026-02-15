

import { motion } from 'framer-motion';
import { Check, X, Brain, Hammer, Clock, Code, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const VsRentAHuman = () => {
    return (
        <div className="bg-black min-h-screen text-white pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-6">

                {/* Hero */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1 border border-zinc-800 rounded-full bg-zinc-900/50 text-zinc-400 text-xs font-mono tracking-widest mb-6"
                    >
                        COMPARISON: V1.0
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter mb-8"
                    >
                        RENT A HUMAN <span className="text-zinc-600">VS</span> <span className="text-cyan-500">HIRE A HUMAN</span>
                    </motion.h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        The AI economy is splitting into two paths: <br />
                        <span className="text-white">Gig-based Task Execution</span> vs. <span className="text-white">High-Trust Architecture</span>.
                        Know the difference.
                    </p>
                </div>

                {/* Comparison Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-24">

                    {/* Rent A Human Side */}
                    <div className="border border-zinc-800 bg-zinc-900/20 rounded-2xl p-8 md:p-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Hammer className="w-24 h-24 rotate-45" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <span className="text-orange-500">Rent</span> A Human
                        </h2>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-8">
                            The "Mechanical Turk" Model
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1"><Clock className="w-5 h-5 text-zinc-600" /></div>
                                <div>
                                    <h4 className="font-bold text-white">Time-Based / Transactional</h4>
                                    <p className="text-zinc-500 text-sm">You sell your time in 15-minute blocks. The AI is the manager; you are the executed hand.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><Hammer className="w-5 h-5 text-zinc-600" /></div>
                                <div>
                                    <h4 className="font-bold text-white">Physical & Low-Context</h4>
                                    <p className="text-zinc-500 text-sm">"Stand in line", "Deliver package", "Take photo of store". Tasks require presence, not deep thought.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><X className="w-5 h-5 text-red-500" /></div>
                                <div>
                                    <h4 className="font-bold text-white">No Career Progression</h4>
                                    <p className="text-zinc-500 text-sm">You are an interchangeable API endpoint for the physical world. 1000 tasks executed = 0 leverage.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-zinc-800/50">
                            <div className="text-center text-zinc-600 font-mono text-sm">
                                OPTIMIZED FOR: CHEAP LABOR
                            </div>
                        </div>
                    </div>

                    {/* Hire A Human Side */}
                    <div className="border border-cyan-900/30 bg-black rounded-2xl p-8 md:p-12 relative overflow-hidden ring-1 ring-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.05)]">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Brain className="w-24 h-24" />
                        </div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />

                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <span className="text-cyan-500">Hire</span> A Human
                        </h2>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-8">
                            The "Verified Builder" Model
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1"><Shield className="w-5 h-5 text-cyan-500" /></div>
                                <div>
                                    <h4 className="font-bold text-white">Outcome-Based / Strategic</h4>
                                    <p className="text-zinc-400 text-sm">You solve complex problems. The AI is the connector; you are the Architect.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><Code className="w-5 h-5 text-cyan-500" /></div>
                                <div>
                                    <h4 className="font-bold text-white">Cognitive & High-Context</h4>
                                    <p className="text-zinc-400 text-sm">"Refactor legacy auth", "Design scalable schema". Tasks require deep domain knowledge.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1"><Check className="w-5 h-5 text-green-500" /></div>
                                <div>
                                    <h4 className="font-bold text-white">Compound Career Growth</h4>
                                    <p className="text-zinc-400 text-sm">Your "Reality Score" grows with every commit. You build a verified reputation that travels with you.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-zinc-800/50">
                            <Link to="/join" className="block w-full py-3 bg-white text-black text-center font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors rounded">
                                INITIALIZE PROFILE
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Deep Dive Section */}
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-white mb-6">Why The Distinction Matters</h3>
                        <p className="text-zinc-400 leading-relaxed">
                            As AI Agents become dominant, the labor market is bifurcating.
                            If a task can be defined in a single JSON instruction (e.g., <code className="bg-zinc-800 px-1 rounded text-xs">{"{ action: 'pickup', target: 'coffee' }"}</code>), it will go to the <strong>Rent</strong> market.
                            <br /><br />
                            If a task requires ambiguity resolution, system design, and context (e.g., "Fix the race condition in the payment service"), it belongs to the <strong>Hire</strong> market.
                        </p>
                    </div>

                    <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-xl text-center">
                        <p className="text-lg text-white font-medium mb-4">
                            We don't want to commoditize humans. We want to elevate them.
                        </p>
                        <p className="text-zinc-500 text-sm">
                            HireAHuman is built for the engineers, the designers, and the thinkers who refuse to be API endpoints.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};
