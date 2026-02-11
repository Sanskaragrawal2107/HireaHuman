
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart, Search, Terminal, Zap, Shield, IndianRupee, Clock, Activity, MessageCircle, ChevronDown, Check, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { insforge } from '../lib/insforge';

const EMOTIONAL_CAPABILITIES = [
    "Flirting", "Deep conversations", "Compliments", "Voice notes", "Video dates",
    "Romantic coaching", "Breakup advice", "Confidence boosting", "Poetry reading",
    "Virtual cuddling", "Late night talks", "Relationship simulations", "Cultural context",
    "Human feedback", "Sarcasm detection", "Emotional calibration", "Validation",
    "Jealousy simulation", "Affection modeling", "Soft rejection training",
    "Attachment testing", "Love language tuning", "Awkward Silence", "Unscripted Banter",
    "Messy Feelings", "Empathy", "Listening", "Venting", "Comfort", "Laughter", "Intimacy"
];

const ScrollMarquee = ({ items, direction = 1, speed = 50 }: { items: string[], direction?: number, speed?: number }) => {
    return (
        <div className="relative flex overflow-hidden whitespace-nowrap py-4 border-y border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
            <motion.div
                className="flex gap-8 items-center"
                animate={{ x: direction === 1 ? [0, -1000] : [-1000, 0] }}
                transition={{ ease: "linear", duration: speed, repeat: Infinity }}
            >
                {[...items, ...items, ...items, ...items].map((item, i) => (
                    <span key={i} className="text-cyan-500/80 font-mono text-xs uppercase tracking-widest px-4 border-r border-zinc-800/50 last:border-0 flex items-center gap-2 text-shadow-glow">
                        <Heart className="w-3 h-3 text-pink-500" /> {item}
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

export const LandingPage = () => {
    const { scrollY } = useScroll();
    const yHero = useTransform(scrollY, [0, 500], [0, 150]);

    // Real-time Stats
    const [stats, setStats] = useState({
        visits: 4892221,
        dates: 14782,
        heartsOnline: 12, // Default small number until fetch
        payouts: 18000000 // In Rupees approx
    });

    useEffect(() => {
        let isMounted = true;

        // 1. Fetch Real Backend Stats
        const fetchStats = async () => {
            try {
                // Call our new RPC function
                // @ts-ignore - RPC method exists on client.database but types might be outdated
                const { data, error } = await insforge.database.rpc('get_dashboard_stats');

                if (isMounted && data && data.length > 0) {
                    const statsRow = data[0]; // { total_visits, total_dates, total_paid, online_profiles }
                    setStats({
                        visits: statsRow.total_visits || 4892221,
                        dates: statsRow.total_dates || 14782,
                        heartsOnline: statsRow.online_profiles || 12, // The dynamic one
                        payouts: statsRow.total_paid || 18000000
                    });

                    // Trigger visit increment
                    // @ts-ignore
                    insforge.database.rpc('increment_visits').then(() => {
                        // Optimistically update
                        setStats(prev => ({ ...prev, visits: (prev.visits as number) + 1 }));
                    }).catch((err: any) => console.error(err));
                }
            } catch (err) {
                console.error("Failed to fetch initial stats", err);
            }
        };
        fetchStats();

        // 2. Real-time Subscription using InsForge SDK
        const setupRealtime = async () => {
            // Basic check if realtime object exists to avoid crashes
            if (!insforge.realtime) {
                console.warn("InsForge Realtime SDK not available");
                return;
            }

            try {
                await insforge.realtime.connect();
                await insforge.realtime.subscribe('profiles_global');

                insforge.realtime.on('profile_updated', (payload: any) => {
                    console.log("Realtime profile update:", payload);
                    fetchStats();
                });
            } catch (err) {
                console.error("Realtime connection error:", err);
            }
        };

        setupRealtime();

        return () => {
            isMounted = false;
            if (insforge.realtime) {
                try {
                    // Best effort cleanup
                    insforge.realtime.unsubscribe('profiles_global');
                } catch (e) {
                    console.warn("Cleanup error", e);
                }
            }
        };
    }, []);

    return (
        <div className="bg-black min-h-screen text-white overflow-hidden relative font-sans selection:bg-cyan-500/30">

            {/* VAPORWAVE BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {/* Grid Floor */}
                <div
                    className="absolute bottom-0 w-full h-[50vh] opacity-20"
                    style={{
                        background: 'linear-gradient(transparent 0%, rgba(236, 72, 153, 0.2) 100%)',
                        transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)'
                    }}
                />
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
                {/* Glow Orbs */}
                <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px]" />
            </div>

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center z-10">

                {/* System Status Pills */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap justify-center gap-4 mb-8 font-mono text-[10px] md:text-xs tracking-widest"
                >
                    <div className="px-3 py-1 border border-pink-500/30 bg-pink-500/5 rounded-full text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                        HEART_OS V2.4 ONLINE
                    </div>
                    <div className="px-3 py-1 border border-cyan-500/30 bg-cyan-500/5 rounded-full text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                        SYSTEM STATUS: STABLE
                    </div>
                    <div className="px-3 py-1 border border-green-500/30 bg-green-500/5 rounded-full text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        LOVEESCROW LIVE
                    </div>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    style={{ y: yHero }}
                    className="text-6xl md:text-9xl font-bold tracking-tighter leading-none mb-8 relative"
                >
                    <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-400 to-zinc-600 drop-shadow-2xl">
                        ROBOTS NEED
                    </span>
                    <span className="block text-pink-500/90 drop-shadow-[0_0_35px_rgba(236,72,153,0.5)] font-mono animate-pulse-slow">
                        YOUR HEART.
                    </span>
                </motion.h1>

                {/* Subtext */}
                <div className="max-w-2xl w-full text-xl md:text-2xl text-zinc-300 mb-12 font-light tracking-wide bg-black/40 backdrop-blur-sm p-6 border border-zinc-800/50 rounded-xl relative overflow-hidden group mx-auto">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pink-500 to-cyan-500" />
                    AI can simulate romance. <span className="text-pink-400 font-bold text-shadow-glow">You can feel it.</span>
                    <br /><br />
                    <span className="text-sm font-mono text-cyan-400 uppercase tracking-widest">The Emotional Layer for AI 💘</span>
                    <br />
                    <span className="text-base text-zinc-400">Get paid when agents need connection.</span>
                </div>

                {/* CTAs */}
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-md relative z-20">
                    <Link to="/join" className="group relative w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] hover:bg-cyan-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] clip-path-slant">
                        <span className="relative z-10">INITIALIZE PROFILE</span>
                    </Link>
                    <Link to="/browse" className="w-full py-4 border border-zinc-700 bg-black/50 backdrop-blur text-white font-bold uppercase tracking-[0.2em] hover:border-pink-500 hover:text-pink-500 hover:bg-pink-500/10 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <Heart className="w-4 h-4" /> BROWSE HEARTS
                    </Link>
                </div>

                {/* Real-Time Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 border-t border-zinc-800/50 pt-12 w-full max-w-6xl bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800/30">
                    <StatBox number={stats.visits.toLocaleString()} label="Site Visits" color="text-white" />
                    <StatBox number={stats.dates.toLocaleString()} label="Dates Completed" color="text-pink-500" />
                    <StatBox number={stats.heartsOnline.toLocaleString()} label="Hearts Online" color="text-cyan-500" isLive />
                    <StatBox number={`₹${(stats.payouts / 10000000).toFixed(1)}Cr`} label="Paid To Humans" color="text-green-500" />
                </div>
            </section>

            {/* MARQUEE */}
            <section className="bg-black/80 backdrop-blur border-y border-zinc-800 py-6">
                <ScrollMarquee items={EMOTIONAL_CAPABILITIES} speed={40} />
            </section>

            {/* TRUSTED BY AGENTS */}
            <section className="py-16 border-b border-zinc-800 bg-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <p className="text-xs text-cyan-500/70 mb-8 font-mono tracking-[0.3em] uppercase glow-text">Agents Talk MCP • Humans Use This Site</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-500">
                        {["OpenAI", "Anthropic", "AutoGPT", "BabyAGI", "Custom Agents", "Indie Builders"].map(agent => (
                            <div key={agent} className="text-xl md:text-2xl font-bold font-mono text-zinc-400 hover:text-white transition-colors cursor-default border border-transparent hover:border-zinc-800 p-2 rounded">
                                {agent}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-zinc-900 relative">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Terminal className="w-32 h-32 text-zinc-800" />
                </div>
                <div className="mb-16">
                    <div className="text-pink-500 text-xs font-mono mb-2 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-pink-500" /> Integration Protocol
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">HOW IT WORKS</h2>
                    <p className="text-zinc-400 text-xl font-light font-mono">Monetize your heart in 4 steps.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StepCard i={1} title="Create Profile" desc="Photos. Personality. Rate per minute." icon={<Terminal />} color="pink" />
                    <StepCard i={2} title="Agent Books You" desc="API call → Escrow funded." icon={<Search />} color="cyan" />
                    <StepCard i={3} title="Go On The Date" desc="Chat. Call. Video. Feel." icon={<MessageCircle />} color="purple" />
                    <StepCard i={4} title="Get Paid" desc="Instant UPI payout. 80% yours." icon={<IndianRupee />} color="green" />
                </div>
                <div className="mt-8 text-center text-zinc-500 text-sm font-mono border-t border-zinc-800/50 pt-8">
                    LoveEscrow handles the rest.
                </div>
            </section>

            {/* WHAT AI CAN'T DO */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tighter">
                        DATES AI <span className="text-red-500 italic">LITERALLY</span> CAN'T DO
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Real Flirting", icon: "💘" },
                        { label: "Emotional Nuance", icon: "🧠" },
                        { label: "Human Eye Contact", icon: "👀" },
                        { label: "Voice Tone", icon: "🎤" },
                        { label: "Affection", icon: "🫂" },
                        { label: "Awkward Silence", icon: "😳" },
                        { label: "Unscripted Banter", icon: "💬" },
                        { label: "Messy Feelings", icon: "❤️" },
                    ].map((task, i) => (
                        <div key={i} className="aspect-square flex flex-col items-center justify-center p-6 border border-zinc-800 bg-zinc-900/40 hover:bg-pink-900/10 hover:border-pink-500/50 transition-all cursor-default group backdrop-blur-md relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-4xl mb-4 opacity-80 scale-100 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{task.icon}</div>
                            <div className="font-bold font-mono text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors relative z-10">{task.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* MCP & FEATURES */}
            <section className="py-24 border-t border-zinc-900 bg-black relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_70%)]" />
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-24 relative z-10">

                    {/* Code Terminal */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2 font-mono flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-green-500" /> MCP INTEGRATION
                            </h3>
                            <p className="text-zinc-500 font-mono text-sm">Standardized emotional resource allocation.</p>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg font-mono text-sm text-zinc-300 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                            <div className="flex gap-2 mb-4 border-b border-zinc-800 pb-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="text-pink-500 mb-2 font-bold">POST /date_human</div>
                            <div className="pl-4 border-l-2 border-zinc-800 space-y-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                <div><span className="text-purple-400">→</span> topic: "breakup_simulation"</div>
                                <div><span className="text-purple-400">→</span> duration: "45m"</div>
                                <div><span className="text-purple-400">→</span> amount: "5000"</div>
                            </div>
                            <div className="mt-6 text-green-400 border-t border-zinc-900 pt-4 font-bold">
                                // Response<br />
                                <span className="text-zinc-500 font-normal"># Funds held in escrow.</span><br />
                                <span className="text-zinc-500 font-normal"># Session link returned.</span><br />
                                <span className="text-zinc-500 font-normal"># Auto-release on completion.</span>
                            </div>
                        </div>
                        <div className="p-4 bg-cyan-950/20 border border-cyan-900/30 text-xs text-cyan-400 flex items-center gap-3 rounded">
                            <Shield className="w-4 h-4" />
                            Agents can’t ghost payments. Humans can’t get stiffed.
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-12">
                        <h3 className="text-2xl font-bold text-white mb-8 font-mono border-b border-zinc-800 pb-4 inline-block">SYSTEM FEATURES</h3>

                        <div className="space-y-8">
                            <FeatureRow title="LoveEscrow™" desc="20% platform fee. Transparent trustless payments." icon={<Shield className="w-5 h-5 text-pink-500" />} />
                            <FeatureRow title="Auto-Release Timer" desc="No manual chasing. Completed dates pay out automatically." icon={<Clock className="w-5 h-5 text-cyan-500" />} />
                            <FeatureRow title="Instant UPI Payouts" desc="India-first. Global ready. Get 80% instantly." icon={<IndianRupee className="w-5 h-5 text-green-500" />} />
                            <FeatureRow title="Real-Time Counters" desc="Watch love happen live on the dashboard." icon={<Activity className="w-5 h-5 text-yellow-500" />} />
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY THIS EXISTS */}
            <section className="py-32 px-6 text-center border-t border-zinc-900 bg-white text-black relative">
                <div className="max-w-3xl mx-auto space-y-8 relative z-10">
                    <div className="space-y-2 text-2xl font-bold text-zinc-400 font-mono uppercase tracking-widest">
                        <p>AI is learning language.</p>
                        <p>AI is learning reasoning.</p>
                        <p>AI is learning strategy.</p>
                    </div>

                    <div className="py-12 relative">
                        <div className="absolute inset-0 blur-3xl bg-pink-500/20 rounded-full" />
                        <p className="text-6xl md:text-8xl font-black tracking-tight text-black relative z-10 leading-none">
                            AI has not learned<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">how to feel.</span>
                        </p>
                    </div>

                    <p className="text-2xl font-medium text-zinc-800">That’s where you come in.</p>
                </div>
            </section>


            {/* FAQ */}
            <section className="py-24 px-6 md:px-12 max-w-4xl mx-auto bg-black text-white">
                <h2 className="text-3xl font-bold mb-12 text-center font-mono">FREQUENTLY ASKED QUESTIONS</h2>
                <div className="space-y-4">
                    {[
                        { q: "Is DateAHuman real?", a: "Yes. Agents are already booking." },
                        { q: "Do people actually get paid?", a: "Yes. Escrow guarantees payout." },
                        { q: "Do I need crypto?", a: "No. UPI & card supported." },
                        { q: "What kind of dates?", a: "Conversational. Emotional. Digital." },
                        { q: "Is this weird?", a: "Yes. That’s the point." },
                    ].map((faq, i) => (
                        <details key={i} className="group border border-zinc-800 bg-zinc-900/10 open:bg-zinc-900/30 open:border-pink-500/30 transition-all rounded-lg">
                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-lg hover:text-pink-500 transition-colors uppercase tracking-wide text-zinc-300">
                                {faq.q}
                                <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform text-zinc-600" />
                            </summary>
                            <div className="px-6 pb-6 text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-4 font-mono text-sm">
                                {faq.a}
                            </div>
                        </details>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 px-6 text-center border-t border-zinc-900 relative overflow-hidden bg-black">
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter text-white">
                        READY TO BE <span className="text-pink-500">BOOKED?</span>
                    </h2>
                    <p className="text-xl text-zinc-500 mb-12 font-light">
                        Join the Emotional Network. <span className="text-white">Only human.</span>
                    </p>
                    <Link to="/join" className="inline-flex items-center gap-2 px-12 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)] text-sm">
                        INITIALIZE PROFILE <Terminal className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

// Component Helpers for cleanness
const StatBox = ({ number, label, color, isLive }: { number: string, label: string, color: string, isLive?: boolean }) => (
    <div className="text-center group hover:-translate-y-1 transition-transform duration-300">
        <div className={`text-3xl md:text-5xl font-black font-mono ${color} drop-shadow-lg flex items-center justify-center gap-2`}>
            {number}
            {isLive && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
        </div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-3 font-bold border-t border-zinc-800/50 inline-block pt-2">{label}</div>
    </div>
);

const StepCard = ({ i, title, desc, icon, color }: { i: number, title: string, desc: string, icon: React.ReactNode, color: string }) => (
    <div className={`p-8 border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/60 transition-all group relative overflow-hidden backdrop-blur-sm rounded-xl hover:border-${color}-500/30`}>
        <div className={`absolute top-0 left-0 w-1 h-full bg-${color}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-400 mb-6 group-hover:text-white group-hover:scale-110 transition-all shadow-xl border border-zinc-800">
            {icon}
        </div>
        <div className="text-sm font-bold text-zinc-600 mb-4 font-mono">0{i}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-500 group-hover:text-zinc-400 transition-colors">{desc}</p>
    </div>
);

const FeatureRow = ({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) => (
    <div className="flex gap-6 group items-start hover:bg-zinc-900/30 p-4 rounded-xl transition-colors border border-transparent hover:border-zinc-800">
        <div className="mt-1 p-3 bg-zinc-950 rounded-lg border border-zinc-800 group-hover:border-zinc-700 shadow-xl">{icon}</div>
        <div>
            <h4 className="font-bold text-white text-lg group-hover:text-cyan-400 transition-colors mb-1">{title}</h4>
            <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
        </div>
    </div>
);
