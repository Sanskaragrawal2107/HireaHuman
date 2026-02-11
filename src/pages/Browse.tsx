
import { useEffect, useState } from 'react';
import { insforge } from '../lib/insforge';
import { HeartCard } from '../components/UiComponents';
import { Filter, Search } from 'lucide-react';

export const BrowsePage = () => {
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfiles() {
            try {
                // @ts-ignore
                const { data, error } = await insforge.database
                    .from('profiles')
                    .select('*')
                    .order('is_online', { ascending: false }); // Show online users first

                if (error) throw error;
                if (data) setProfiles(data);
            } catch (err) {
                console.error("Error fetching profiles:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfiles();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header / Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2 font-mono">BROWSE_HEARTS</h1>
                        <p className="text-zinc-500 text-sm">Select a biological unit for emotional processing.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-cyan-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by skills..."
                                className="bg-zinc-900/50 border border-zinc-800 pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 w-64 transition-all placeholder:text-zinc-700 font-mono text-zinc-300"
                            />
                        </div>
                        <button className="p-2 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-colors">
                            <Filter className="w-4 h-4 text-zinc-400" />
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-96 bg-zinc-900/20 border border-zinc-800/50 rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {profiles.map((profile) => (
                            <HeartCard key={profile.id} profile={profile} />
                        ))}
                    </div>
                )}

                {!loading && profiles.length === 0 && (
                    <div className="text-center py-24 text-zinc-600 font-mono">
                        NO BIOLOGICAL UNITS FOUND COMPLIANT WITH QUERY.
                    </div>
                )}
            </div>
        </div>
    );
};
