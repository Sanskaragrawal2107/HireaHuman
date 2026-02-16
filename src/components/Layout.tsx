import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Wifi, Terminal, Twitter, Linkedin, Facebook, Instagram, Youtube, Github, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AuthProvider } from '../context/AuthContext';

function cn(...inputs: (string | undefined | null)[]) {
    return twMerge(clsx(inputs));
}

const Navbar = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const NAV_ITEMS = [
        { label: 'HOME', path: '/' },
        { label: 'FIND_TALENT', path: '/browse' },
        { label: 'FOR_ENGINEERS', path: '/join' },
        { label: 'INSIGHTS', path: '/blog' },
        { label: 'PROTOCOL', path: '/docs' },
    ];

    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 h-16 flex items-center justify-between px-6 font-mono text-xs md:text-sm">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group py-2">
                    <div className="relative w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-700 group-hover:border-cyan-500 transition-colors">
                        <Terminal className="w-4 h-4 text-cyan-500 fill-current animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold tracking-widest text-white group-hover:text-cyan-500 transition-colors text-[10px] md:text-xs">HIRE_A_HUMAN</span>
                        <span className="text-[8px] md:text-[10px] text-zinc-500">TALENT_OS V1.0</span>
                    </div>
                </Link>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            className={cn(
                                "relative py-2 tracking-widest hover:text-cyan-500 transition-colors",
                                location.pathname === item.path ? "text-cyan-500 font-bold" : "text-zinc-500"
                            )}
                        >
                            {item.label}
                            {location.pathname === item.path && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute left-0 right-0 bottom-0 h-[1px] bg-cyan-500"
                                />
                            )}
                        </Link>
                    ))}
                </div>

                {/* System Status & Mobile Menu Button */}
                <div className="flex items-center gap-4 text-zinc-600">
                    <div className="flex items-center gap-2 hidden lg:flex">
                        <Activity className="w-3 h-3 text-green-500" />
                        <span>VERIFICATION: ACTIVE</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <Wifi className="w-3 h-3 text-green-500" />
                        <span className="hidden lg:inline">NET: SECURE</span>
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-zinc-400 hover:text-cyan-500 transition-colors p-2"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed inset-0 z-40 md:hidden bg-black/95 backdrop-blur-lg pt-16"
                    >
                        <div className="flex flex-col h-full p-6 font-mono">
                            <div className="flex-1 space-y-6">
                                {NAV_ITEMS.map((item, index) => (
                                    <motion.div
                                        key={item.label}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link
                                            to={item.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={cn(
                                                "block text-2xl py-3 tracking-widest hover:text-cyan-500 transition-colors border-b border-zinc-800",
                                                location.pathname === item.path ? "text-cyan-500 font-bold" : "text-zinc-400"
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                            
                            {/* Mobile System Status */}
                            <div className="border-t border-zinc-800 pt-6 space-y-3 text-xs">
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <Activity className="w-3 h-3 text-green-500" />
                                    <span>VERIFICATION: ACTIVE</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <Wifi className="w-3 h-3 text-green-500" />
                                    <span>NET: SECURE</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const Scanlines = () => (
    <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
);

const CrtOverlay = () => (
    <div className="fixed inset-0 pointer-events-none z-[101] box-shadow-inset" style={{
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.9)"
    }} />
);

export const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <AuthProvider>
            <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500/30 selection:text-white">
                <Scanlines />
                <CrtOverlay />
                <Navbar />

                <main className="min-h-screen pt-16">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t border-zinc-900 py-12 bg-black text-xs md:text-sm font-mono text-zinc-500">
                    <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="space-y-4">
                            <div className="text-white font-bold mb-4 uppercase tracking-widest">System</div>
                            <a href="#" className="block py-1 hover:text-cyan-500 transition-colors">Platform Status</a>
                            <Link to="/docs" className="block py-1 hover:text-cyan-500 transition-colors">Integration Docs</Link>
                            <a href="/mcp.json" className="block py-1 hover:text-cyan-500 transition-colors">MCP Server Config</a>
                        </div>
                        <div className="space-y-4">
                            <div className="text-white font-bold mb-4 uppercase tracking-widest">Protocols</div>
                            <Link to="/verify" className="block py-1 hover:text-cyan-500 transition-colors">Level 3 Verification</Link>
                            <Link to="/vs/rentahuman" className="block py-1 hover:text-cyan-500 transition-colors">Vs Rent A Human</Link>
                            <a href="#" className="block py-1 hover:text-cyan-500 transition-colors">Hiring State Lock</a>
                        </div>
                        <div className="space-y-4">
                            <div className="text-white font-bold mb-4 uppercase tracking-widest">Access</div>
                            <Link to="/join" className="block py-1 hover:text-cyan-500 transition-colors flex items-center gap-2">
                                For Engineers <Terminal className="w-3 h-3" />
                            </Link>
                            <Link to="/verify" className="block py-1 hover:text-cyan-500 transition-colors">For Companies</Link>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 border border-zinc-800 text-zinc-400 italic">
                                "Resume spam is a DDoS attack on human attention. We provide the firewall."
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 opacity-70">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="uppercase tracking-widest">HireAHuman Inc.</div>
                            <div className="flex items-center gap-4">
                                <a href="https://twitter.com/hireahuman" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="hover:text-cyan-500 transition-colors p-2">
                                    <Twitter className="w-4 h-4" />
                                </a>
                                <a href="https://www.linkedin.com/company/hireahuman/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-cyan-500 transition-colors p-2">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                                <a href="https://github.com/hireahuman" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-cyan-500 transition-colors p-2">
                                    <Github className="w-4 h-4" />
                                </a>
                                <a href="https://www.youtube.com/@hireahuman" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-cyan-500 transition-colors p-2">
                                    <Youtube className="w-4 h-4" />
                                </a>
                                <a href="https://www.instagram.com/hireahuman/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-cyan-500 transition-colors p-2">
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a href="https://www.facebook.com/hireahuman/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-cyan-500 transition-colors p-2">
                                    <Facebook className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                        <div className="uppercase tracking-widest text-xs">EST. 2026 // SAN FRANCISCO + BANGALORE</div>
                    </div>
                </footer>
            </div>
        </AuthProvider>
    );
};
