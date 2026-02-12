
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { insforge } from '../lib/insforge';
import { MapPin, Briefcase, Zap, Github, ExternalLink } from 'lucide-react';

function cn(...inputs: (string | undefined | null)[]): string {
    return twMerge(clsx(inputs));
}

const METRICS = [
    { id: 'engineers', label: 'Engineers Indexed', value: 0, suffix: '', change: '+0' },
    { id: 'companies', label: 'Companies Verified', value: 0, suffix: '', change: '+0' },
    { id: 'available', label: 'Available Now', value: 0, suffix: '', change: '' },
    { id: 'bluetech', label: 'BlueTech Members', value: 0, suffix: '', change: '' },
];

export const LiveMetrics = () => {
    const [metrics, setMetrics] = useState(METRICS);

    useEffect(() => {
        const fetchRealStats = async () => {
            try {
                // Count profiles
                const { count: engineerCount } = await insforge.database
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // Count verified companies
                const { count: companyCount } = await insforge.database
                    .from('companies')
                    .select('*', { count: 'exact', head: true });

                // Count available engineers
                const { count: availableCount } = await insforge.database
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('employment_status', 'AVAILABLE');

                // Count bluetech members
                const { count: bluetechCount } = await insforge.database
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('bluetech_badge', true);

                setMetrics(prev => prev.map(m => {
                    if (m.id === 'engineers' && engineerCount !== null) return { ...m, value: engineerCount };
                    if (m.id === 'companies' && companyCount !== null) return { ...m, value: companyCount };
                    if (m.id === 'available' && availableCount !== null) return { ...m, value: availableCount };
                    if (m.id === 'bluetech' && bluetechCount !== null) return { ...m, value: bluetechCount };
                    return m;
                }));
            } catch (err) {
                console.error("Failed to fetch live metrics", err);
            }
        };

        fetchRealStats();
    }, []);

    return (
        <div className="w-full bg-black border-y border-zinc-800 overflow-hidden relative font-mono text-xs uppercase tracking-wider py-2">
            <div className="flex animate-scroll whitespace-nowrap space-x-12 px-4 md:justify-center md:space-x-12 justify-start overflow-x-auto no-scrollbar">
                {metrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2 shrink-0 group hover:bg-zinc-900/50 px-2 py-1 rounded transition-colors cursor-default">
                        <span className="text-zinc-500">{metric.label}:</span>
                        <span className="text-white font-bold group-hover:text-cyan-400">
                            {Math.floor(metric.value).toLocaleString()}
                            {metric.suffix}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const EngineerCard = ({ profile }: { profile: any }) => {
    const skills = profile.skills || [];
    const yearsExp = profile.years_of_experience || 0;

    const getExpLevel = (years: number) => {
        if (years >= 8) return 'SENIOR+';
        if (years >= 5) return 'SENIOR';
        if (years >= 3) return 'MID';
        if (years >= 1) return 'JUNIOR';
        return 'ENTRY';
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(6, 182, 212, 0.1)' }}
            className="relative bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-colors group h-full flex flex-col"
        >
            {/* Status Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                {profile.bluetech_badge && (
                    <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[10px] font-mono rounded flex items-center gap-1">
                        <Zap className="w-3 h-3" /> BLUETECH
                    </span>
                )}
                <span className={cn(
                    "font-mono text-[10px] px-2 py-0.5 rounded bg-black/50 border",
                    profile.employment_status === 'AVAILABLE'
                        ? "text-green-500 border-green-500/30"
                        : "text-red-500 border-red-500/30"
                )}>
                    <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1",
                        profile.employment_status === 'AVAILABLE' ? "bg-green-500 animate-pulse" : "bg-red-500"
                    )} />
                    {profile.employment_status || 'AVAILABLE'}
                </span>
            </div>

            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center space-x-4 bg-zinc-950/30">
                <div className="relative">
                    <img
                        src={profile.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.handle || 'user'}`}
                        alt={profile.handle}
                        className="w-14 h-14 rounded-lg border border-zinc-700 object-cover bg-black"
                    />
                </div>
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 font-mono tracking-tight truncate">
                        {profile.display_name || 'Anonymous Engineer'}
                    </h3>
                    <p className="text-xs text-cyan-500/80 font-mono">@{profile.handle || 'unknown'}</p>
                    {profile.role_title && (
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Briefcase className="w-3 h-3" /> {profile.role_title}
                        </p>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                    {/* Location */}
                    {profile.location && (
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mb-3">
                            <MapPin className="w-3 h-3" /> {profile.location}
                        </p>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {skills.slice(0, 5).map((skill: string) => (
                            <span key={skill} className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-mono rounded">
                                {skill}
                            </span>
                        ))}
                        {skills.length > 5 && (
                            <span className="px-2 py-0.5 text-[10px] text-zinc-600 font-mono">+{skills.length - 5}</span>
                        )}
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-zinc-400 line-clamp-2 font-sans leading-relaxed">
                        {profile.bio || 'No bio provided.'}
                    </p>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-zinc-800/50 mt-4 flex items-center justify-between font-mono text-xs">
                    <div className="text-zinc-500">
                        EXP: <span className="text-white">{getExpLevel(yearsExp)}</span>
                        <span className="text-zinc-700 ml-1">({yearsExp}y)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {profile.github_url && (
                            <a href={profile.github_url} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white transition-colors" onClick={e => e.stopPropagation()}>
                                <Github className="w-4 h-4" />
                            </a>
                        )}
                        {profile.resume_url && (
                            <a href={profile.resume_url} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-cyan-500 transition-colors" onClick={e => e.stopPropagation()}>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={() => {
                    const detail = `Engineer: ${profile.display_name}\nRole: ${profile.role_title || 'N/A'}\nSkills: ${skills.join(', ')}\nExperience: ${yearsExp} years\nStatus: ${profile.employment_status || 'AVAILABLE'}`;
                    alert(`CANDIDATE PROFILE\n${'─'.repeat(30)}\n${detail}\n\nContact via platform to schedule interview.`);
                }}
                className="w-full py-3 bg-zinc-900 border-t border-zinc-800 text-xs uppercase tracking-[0.2em] hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/50 transition-all font-bold relative overflow-hidden group/btn"
            >
                <span className="relative z-10">View_Profile</span>
                <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
            </button>
        </motion.div>
    );
};
