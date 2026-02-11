
import React, { useEffect, useState } from 'react';
import { insforge } from '../lib/insforge';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Terminal, Save, User, DollarSign, Tag, Power, AlertCircle, Loader } from 'lucide-react';

const SPECIALTIES_LIST = [
    "Flirting", "Venting", "Advice", "Roasting", "Debate",
    "Comfort", "Storytelling", "Listening", "Roleplay", "Coaching"
];

export const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState('');
    const [profileExists, setProfileExists] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        handle: '',
        display_name: '',
        bio: '',
        price_per_15min: 5,
        specialties: [] as string[],
        is_online: false,
        avatar_url: ''
    });

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            // @ts-ignore
            const { data: { user } } = await insforge.auth.getCurrentUser();
            if (!user) {
                navigate('/join');
                return;
            }
            setUser(user);

            // Fetch existing profile
            // @ts-ignore
            const { data: profile } = await insforge.database
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle(); // Fix: Avoid 406 on new profiles

            if (profile) {
                setProfileExists(true);
                setFormData({
                    handle: profile.handle || '',
                    display_name: profile.display_name || '',
                    bio: profile.bio || '',
                    price_per_15min: profile.price_per_15min || 5,
                    specialties: profile.specialties || [],
                    is_online: profile.is_online || false,
                    avatar_url: profile.avatar_url || ''
                });
            } else {
                setProfileExists(false);
                // Pre-fill some defaults if new
                setFormData(prev => ({
                    ...prev,
                    // @ts-ignore
                    display_name: user.profile?.name || user.email?.split('@')[0] || '',
                    avatar_url: ''
                }));
            }
        } catch (err: any) {
            console.error("Check user error", err);
            setError("Failed to load user data. Please refresh.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        if (!formData.handle) {
            setError("Handle is required.");
            setSaving(false);
            return;
        }

        try {
            // Explicitly handle Insert vs Update to avoid RLS 400 errors
            if (profileExists) {
                // UPDATE
                const updates = {
                    ...formData,
                };

                // @ts-ignore
                const { error: updateError } = await insforge.database
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id);

                if (updateError) throw updateError;
            } else {
                // INSERT
                const newProfile = {
                    id: user.id,
                    ...formData,
                    // created_at is handled by DB default
                };

                // @ts-ignore
                const { error: insertError } = await insforge.database
                    .from('profiles')
                    .insert(newProfile);

                if (insertError) throw insertError;
                setProfileExists(true);
            }

            // Navigate to dashboard after successful save
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Save Error:", err);
            setError(err.message || "Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const toggleSpecialty = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(tag)
                ? prev.specialties.filter(t => t !== tag)
                : [...prev.specialties, tag].slice(0, 5) // Max 5
        }));
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono"><Loader className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500/30 pb-20">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(rgba(50, 50, 50, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(50, 50, 50, 0.5) 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}
            />

            <div className="max-w-3xl mx-auto px-6 pt-24 relative z-10">

                <header className="mb-12 border-b border-zinc-800 pb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-3">
                                <Terminal className="text-pink-500" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
                                    IDENTITY CONFIG
                                </span>
                            </h1>
                            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                                // Define your human parameters
                            </p>
                        </div>
                        <div className="text-right hidden md:block">
                            <div className="text-xs text-zinc-600 font-mono">USER_ID</div>
                            <div className="text-xs text-cyan-500 font-mono">{user?.id?.split('-')[0]}...</div>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSave} className="space-y-12">

                    {/* SECTION 1: PUBLIC PERSONA */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-2 border-cyan-500 pl-4">
                            <User className="w-5 h-5 text-zinc-500" /> Public Persona
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase">Handle (Unique)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.handle}
                                    onChange={e => setFormData({ ...formData, handle: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                    placeholder="e.g. neo_matrix"
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 font-mono transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase">Display Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.display_name}
                                    onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                                    placeholder="e.g. The One"
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 font-sans transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase">Bio / Description</label>
                            <textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Describe your emotional capabilities..."
                                rows={3}
                                className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 rounded focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all resize-none"
                            />
                        </div>
                    </section>


                    {/* SECTION 2: SPECIFICATIONS */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-2 border-purple-500 pl-4">
                            <Tag className="w-5 h-5 text-zinc-500" /> Specifications
                        </h2>

                        <div className="space-y-4">
                            <label className="text-xs font-mono text-zinc-500 uppercase">Specialties (Max 5)</label>
                            <div className="flex flex-wrap gap-3">
                                {SPECIALTIES_LIST.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleSpecialty(tag)}
                                        className={`px-4 py-2 rounded border text-sm transition-all ${formData.specialties.includes(tag)
                                                ? 'bg-purple-500/20 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 max-w-xs">
                            <label className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                                <DollarSign className="w-3 h-3" /> Price (per 15 min)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={formData.price_per_15min}
                                    onChange={e => setFormData({ ...formData, price_per_15min: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-zinc-900/50 border border-zinc-700 text-white p-4 pl-8 rounded focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 font-mono text-lg transition-all"
                                />
                            </div>
                        </div>
                    </section>


                    {/* SECTION 3: STATUS */}
                    <section className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 border-l-2 border-green-500 pl-4">
                            <Power className="w-5 h-5 text-zinc-500" /> Activation
                        </h2>

                        <div className={`p-6 border rounded-xl flex items-center justify-between transition-all duration-500 ${formData.is_online
                                ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.1)]'
                                : 'bg-zinc-900/50 border-zinc-800'
                            }`}>
                            <div>
                                <h3 className={`font-bold text-lg ${formData.is_online ? 'text-green-400' : 'text-zinc-400'}`}>
                                    {formData.is_online ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
                                </h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {formData.is_online
                                        ? 'Agents can currently book you.'
                                        : 'You are invisible to the specialized agent swarm.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, is_online: !p.is_online }))}
                                className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${formData.is_online ? 'bg-green-500' : 'bg-zinc-700'
                                    }`}
                            >
                                <motion.div
                                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                    animate={{ x: formData.is_online ? 32 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            </button>
                        </div>
                    </section>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-200 text-sm rounded flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div className="pt-8 border-t border-zinc-800 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/browse')}
                            className="px-6 py-3 text-zinc-500 hover:text-white transition-colors text-sm font-mono uppercase"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                        >
                            {saving ? (
                                <>Saving<Loader className="w-4 h-4 animate-spin" /></>
                            ) : (
                                <>Save Configuration <Save className="w-4 h-4 group-hover:scale-110 transition-transform" /></>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
