
import { useEffect, useState } from 'react';
import { insforge } from '../lib/insforge';
import { CheckCircle, XCircle, Clock, Building2, Globe, Mail, ExternalLink, Loader2, Shield, Filter, Search } from 'lucide-react';

export const AdminPage = () => {
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchCompanies();
    }, []);

    async function fetchCompanies() {
        try {
            const { data, error } = await insforge.database
                .from('companies')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setCompanies(data);
        } catch (err) {
            console.error("Error fetching companies:", err);
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(id: string, status: 'verified' | 'rejected') {
        setActionLoading(id);
        try {
            const { error } = await insforge.database
                .from('companies')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            setCompanies(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        } catch (err) {
            console.error("Error updating status:", err);
        } finally {
            setActionLoading(null);
        }
    }

    const filteredCompanies = companies.filter(c => {
        if (filter !== 'all' && c.status !== filter) return false;
        if (search) {
            const q = search.toLowerCase();
            return (c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.website?.toLowerCase().includes(q));
        }
        return true;
    });

    const counts = {
        all: companies.length,
        pending: companies.filter(c => c.status === 'pending').length,
        verified: companies.filter(c => c.status === 'verified').length,
        rejected: companies.filter(c => c.status === 'rejected').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 text-slate-900">

            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <Shield className="w-4.5 h-4.5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
                    </div>
                    <p className="text-sm text-slate-500 ml-12">Review and manage company verification requests.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total', value: counts.all, color: 'text-slate-900' },
                        { label: 'Pending', value: counts.pending, color: 'text-amber-600' },
                        { label: 'Verified', value: counts.verified, color: 'text-green-600' },
                        { label: 'Rejected', value: counts.rejected, color: 'text-red-600' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <div className="text-xs font-medium text-slate-500 mb-1">{stat.label}</div>
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                                {(['all', 'pending', 'verified', 'rejected'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {f.charAt(0).toUpperCase() + f.slice(1)}
                                        <span className="text-slate-400 ml-1">({counts[f]})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search companies..."
                                className="bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-2 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none w-64 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 text-sm">
                            No companies found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                                        <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                                        <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Business ID</th>
                                        <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Applied</th>
                                        <th className="text-right p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCompanies.map(company => (
                                        <tr key={company.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                                                        <Building2 className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{company.name}</div>
                                                        {company.website && (
                                                            <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                                <Globe className="w-2.5 h-2.5" />
                                                                {(() => { try { return new URL(company.website.startsWith('http') ? company.website : `https://${company.website}`).hostname; } catch { return company.website; } })()}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1 text-slate-600">
                                                    <Mail className="w-3 h-3 text-slate-400" />
                                                    {company.email}
                                                </div>
                                                {company.linkedin && (
                                                    <a href={company.linkedin} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                        LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                    {company.business_id || '—'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${company.status === 'verified' ? 'bg-green-50 text-green-700 border border-green-200' :
                                                        company.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                            'bg-red-50 text-red-700 border border-red-200'
                                                    }`}>
                                                    {company.status === 'verified' ? <CheckCircle className="w-3 h-3" /> :
                                                        company.status === 'pending' ? <Clock className="w-3 h-3" /> :
                                                            <XCircle className="w-3 h-3" />}
                                                    {company.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-500">
                                                {new Date(company.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 text-right">
                                                {company.status === 'pending' ? (
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <button
                                                            onClick={() => updateStatus(company.id, 'verified')}
                                                            disabled={actionLoading === company.id}
                                                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            {actionLoading === company.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updateStatus(company.id, 'rejected')}
                                                            disabled={actionLoading === company.id}
                                                            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-all disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            <XCircle className="w-3 h-3" /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
