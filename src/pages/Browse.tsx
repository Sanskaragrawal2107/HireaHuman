
import { useEffect, useState, useMemo } from 'react';
import { insforge } from '../lib/insforge';
import { EngineerCard } from '../components/UiComponents';
import { Filter, Search, Terminal, MapPin, Code, X, Zap } from 'lucide-react';

export const BrowsePage = () => {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState('');
    const [availableOnly, setAvailableOnly] = useState(false);
    const [bluetechOnly, setBluetechOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [minYears, setMinYears] = useState(0);
    const [skillFilterSearch, setSkillFilterSearch] = useState('');

    // Dynamically extract the most popular skills from all profiles
    const popularSkills = useMemo(() => {
        const skillCounts: Record<string, number> = {};
        profiles.forEach(p => {
            (p.skills || []).forEach((s: string) => {
                skillCounts[s] = (skillCounts[s] || 0) + 1;
            });
        });
        return Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50)
            .map(([skill]) => skill);
    }, [profiles]);

    const displayedSkills = skillFilterSearch
        ? popularSkills.filter(s => s.toLowerCase().includes(skillFilterSearch.toLowerCase()))
        : popularSkills;

    useEffect(() => {
        fetchProfiles();
    }, []);

    async function fetchProfiles(retryCount = 0) {
        try {
            // @ts-ignore
            const { data, error } = await insforge.database
                .from('profiles')
                .select('*')
                .order('bluetech_badge', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                // Handle JWT expiration error
                if ((error.code === 'PGRST301' || error.message?.includes('JWT')) && retryCount === 0) {
                    console.warn('JWT expired, clearing stored session and retrying with anonKey...');
                    
                    // Clear expired token from storage
                    localStorage.removeItem('hireahuman_manual_session');
                    sessionStorage.removeItem('hireahuman_logged_out');
                    
                    // Clear from SDK token manager
                    // @ts-ignore
                    if (insforge.auth?.tokenManager) {
                        // @ts-ignore
                        insforge.auth.tokenManager.clearSession();
                    }
                    // @ts-ignore
                    if (insforge.http) {
                        // @ts-ignore
                        insforge.http.setAuthToken(null);
                    }
                    
                    // Retry once with clean state (will use anonKey)
                    await fetchProfiles(1);
                    return;
                }
                throw error;
            }
            if (data) setProfiles(data);
        } catch (err) {
            console.error("Error fetching profiles:", err);
        } finally {
            setLoading(false);
        }
    }

    const toggleSkillFilter = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSkills([]);
        setLocationFilter('');
        setAvailableOnly(false);
        setBluetechOnly(false);
        setMinYears(0);
    };

    // Client-side filtering
    const filteredProfiles = profiles.filter(profile => {
        // Search query (name, handle, bio, role)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const searchable = `${profile.display_name} ${profile.handle} ${profile.bio} ${profile.role_title} ${(profile.skills || []).join(' ')}`.toLowerCase();
            if (!searchable.includes(q)) return false;
        }

        // Skills filter
        if (selectedSkills.length > 0) {
            const profileSkills = (profile.skills || []).map((s: string) => s.toLowerCase());
            if (!selectedSkills.some(s => profileSkills.includes(s.toLowerCase()))) return false;
        }

        // Location filter
        if (locationFilter) {
            if (!profile.location || !profile.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
        }

        // Available only
        if (availableOnly && profile.employment_status !== 'AVAILABLE') return false;

        // BlueTech only
        if (bluetechOnly && !profile.bluetech_badge) return false;

        // Min years
        if (minYears > 0 && (profile.years_of_experience || 0) < minYears) return false;

        return true;
    });

    const hasActiveFilters = searchQuery || selectedSkills.length > 0 || locationFilter || availableOnly || bluetechOnly || minYears > 0;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-cyan-500/30">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10">

                {/* Header / Search Bar */}
                <div className="flex flex-col gap-6 border-b border-zinc-800 pb-8 bg-black/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-800/50">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="text-cyan-500 font-mono text-xs mb-2 flex items-center gap-2">
                                <Terminal className="w-4 h-4" /> SYSTEM_Ready // {profiles.length} profiles indexed
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter mb-2 text-white">TALENT_DIRECTORY</h1>
                            <p className="text-zinc-400 text-sm font-light">
                                Source verified engineering talent. <span className="text-cyan-500">Signal only. No noise.</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-cyan-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by name, skill, role..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="bg-zinc-900/50 border border-zinc-800 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 w-full md:w-80 transition-all placeholder:text-zinc-600 font-mono text-zinc-300 rounded"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-3 border rounded group transition-colors ${showFilters || hasActiveFilters
                                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                                    : 'border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400 bg-zinc-900/50'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                            {/* Skills */}
                            <div>
                                <label className="text-xs text-zinc-500 font-mono uppercase mb-2 block flex items-center gap-1"><Code className="w-3 h-3" /> Filter by Skills ({popularSkills.length} found in profiles)</label>
                                <input
                                    type="text"
                                    value={skillFilterSearch}
                                    onChange={e => setSkillFilterSearch(e.target.value)}
                                    placeholder="Search skills..."
                                    className="w-full md:w-64 bg-zinc-900/50 border border-zinc-800 px-3 py-2 text-xs rounded focus:outline-none focus:border-cyan-500 font-mono text-zinc-300 mb-3"
                                />
                                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                                    {displayedSkills.map(skill => (
                                        <button
                                            key={skill}
                                            onClick={() => toggleSkillFilter(skill)}
                                            className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${selectedSkills.includes(skill)
                                                ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
                                                : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-600'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                    {displayedSkills.length === 0 && (
                                        <span className="text-xs text-zinc-600 font-mono">No matching skills. Try a different search.</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-6">
                                {/* Location */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-xs text-zinc-500 font-mono uppercase mb-2 block flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</label>
                                    <input
                                        type="text"
                                        value={locationFilter}
                                        onChange={e => setLocationFilter(e.target.value)}
                                        placeholder="e.g. San Francisco"
                                        className="w-full bg-zinc-900/50 border border-zinc-800 px-4 py-2 text-sm rounded focus:outline-none focus:border-cyan-500 font-mono text-zinc-300"
                                    />
                                </div>

                                {/* Min Experience */}
                                <div className="w-40">
                                    <label className="text-xs text-zinc-500 font-mono uppercase mb-2 block">Min Experience</label>
                                    <input
                                        type="number" min="0" max="50"
                                        value={minYears}
                                        onChange={e => setMinYears(parseInt(e.target.value) || 0)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 px-4 py-2 text-sm rounded focus:outline-none focus:border-cyan-500 font-mono text-zinc-300"
                                    />
                                </div>

                                {/* Toggles */}
                                <div className="flex items-end gap-4">
                                    <button
                                        onClick={() => setAvailableOnly(!availableOnly)}
                                        className={`px-4 py-2 rounded border text-xs font-mono transition-all ${availableOnly ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                                            }`}
                                    >
                                        🟢 Available Only
                                    </button>
                                    <button
                                        onClick={() => setBluetechOnly(!bluetechOnly)}
                                        className={`px-4 py-2 rounded border text-xs font-mono flex items-center gap-1 transition-all ${bluetechOnly ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                                            }`}
                                    >
                                        <Zap className="w-3 h-3" /> BlueTech Only
                                    </button>
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-xs text-zinc-600 hover:text-red-400 font-mono flex items-center gap-1 transition-colors">
                                    <X className="w-3 h-3" /> Clear all filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="text-xs text-zinc-600 font-mono">
                    Showing {filteredProfiles.length} of {profiles.length} profiles
                    {hasActiveFilters && ' (filtered)'}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-96 bg-zinc-900/20 border border-zinc-800/50 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProfiles.map((profile) => (
                            <EngineerCard key={profile.id} profile={profile} />
                        ))}
                    </div>
                )}

                {!loading && filteredProfiles.length === 0 && (
                    <div className="text-center py-24 text-zinc-600 font-mono border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                        {hasActiveFilters
                            ? 'NO ENGINEERS MATCHING CURRENT FILTERS. TRY ADJUSTING YOUR SEARCH.'
                            : 'NO VERIFIED ENGINEERS FOUND IN DATABASE.'
                        }
                    </div>
                )}
            </div>
        </div>
    );
};
