
import React, { useEffect, useState, useRef } from 'react';
import { Shield, CreditCard, Loader, Upload, User } from 'lucide-react';
import { insforge } from '../lib/insforge';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [earnings, setEarnings] = useState(0);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            // @ts-ignore
            const { data: { user } } = await insforge.auth.getCurrentUser();
            if (!user) {
                navigate('/join');
                return;
            }
            setUser(user);

            // Fetch profile
            // @ts-ignore
            const { data: profileData } = await insforge.database
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (!profileData) {
                navigate('/profile');
                return;
            }
            setProfile(profileData);

            // Calculate earnings from completed sessions
            // @ts-ignore
            const { data: sessions } = await insforge.database
                .from('sessions')
                .select('price')
                .eq('human_id', user.id)
                .eq('status', 'completed');

            const total = sessions?.reduce((sum: number, s: any) => sum + (parseFloat(s.price) || 0), 0) || 0;
            setEarnings(total);

        } catch (err) {
            console.error("Dashboard load error:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: any) => {
        if (!user || updating) return;
        setUpdating(true);
        try {
            // @ts-ignore
            const { error } = await insforge.database
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;
            setProfile({ ...profile, ...updates });
        } catch (err) {
            console.error("Update error:", err);
        } finally {
            setUpdating(false);
        }
    };

    const toggleOnline = () => {
        updateProfile({ is_online: !profile.is_online });
    };

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRate = parseFloat(e.target.value);
        if (newRate >= 0) {
            updateProfile({ price_per_15min: newRate });
        }
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            // @ts-ignore
            const { data, error } = await insforge.storage
                .from('avatars')
                .uploadAuto(file);

            if (error) throw error;
            if (!data) throw new Error('Upload failed');

            // Update profile with new avatar URL
            await updateProfile({ avatar_url: data.url });
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader className="animate-spin text-cyan-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-mono">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="border-b border-zinc-800 pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">CONTROL_PANEL</h1>
                        <p className="text-zinc-500">Manage your availability and payouts.</p>
                    </div>
                    <button 
                        onClick={toggleOnline}
                        disabled={updating}
                        className={`flex items-center gap-2 ${profile?.is_online ? 'text-green-500' : 'text-zinc-600'} transition-colors hover:opacity-70`}
                    >
                        <span className={`w-2 h-2 ${profile?.is_online ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'} rounded-full`} />
                        {profile?.is_online ? 'ONLINE' : 'OFFLINE'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Avatar Section */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20">
                            <h2 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Profile Photo</h2>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    {profile?.avatar_url ? (
                                        <img 
                                            src={profile.avatar_url} 
                                            alt="Avatar" 
                                            className="w-24 h-24 rounded-full object-cover border-2 border-pink-500/30"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                                            <User className="w-10 h-10 text-zinc-600" />
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
                                            <Loader className="animate-spin text-pink-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <button
                                        onClick={handlePhotoClick}
                                        disabled={uploading || updating}
                                        className="px-4 py-2 bg-pink-600 text-white text-xs font-bold uppercase hover:bg-pink-500 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Upload className="w-3 h-3" /> Upload Photo
                                    </button>
                                    <p className="text-xs text-zinc-600 mt-2">Max 5MB • JPG, PNG</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Earnings */}
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20">
                            <h2 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Earnings (Pending)</h2>
                            <div className="text-4xl font-bold text-white mb-2">${earnings.toFixed(2)}</div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-pink-600 text-white text-xs font-bold uppercase hover:bg-pink-500 transition-colors flex items-center gap-2">
                                    <CreditCard className="w-3 h-3" /> Connect Stripe
                                </button>
                                <button className="px-4 py-2 border border-zinc-700 text-zinc-400 text-xs font-bold uppercase hover:bg-zinc-800 transition-colors">
                                    Crypto Payout
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right Column - Settings */}
                    <div className="space-y-6">
                        <section className="p-6 border border-zinc-800 bg-zinc-900/20">
                            <h2 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Verification Status</h2>
                            <div className="flex items-center gap-4">
                                <Shield className={`w-8 h-8 ${profile?.avatar_url ? 'text-green-500' : 'text-zinc-600'}`} />
                                <div>
                                    <div className="font-bold text-white">
                                        {profile?.avatar_url ? 'Verified' : 'Unverified'}
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        {profile?.avatar_url ? 'Profile photo uploaded' : 'Upload photo to verify'}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="p-6 border border-zinc-800 bg-zinc-900/20 space-y-6">
                            <h2 className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Availability Settings</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-black border border-zinc-800">
                                    <div>
                                        <div className="font-medium text-white">Chat Availability</div>
                                        <div className="text-xs text-zinc-500 mt-1">
                                            {profile?.is_online ? 'Available for bookings' : 'Not accepting bookings'}
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleOnline}
                                        disabled={updating}
                                        className={`w-12 h-6 ${profile?.is_online ? 'bg-green-500/20 border-green-500/50' : 'bg-zinc-800 border-zinc-700'} rounded-full relative cursor-pointer border transition-all disabled:opacity-50`}
                                    >
                                        <div className={`absolute ${profile?.is_online ? 'right-0.5 bg-green-500 shadow-[0_0_10px_green]' : 'left-0.5 bg-zinc-500'} top-0.5 w-5 h-5 rounded-full transition-all`} />
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-zinc-800">
                                    <label className="block text-zinc-500 text-xs mb-2">RATE / 15 MIN (USD)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        min="0"
                                        value={profile?.price_per_15min || 0} 
                                        onChange={handleRateChange}
                                        disabled={updating}
                                        className="bg-black border border-zinc-800 text-white p-3 w-full font-mono focus:border-pink-500 outline-none disabled:opacity-50 text-lg" 
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
