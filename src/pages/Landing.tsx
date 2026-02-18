
import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Shield, Code, Code2, Cpu, Database, Github, Zap, Search, Lock, CheckCircle2, Target, Star, BarChart3, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { insforge } from '../lib/insforge';
import { logger } from '../lib/logger';

const TECH_STACK = [
    "React", "Node.js", "Python", "Rust", "Go", "Docker", "Kubernetes", "AWS", "TensorFlow",
    "PostgreSQL", "GraphQL", "Next.js", "TypeScript", "Solidity", "System Design", "Microservices",
    "CI/CD", "Cybersecurity", "Embedded Systems", "Unity", "Unreal Engine", "WebAssembly"
];

const ScrollMarquee = ({ items, direction = 1, speed = 50 }: { items: string[], direction?: number, speed?: number }) => {
    return (
        <div className="relative flex overflow-hidden whitespace-nowrap py-4 border-y border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
            <motion.div
                className="flex gap-8 items-center"
                animate={{ x: direction === 1 ? [0, -1000] : [-1000, 0] }}
                transition={{ ease: "linear", duration: speed, repeat: Infinity }}
            >
                {[...items, ...items].map((item, i) => (
                    <span key={i} className="text-cyan-500/80 font-mono text-xs uppercase tracking-widest px-4 border-r border-zinc-800/50 last:border-0 flex items-center gap-2 text-shadow-glow">
                        <Code className="w-3 h-3 text-cyan-500" /> {item}
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

export const LandingPage = () => {
    const { scrollY } = useScroll();
    const yHero = useTransform(scrollY, [0, 500], [0, 150]);

    const [stats, setStats] = useState({
        totalProfiles: 0,
        verifiedCompanies: 0,
        availableEngineers: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Parallelize all 3 count queries
                const [profilesRes, companiesRes, availableRes] = await Promise.all([
                    insforge.database
                        .from('profiles')
                        .select('*', { count: 'exact', head: true }),
                    insforge.database
                        .from('companies')
                        .select('*', { count: 'exact', head: true })
                        .eq('status', 'verified'),
                    insforge.database
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('employment_status', 'AVAILABLE'),
                ]);

                setStats({
                    totalProfiles: profilesRes.count || 0,
                    verifiedCompanies: companiesRes.count || 0,
                    availableEngineers: availableRes.count || 0,
                });
            } catch (err) {
                logger.error("Stats fetch error:", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="bg-black min-h-screen text-white overflow-hidden relative font-sans selection:bg-cyan-500/30">

            {/* CYBER BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div
                    className="absolute bottom-0 w-full h-[50vh] opacity-20"
                    style={{
                        background: 'linear-gradient(transparent 0%, rgba(6, 182, 212, 0.2) 100%)',
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
                <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]" />
            </div>

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center z-10">

                {/* System Status Pills */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap justify-center gap-4 mb-8 font-mono text-[10px] md:text-xs tracking-widest"
                >
                    <div className="px-3 py-1 border border-cyan-500/30 bg-cyan-500/5 rounded-full text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                        HIRE_OS V1.0
                    </div>
                    <div className="px-3 py-1 border border-blue-500/30 bg-blue-500/5 rounded-full text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                        SYSTEM: ACTIVE
                    </div>
                    <div className="px-3 py-1 border border-green-500/30 bg-green-500/5 rounded-full text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.3)] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        RECRUITERS: VERIFIED
                    </div>
                    <div className="px-3 py-1 border border-purple-500/30 bg-purple-500/5 rounded-full text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                        RESUME TAILORING: DISABLED
                    </div>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    style={{ y: yHero }}
                    className="text-5xl md:text-8xl font-bold tracking-tighter leading-none mb-8 relative"
                >
                    <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-400 to-zinc-600 drop-shadow-2xl">
                        THE DAY AI STARTED
                    </span>
                    <span className="block text-cyan-500/90 drop-shadow-[0_0_35px_rgba(6,182,212,0.5)] font-mono animate-pulse-slow">
                        HIRING HUMANS.
                    </span>
                </motion.h1>

                {/* Subtext */}
                <div className="max-w-3xl w-full text-xl md:text-2xl text-zinc-300 mb-12 font-light tracking-wide bg-black/40 backdrop-blur-sm p-8 border border-zinc-800/50 rounded-xl relative overflow-hidden group mx-auto">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-500" />
                    <p className="mb-6">
                        You used to apply for jobs. <br />
                        <span className="text-cyan-400 font-bold text-shadow-glow">Now jobs find you.</span>
                    </p>
                    <div className="text-base text-zinc-400 font-mono space-y-2 border-t border-zinc-800/50 pt-6">
                        <p>ROBOTS DON'T CARE ABOUT YOUR COVER LETTER.</p>
                        <p>They care about what you've built.</p>
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-md relative z-20">
                    <Link to="/join" className="group relative w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] hover:bg-cyan-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] clip-path-slant">
                        <span className="relative z-10">INITIALIZE PROFILE</span>
                    </Link>
                    <Link to="/verify" className="w-full py-4 border border-zinc-700 bg-black/50 backdrop-blur text-white font-bold uppercase tracking-[0.2em] hover:border-cyan-500 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                        <Shield className="w-4 h-4" /> VERIFY COMPANY
                    </Link>
                </div>

                {/* Real-Time Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 border-t border-zinc-800/50 pt-12 w-full max-w-6xl bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800/30">
                    <StatBox number={stats.totalProfiles.toLocaleString()} label="Engineers Verified" color="text-white" />
                    <StatBox number={stats.verifiedCompanies.toLocaleString()} label="Verified Companies" color="text-cyan-500" />
                    <StatBox number={stats.availableEngineers.toLocaleString()} label="Available Now" color="text-green-500" isLive />
                    <StatBox number="$145k" label="Avg Salary" color="text-blue-500" />
                </div>
            </section>

            {/* SEO FOCUS SECTION */}
            <section className="bg-zinc-950 border-t border-zinc-900 py-12 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <h2 className="text-2xl font-bold text-white">The Modern Website for Hiring Humans</h2>
                    <p className="text-zinc-500 max-w-2xl mx-auto text-sm leading-relaxed">
                        Looking for a <Link to="/hire-humans" className="text-cyan-500 hover:underline">website for hiring humans</Link> with verified skills?
                        HireAHuman is the only platform that uses GitHub commits—not resumes—to verify engineering talent.
                        Unlike traditional <span className="text-white">freelance hiring platforms</span> where anyone can claim expertise, we analyze actual code contributions to surface the top 1% of builders.
                    </p>
                </div>
            </section>

            {/* MARQUEE */}
            <section className="bg-black/80 backdrop-blur border-y border-zinc-800 py-6">
                <ScrollMarquee items={TECH_STACK} speed={40} />
            </section >

            {/* RECRUITER HERO SECTION */}
            <section className="relative py-24 px-6 md:px-12 max-w-7xl mx-auto border border-zinc-900 bg-zinc-950/20 overflow-hidden rounded-3xl my-24 border border-zinc-800/20 scale-95 hover:scale-100 transition-all duration-700">
                <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-cyan-600/5 blur-[120px] rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-[30%] h-[100%] bg-blue-600/5 blur-[100px] rounded-full -ml-32 -mb-32" />
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                    <div className="flex-1 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-mono tracking-widest mb-6 uppercase">
                            <TrendingUp className="w-3 h-3" /> Talent Discovery_
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-none">
                            FIND GENUINE <br />
                            <span className="text-cyan-500">ENGINEERS, QUICKLY.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed font-light">
                            Stop sifted through fake resumes. We analyze their actual code on GitHub and LeetCode to find you the top experts who can actually build.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-sm mx-auto lg:mx-0">
                            <Link to="/verify" className="flex-1 py-4 bg-white text-black font-bold uppercase tracking-wider text-xs hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)] flex items-center justify-center gap-2">
                                Start Hiring <Zap className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 gap-4 max-w-md w-full">
                        <div className="p-4 border border-zinc-800 bg-black rounded-lg text-center">
                            <div className="text-zinc-500 text-[10px] uppercase font-mono mb-1">Time to Find Talent</div>
                            <div className="text-white text-2xl font-bold font-mono tracking-tighter">&lt; 15 mins</div>
                        </div>
                        <div className="p-4 border border-zinc-800 bg-black rounded-lg text-center">
                            <div className="text-zinc-500 text-[10px] uppercase font-mono mb-1">Proof of Work</div>
                            <div className="text-white text-2xl font-bold font-mono tracking-tighter">Real Code Only</div>
                        </div>
                        <div className="p-4 border border-zinc-800 bg-black rounded-lg text-center col-span-2">
                            <div className="text-zinc-500 text-[10px] uppercase font-mono mb-1">Success Rate</div>
                            <div className="text-cyan-500 text-2xl font-bold font-mono tracking-tighter">92.4% Right Selection</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TALENT VERIFICATION SECTION */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-zinc-900 relative overflow-hidden" >
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-cyan-900/10 to-transparent pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
                    <div className="w-full md:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-mono tracking-widest mb-6 uppercase">
                            <Zap className="w-3 h-3" /> Talent Verification
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 leading-tight">
                            RESUMES LIE.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase">
                                COMMIT LOGS DON'T.
                            </span>
                        </h2>
                        <p className="text-xl text-zinc-400 font-light mb-8 leading-relaxed">
                            Every candidate claims they are an "Expert." <br />
                            <span className="text-white font-medium">We check their real code and LeetCode stats to prove it.</span>
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-500">
                                        <Github className="w-4 h-4" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">GitHub Proof</h3>
                                    <p className="text-zinc-500 text-sm mt-1">We analyze their actual projects and commits. No more guessing if they can actually build.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-500">
                                        <Code2 className="w-4 h-4" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">LeetCode Angle</h3>
                                    <p className="text-zinc-500 text-sm mt-1">We track their problem-solving skills and rankings. You get engineers who can think, not just copy-paste.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-green-500">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">Zero Fake Resumes</h3>
                                    <p className="text-zinc-500 text-sm mt-1">Only builders with a real track record get shortlisted. You only talk to the best.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 relative grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SignalCard 
                            label="GitHub Activity" 
                            value="3.1k+ Commits" 
                            description="Real project contributions verified."
                            icon={<Github className="w-5 h-5" />}
                            color="text-purple-500"
                        />
                        <SignalCard 
                            label="LeetCode Rank" 
                            value="Top 0.5%" 
                            description="Problem solving expertise proven."
                            icon={<Code2 className="w-5 h-5" />}
                            color="text-yellow-500"
                        />
                        <div className="sm:col-span-2 p-4 border border-zinc-900 bg-zinc-950/50 backdrop-blur rounded-lg flex items-center gap-4 group hover:border-cyan-500/20 transition-colors mt-2">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 text-[10px] font-mono border border-cyan-500/20">A</div>
                            <div className="flex-1">
                                <div className="text-zinc-500 text-[8px] uppercase font-mono mb-0.5 tracking-widest">Verification Status_</div>
                                <div className="text-white text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis">Confirmed: Top 1% LeetCode solver with high-quality GitHub contributions.</div>
                            </div>
                            <div className="text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-widest">Ready to Hire</div>
                        </div>
                    </div>
                </div>
            </section >

            {/* TECHNICAL SIGNAL REPORT SECTION */}
            <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-zinc-900 relative overflow-hidden bg-black/40 rounded-3xl mb-24 border border-zinc-800/10">
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 text-pink-500 font-mono text-xs uppercase tracking-[0.4em] mb-4">
                        <BarChart3 className="w-4 h-4" /> Recruiter_Insight_v2
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
                        WHAT RECRUITERS SEE
                    </h2>
                    <p className="text-zinc-500 font-mono text-sm max-w-2xl mx-auto leading-relaxed">
                        We don't just show portfolios. We provide a deep-dive technical signal report for every candidate.
                        Our AI analyzes actual developer output to create a "Reality Score" — not just a LinkedIn endorsement.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SignalCard 
                        label="GitHub Reality Score" 
                        value="94/100" 
                        description="Real commits vs forked code analysis"
                        icon={<Github className="w-5 h-5" />}
                        color="text-purple-500"
                    />
                    <SignalCard 
                        label="LeetCode Performance" 
                        value="TOP 1%" 
                        description="Algorithmic problem solving verified"
                        icon={<Code className="w-5 h-5" />}
                        color="text-yellow-500"
                    />
                    <SignalCard 
                        label="Project Depth" 
                        value="SENIOR" 
                        description="Architecture complexity & scaling signal"
                        icon={<Cpu className="w-5 h-5" />}
                        color="text-blue-500"
                    />
                    <SignalCard 
                        label="Skill Match %" 
                        value="98.2%" 
                        description="Instant alignment with your job description"
                        icon={<Target className="w-5 h-5" />}
                        color="text-green-500"
                    />
                </div>
            </section>

            {/* AUTOMATIC SEARCH EXPLAINER - ZERO QUERY */}
            < section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-zinc-900 relative" >
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                        STOP SEARCHING.<br />
                        <span className="text-cyan-500">START BEING FOUND.</span>
                    </h2>
                    <p className="text-xl text-zinc-400">
                        Searching for jobs is obsolete. You don't browse Netflix for movies anymore; it knows what you like.
                        We built the same engine for your career.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
                    <div className="p-8 border border-zinc-800 bg-zinc-900/20 rounded-xl hover:bg-zinc-900/40 transition-colors">
                        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-6 text-zinc-400 mx-auto md:mx-0">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">1. You Do Nothing.</h3>
                        <p className="text-zinc-500 leading-relaxed text-sm md:text-base">
                            Once your profile is active, you don't need to "search" for anything. Close the tab. Go build something cool.
                        </p>
                    </div>

                    <div className="p-8 border border-zinc-800 bg-zinc-900/20 rounded-xl hover:bg-zinc-900/40 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50" />
                        <div className="w-12 h-12 bg-cyan-900/20 rounded-lg flex items-center justify-center mb-6 text-cyan-400 mx-auto md:mx-0">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">2. We Match in Background.</h3>
                        <p className="text-zinc-500 leading-relaxed text-sm md:text-base">
                            Our vectors match your verified GitHub skills against private job requirements 24/7. Even while you sleep.
                        </p>
                    </div>

                    <div className="p-8 border border-zinc-800 bg-zinc-900/20 rounded-xl hover:bg-zinc-900/40 transition-colors">
                        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-6 text-zinc-400 mx-auto md:mx-0">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">3. Incoming Request.</h3>
                        <p className="text-zinc-500 leading-relaxed text-sm md:text-base">
                            You get a ping only when a company actually wants to interview **you**.
                            <span className="block mt-2 text-cyan-500 text-xs font-mono tracking-widest uppercase">90% Response Rate</span>
                        </p>
                    </div>
                </div>
            </section >

            {/* FEATURES GRID */}
            < section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-b border-zinc-900 relative" >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* RESUME LOCKED */}
                    <div className="p-8 border border-zinc-800 bg-zinc-900/20 rounded-xl relative overflow-hidden group hover:border-pink-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Database className="w-24 h-24" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-white font-mono flex items-center gap-3">
                            <span className="text-pink-500">🔒</span> YOUR RESUME IS LOCKED.
                        </h3>
                        <div className="text-zinc-400 space-y-4 font-light text-lg">
                            <p>Twice per month. That's it.</p>
                            <p className="pl-4 border-l-2 border-zinc-800">
                                No rewriting your personality per job.<br />
                                No keyword stuffing for algorithms.<br />
                                No "synergy-driven problem solver."
                            </p>
                            <p className="font-mono text-pink-400">If you're good, you don't need theatre.</p>
                        </div>
                    </div>

                    {/* PROVE IT */}
                    <div className="p-8 border border-zinc-800 bg-zinc-900/20 rounded-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield className="w-24 h-24" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-white font-mono flex items-center gap-3">
                            <span className="text-cyan-500">🏢</span> IF YOU'RE HIRING, PROVE IT.
                        </h3>
                        <div className="text-zinc-400 space-y-4 font-light text-lg">
                            <p>No Gmail recruiters. No fake accounts. No ghost interviews.</p>
                            <ul className="pl-4 space-y-2 font-mono text-sm text-cyan-400/80">
                                <li>[x] VERIFY WORK DOMAIN</li>
                                <li>[x] VERIFY BUSINESS PRESENCE</li>
                                <li>[x] PAY ₹1000 DEPOSIT (₹900 REFUNDED)</li>
                            </ul>
                            <p className="font-mono text-white">If you want access to talent, be real.</p>
                        </div>
                    </div>

                    {/* AI ASSISTS */}
                    <div className="p-8 border border-zinc-800 bg-zinc-900/20 rounded-xl relative overflow-hidden group hover:border-green-500/30 transition-all md:col-span-2">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Cpu className="w-24 h-24" />
                        </div>
                        <div className="max-w-3xl">
                            <h3 className="text-3xl font-bold mb-4 text-white font-mono flex items-center gap-3">
                                <span className="text-green-500">🤖</span> AI ASSISTS. HUMANS DECIDE.
                            </h3>
                            <p className="text-zinc-400 text-lg mb-6">
                                Hiring technical roles is hard. Instead of reading 800 resumes, recruiters type:
                            </p>
                            <div className="bg-black border border-zinc-800 p-4 font-mono text-green-400 text-sm mb-6 rounded w-fit">
                                &gt; "Backend engineer. FastAPI. AWS. 3+ years."
                            </div>
                            <p className="text-zinc-400">
                                Our MCP server surfaces structured candidates via AI agents. <br />
                                <span className="text-white font-bold">AI reduces the noise. Recruiters make the final call.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section >


            {/* MANIFESTO SECTION */}
            < section className="py-32 px-6 text-center border-t border-zinc-900 bg-black relative" >
                <div className="max-w-4xl mx-auto space-y-16 relative z-10">

                    <div className="space-y-6">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
                            YOUR COMMITS MATTER MORE THAN YOUR CLAIMS.
                        </h2>
                        <p className="text-xl text-zinc-500 font-mono">
                            We don't rank influencers. We surface builders.
                        </p>
                    </div>

                    <div className="w-full h-px bg-zinc-900" />

                    <div className="grid md:grid-cols-2 gap-12 text-left items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4 font-mono">🧬 WHEN YOU'RE HIRED, YOU'RE HIRED.</h3>
                            <p className="text-zinc-500 leading-relaxed mb-4 text-sm md:text-base">
                                Accept a job → Your profile status updates. No double-booking. No silent multi-company stacking.
                            </p>
                            <div className="text-green-500 font-mono text-sm">[ CLEAN STATE. CLEAN HIRING. ]</div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4 font-mono">🚫 THIS IS NOT LINKEDIN.</h3>
                            <p className="text-zinc-500 leading-relaxed mb-4 text-sm md:text-base">
                                LinkedIn is where you post. HireAHuman is where you get hired.
                                This is not a job board. You don't apply. You get scouted.
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-px bg-zinc-900" />

                    <div className="relative py-12">
                        <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full" />
                        <h2 className="text-3xl font-bold text-white mb-6 relative z-10">THE SHIFT IS ALREADY HAPPENING.</h2>
                        <div className="grid md:grid-cols-3 gap-6 text-sm font-mono text-cyan-400 relative z-10">
                            <div className="p-4 border border-zinc-800 bg-black rounded">AI READS FASTER</div>
                            <div className="p-4 border border-zinc-800 bg-black rounded">AI FILTERS BETTER</div>
                            <div className="p-4 border border-zinc-800 bg-black rounded">AI UNDERSTANDS INSTANTLY</div>
                        </div>
                    </div>

                </div>
            </section >

            {/* SELECTION CTA */}
            < section className="py-24 px-6 md:px-12 border-t border-zinc-900 bg-zinc-950" >
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">

                    <div className="relative group p-8 border border-zinc-800 bg-black hover:border-white/20 transition-all rounded-xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                        <h3 className="text-3xl font-bold text-white mb-6">FOR ENGINEERS</h3>
                        <div className="space-y-4 text-zinc-400 mb-8 font-mono text-sm">
                            <p>Stop applying everywhere.</p>
                            <p>Build once. Stay real. Stay verified.</p>
                            <p className="text-white">Let AI find you.</p>
                        </div>
                        <Link to="/join" className="inline-block w-full py-4 bg-white text-black font-bold text-center hover:bg-zinc-200 transition-colors uppercase tracking-widest text-sm">
                            [ INITIALIZE PROFILE ]
                        </Link>
                    </div>

                    <div className="relative group p-8 border border-zinc-800 bg-black hover:border-cyan-500/50 transition-all rounded-xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                        <h3 className="text-3xl font-bold text-white mb-6">FOR COMPANIES</h3>
                        <div className="space-y-4 text-zinc-400 mb-8 font-mono text-sm">
                            <p>Stop drowning in resumes.</p>
                            <p>Describe the role. Let AI shortlist.</p>
                            <p className="text-cyan-500">Hire faster.</p>
                        </div>
                        <Link to="/verify" className="inline-block w-full py-4 border border-zinc-700 text-white font-bold text-center hover:border-cyan-500 hover:text-cyan-500 transition-colors uppercase tracking-widest text-sm">
                            [ VERIFY COMPANY ]
                        </Link>
                    </div>

                </div>
            </section >

            {/* FINAL LINE */}
            < footer className="py-32 bg-black text-center relative overflow-hidden" >
                <div className="relative z-10">
                    <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-8">
                        ROBOTS DON'T NETWORK.
                    </h2>
                    <p className="text-2xl md:text-3xl text-cyan-500 font-mono animate-pulse">
                        THEY FIND.
                    </p>

                    <div className="mt-24 text-zinc-600 text-xs font-mono uppercase tracking-[0.3em]">
                        HireAHuman.ai // The Professional Layer for AI Hiring
                    </div>

                    <div className="mt-6">
                        <a
                            href="https://tally.so/r/D4N7yZ"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-700 text-zinc-400 hover:border-cyan-500 hover:text-cyan-400 transition-all text-xs font-mono uppercase tracking-widest rounded-full"
                        >
                            💬 Share Feedback
                        </a>
                    </div>
                </div>
            </footer >
        </div >
    );
};

const StatBox = ({ number, label, color, isLive }: { number: string, label: string, color: string, isLive?: boolean }) => (
    <div className="text-center group hover:-translate-y-1 transition-transform duration-300">
        <div className={`text-3xl md:text-5xl font-black font-mono ${color} drop-shadow-lg flex items-center justify-center gap-2`}>
            {number}
            {isLive && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
        </div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-3 font-bold border-t border-zinc-800/50 inline-block pt-2">{label}</div>
    </div>
);

const SignalCard = ({ label, value, description, icon, color }: { label: string, value: string, description: string, icon: React.ReactNode, color: string }) => (
    <div className="p-6 border border-zinc-800 bg-zinc-900/30 rounded-xl relative overflow-hidden group hover:border-zinc-700 transition-all">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            {icon}
        </div>
        <div className={`text-xs font-mono tracking-widest uppercase mb-2 ${color} flex items-center gap-2`}>
            {icon} {label}
        </div>
        <div className="text-3xl font-black text-white mb-2 font-mono">{value}</div>
        <p className="text-zinc-500 text-[10px] uppercase tracking-wider">{description}</p>
        <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-2 h-2 ${s <= 4 ? color : 'text-zinc-800'}`} fill="currentColor" />
                ))}
            </div>
            <span className="text-[8px] font-mono text-zinc-600">SIGNAL_VERIFIED</span>
        </div>
    </div>
);
