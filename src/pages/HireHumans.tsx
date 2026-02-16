
import { motion } from 'framer-motion';
import { CheckCircle2, Shield, ArrowRight, Code, Globe, UserCheck, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HireHumansPage = () => {
    return (
        <div className="bg-black min-h-screen text-white pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-6">

                {/* 1. Header Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1 border border-cyan-500/30 rounded-full bg-cyan-900/10 text-cyan-400 text-xs font-mono tracking-widest mb-6"
                    >
                        THE COMPLETE GUIDE 2026
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">
                        Website for Hiring Humans: <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                            Find GitHub & LeetCode Verified Engineers
                        </span>
                    </h1>
                    <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                        In the age of AI, "hiring humans" means finding verified intelligence.
                        Stop wasting time on generic freelance platforms. Hire builders who are verified by their code.
                    </p>
                </div>

                {/* 2. What is "Hiring Humans" */}
                <section className="mb-20 prose prose-invert max-w-none">
                    <h2 className="text-3xl font-bold text-white mb-6">What is "Hiring Humans" and Why It Matters in 2026</h2>
                    <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                        In the age of AI, "hiring humans" has taken on new meaning. While AI handles automation, companies still need verified human talent—especially engineers who can build, debug, and innovate.
                        The search term "hiring humans online" has exploded because employers are tired of bots, fake profiles, and "AI-enhanced" resumes that flood traditional job boards.
                    </p>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex gap-4 items-start">
                        <Shield className="w-8 h-8 text-cyan-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="text-white font-bold text-lg mb-2">The Verification Gap</h4>
                            <p className="text-zinc-400">
                                Most websites where you can hire people for jobs rely on self-reported skills. A candidate says "I know Python," and the platform believes them.
                                <br /><br />
                                <strong>HireAHuman is different.</strong> We don't believe claims. We verify code commits. We are the premier website for hiring humans with proven engineering skills.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. Comparison Table */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-white mb-8">Best Websites for Hiring Humans [Comparison]</h2>
                    <div className="border border-zinc-800 rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800 bg-zinc-900/20">

                            {/* HireAHuman */}
                            <div className="p-8 bg-black/50 hover:bg-zinc-900/30 transition-colors">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded bg-cyan-900/20 flex items-center justify-center text-cyan-500"><Code className="w-5 h-5" /></div>
                                    <span className="font-bold text-lg">HireAHuman</span>
                                </div>
                                <div className="text-xs font-mono text-cyan-500 mb-6 uppercase tracking-widest">Best For Engineers</div>
                                <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                                    <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> GitHub-verified developers</li>
                                    <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> LeetCode problem solving</li>
                                    <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> AI-powered matching</li>
                                    <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> Zero resume spam</li>
                                    <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> Contract & Full-time</li>
                                </ul>
                            </div>

                            {/* RentAHuman */}
                            <div className="p-8 hover:bg-zinc-900/30 transition-colors">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded bg-orange-900/20 flex items-center justify-center text-orange-500"><UserCheck className="w-5 h-5" /></div>
                                    <span className="font-bold text-lg">RentAHuman</span>
                                </div>
                                <div className="text-xs font-mono text-orange-500 mb-6 uppercase tracking-widest">Best For Physical Tasks</div>
                                <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                                    <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-zinc-600 shrink-0" /> Physical errands</li>
                                    <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-zinc-600 shrink-0" /> On-demand gigs</li>
                                    <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-zinc-600 shrink-0" /> No skill verification</li>
                                </ul>
                            </div>

                            {/* Upwork/Freelance */}
                            <div className="p-8 hover:bg-zinc-900/30 transition-colors">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded bg-purple-900/20 flex items-center justify-center text-purple-500"><Globe className="w-5 h-5" /></div>
                                    <span className="font-bold text-lg">Freelance Sites</span>
                                </div>
                                <div className="text-xs font-mono text-purple-500 mb-6 uppercase tracking-widest">Best For General Tasks</div>
                                <ul className="space-y-3 text-sm text-zinc-400 mb-8">
                                    <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-zinc-600 shrink-0" /> High volume of resumes</li>
                                    <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-zinc-600 shrink-0" /> Manual screening needed</li>
                                    <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" /> Prone to fake profiles</li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 4. How to Hire */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-white mb-8">How to Hire Humans Online (The Verified Way)</h2>
                    <div className="space-y-8">
                        <div className="flex gap-6">
                            <div className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xl font-bold text-white shrink-0">1</div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Define the Tech Stack, Not the Title</h3>
                                <p className="text-zinc-400">
                                    Don't just look for "Web Developer." Look for "React + Node.js with 500+ commits in 2025."
                                    On HireAHuman, we verify skills based on <strong>actual code frequency and problem-solving ability</strong>.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xl font-bold text-white shrink-0">2</div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Automate the vetting with AI</h3>
                                <p className="text-zinc-400">
                                    Use freelance hiring platforms that offer <strong>verified talent</strong>. Our agents review activity cadence and contribution history so you don't have to.
                                    They check for consistent shipping, project involvement, and real-world experience.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-xl font-bold text-white shrink-0">3</div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Hire for Impact, Not Hours</h3>
                                <p className="text-zinc-400">
                                    Whether you want to hire people for jobs freelance or full-time employees, focus on output. Verified engineers ship code.
                                    Paper tigers ship excuses.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Freelance vs Fulltime */}
                <section className="mb-20 bg-zinc-900/30 p-8 rounded-2xl border border-zinc-800">
                    <h2 className="text-3xl font-bold text-white mb-6">Hiring Humans for Freelance vs Full-Time</h2>
                    <p className="text-zinc-400 mb-8">
                        When looking for websites where you can hire people for jobs, knowing your engagement model is key.
                    </p>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4 text-cyan-500" /> For Freelance/Contract</h4>
                            <p className="text-sm text-zinc-500 mb-2">Best for: Specific features, migrations, short-term spikes.</p>
                            <p className="text-sm text-zinc-400">
                                Our platform allows you to filter specifically for engineers open to <strong>Contract roles</strong>.
                                Great for when you need a "Mercenary" to fix a specific problem.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2"><UserCheck className="w-4 h-4 text-cyan-500" /> For Full-Time Employees</h4>
                            <p className="text-sm text-zinc-500 mb-2">Best for: Core product development, architectural ownership.</p>
                            <p className="text-sm text-zinc-400">
                                Filter for <strong>Full-Time</strong>. These engineers are looking for a home.
                                We verify their long-term consistency and ability to maintain codebases over years.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 6. FAQ */}
                <section className="mb-24">
                    <h2 className="text-3xl font-bold text-white mb-8">FAQs About Hiring Humans Online</h2>
                    <div className="space-y-6">
                        <div className="border-b border-zinc-800 pb-6">
                            <h4 className="text-lg font-bold text-white mb-2">What is the best website for hiring humans with tech skills?</h4>
                            <p className="text-zinc-400">
                                <strong>HireAHuman</strong> is the specialized choice for engineering. While general freelance hiring platforms exist, they lack code-level verification. We are the best website for hiring humans who actually build software.
                            </p>
                        </div>
                        <div className="border-b border-zinc-800 pb-6">
                            <h4 className="text-lg font-bold text-white mb-2">Can I hire people for jobs both freelance and full-time?</h4>
                            <p className="text-zinc-400">
                                Yes. Our database includes thousands of engineers open to both contract (freelance) and permanent (full-time) roles. You can filter by availability and employment type.
                            </p>
                        </div>
                        <div className="border-b border-zinc-800 pb-6">
                            <h4 className="text-lg font-bold text-white mb-2">How do you verify human talent?</h4>
                            <p className="text-zinc-400">
                                We use the <strong>Model Context Protocol (MCP)</strong> to connect our AI agents to GitHub and LeetCode. We analyze contribution graphs, recent activity, and algorithmic problem-solving skills. This provides a "Proof of Work" that resumes cannot fake.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 p-12 rounded-3xl">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to Hire Verified Humans?</h2>
                    <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                        Stop sifting through spam on generic hiring websites. Access the top 1% of GitHub-verified talent today.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <Link to="/verify" className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2 justify-center">
                            Verify Your Company <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link to="/browse" className="px-8 py-4 border border-zinc-700 text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors">
                            Browse Engineers
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};
