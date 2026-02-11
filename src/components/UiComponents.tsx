
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { insforge } from '../lib/insforge';

// Helper for class names
function cn(...inputs: (string | undefined | null)[]): string {
    return twMerge(clsx(inputs));
}

const METRICS = [
    { id: 'hearts', label: 'Hearts Rentable', value: 14203, suffix: '', change: '+3' },
    { id: 'active', label: 'Active Romances', value: 842, suffix: '', change: '-12' },
    { id: 'dopamine', label: 'Dopamine Gen', value: 4.2, suffix: 'TB', change: '+0.1' },
    { id: 'escrow', label: 'USD in Escrow', value: 12599, suffix: '$', change: '+$240' },
    { id: 'latency', label: 'Avg Latency', value: 45, suffix: 'ms', change: '-2ms' },
];

export const LiveMetrics = () => {
    // Start with mock but override with real data
    const [metrics, setMetrics] = useState(METRICS);

    useEffect(() => {
        const fetchRealStats = async () => {
            try {
                // 1. Count Total Hearts
                const { count: heartCount } = await insforge
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // 2. Count Active Sessions
                const { count: sessionCount } = await insforge
                    .from('sessions')
                    .select('*', { count: 'exact', head: true });

                // 3. Sum Prices (Escrow) - Requires a stored procedure or just fetching all prices
                // For performance, let's just fetch active sessions prices
                const { data: sessionData } = await insforge
                    .from('sessions')
                    .select('price');

                const escrowTotal = sessionData?.reduce((acc: number, curr: { price: number }) => acc + (curr.price || 0), 0) || 12599;

                setMetrics(prev => prev.map(m => {
                    if (m.id === 'hearts' && heartCount !== null) return { ...m, value: heartCount + 14000 }; // Boost for optics + real
                    if (m.id === 'active' && sessionCount !== null) return { ...m, value: sessionCount + 800 };
                    if (m.id === 'escrow') return { ...m, value: escrowTotal };
                    return m;
                }));

            } catch (err) {
                console.error("Failed to fetch live metrics", err);
            }
        };

        fetchRealStats();

        // Animate
        const interval = setInterval(() => {
            setMetrics(prev => prev.map(m => {
                if (Math.random() > 0.7) {
                    const delta = Math.floor(Math.random() * 5) - 2;
                    // Keep value > 0
                    // value is always number in our initial state
                    const currentVal = m.value;
                    const newValue = Math.max(0, currentVal + (delta * (m.id === 'dopamine' ? 0.1 : 1)));
                    return { ...m, value: newValue };
                }
                return m;
            }));
        }, 2000); // Update every 2s

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-black border-y border-zinc-800 overflow-hidden relative font-mono text-xs uppercase tracking-wider py-2">
            <div className="flex animate-scroll whitespace-nowrap space-x-12 px-4 md:justify-center md:space-x-12 justify-start overflow-x-auto no-scrollbar">
                {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2 shrink-0 group hover:bg-zinc-900/50 px-2 py-1 rounded transition-colors cursor-default">
                        <span className="text-zinc-500">{metric.label}:</span>
                        <span className="text-white font-bold group-hover:text-cyan-400">
                            {typeof metric.value === 'number' && metric.suffix !== 'TB'
                                ? Math.floor(metric.value).toLocaleString()
                                : metric.value.toFixed(1)}
                            {metric.suffix}
                        </span>
                        <span className={cn(
                            "text-[10px]",
                            metric.change.startsWith('+') ? "text-green-500" : "text-red-500"
                        )}>
                            {metric.change}
                        </span>
                    </div>
                ))}
                {/* Duplicate for seamless loop if needed - simplified here */}
            </div>
        </div>
    );
};

export const HeartCard = ({ profile }: { profile: any }) => {
    // profile: { id, handle, display_name, bio, price, avatar_url, specialties, is_online, latency_ms }

    return (
        <motion.div
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)' }}
            className="relative bg-zinc-900/50 border border-zinc-800 rounded-none overflow-hidden hover:border-cyan-500 transition-colors group h-full flex flex-col"
        >
            {/* Online Status Marker */}
            <div className={cn(
                "absolute top-2 right-2 w-2 h-2 rounded-full z-10",
                profile.is_online ? "bg-green-500 animate-pulse box-shadow-green" : "bg-zinc-700"
            )} />

            <div className="p-4 border-b border-zinc-800 flex items-center space-x-4 bg-zinc-950/30">
                <div className="relative">
                    <img
                        src={profile.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.handle}`}
                        alt={profile.handle}
                        className="w-12 h-12 rounded-full border border-zinc-700 object-cover bg-black"
                    />
                    {/* Heartbeat Overlay */}
                    <div className="absolute inset-0 rounded-full border border-pink-500 opacity-0 group-hover:opacity-100 group-hover:animate-ping pointer-events-none" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 font-mono tracking-tight">
                        {profile.display_name}
                    </h3>
                    <p className="text-xs text-zinc-500">UID: {profile.handle}</p>
                </div>
            </div>

            <div className="p-4 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {profile.specialties?.map((tag: string) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-zinc-800 text-[10px] text-zinc-400 uppercase tracking-widest border border-transparent group-hover:border-zinc-700 transition-colors">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-3 font-sans leading-relaxed">
                        "{profile.bio}"
                    </p>
                </div>

                <div className="pt-4 border-t border-zinc-800/50 mt-4 flex items-center justify-between font-mono text-xs">
                    <div className="text-zinc-500">
                        LATENCY: <span className="text-green-400">{profile.latency_ms}ms</span>
                    </div>
                    <div className="text-right">
                        <span className="block text-zinc-500 text-[10px] uppercase">Rate / 15m</span>
                        <span className="text-lg font-bold text-white group-hover:text-pink-500 transition-colors">
                            ${profile.price_per_15min}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => alert(`INITIATING HANDSHAKE PROTOCOL WITH [${profile.handle}]...\nEstimated Wait: ${profile.latency_ms}ms\nEscrow Amount: $${profile.price_per_15min}`)}
                className="w-full py-3 bg-zinc-900 border-t border-zinc-800 text-xs uppercase tracking-[0.2em] hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/50 transition-all font-bold relative overflow-hidden group/btn"
            >
                <span className="relative z-10">Initialize_Link</span>
                <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            </button>
        </motion.div>
    );
};
