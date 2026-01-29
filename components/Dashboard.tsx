import React, { useEffect, useState } from 'react';
import { getSupabase } from '../services/supabase';
import { RsvpResponse, DashboardStats } from '../types';
import { Button } from './ui/Button';
import { ArrowLeft, RefreshCw, Download, Trash2, User, Users, CheckCircle2, XCircle, Mail, MessageSquare, Phone } from 'lucide-react';

interface DashboardProps {
  slug: string;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ slug, onBack }) => {
  const [responses, setResponses] = useState<RsvpResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, accepted: 0, declined: 0, totalGuests: 0 });

  const prettyName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      // Using slug column
      const { data: host } = await supabase.from('wedding_template_couples').select('id').eq('slug', slug).single();

      if (host) {
        const { data, error } = await supabase
          .from('wedding_template_rsvps')
          .select('*')
          .eq('couple_id', host.id)
          .order('created_at', { ascending: false });

        if (data && !error) {
          // Map DB structure to frontend type
          const mappedData = data.map((r: any) => ({
            id: r.id,
            host_id: r.couple_id,
            guest_name: r.guest_name,
            guest_email: r.guest_email || '',
            guest_phone: r.guest_phone,
            attendance: r.attending ? 'yes' : 'no',
            guests_count: r.party_size || 0,
            message: r.message,
            created_at: r.created_at
          })) as RsvpResponse[];

          setResponses(mappedData);

          // Calculate Stats
          const newStats = {
            total: mappedData.length,
            accepted: mappedData.filter(r => r.attendance === 'yes').length,
            declined: mappedData.filter(r => r.attendance === 'no').length,
            totalGuests: mappedData
              .filter(r => r.attendance === 'yes')
              .reduce((sum, r) => sum + (r.guests_count || 0), 0)
          };
          setStats(newStats);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    const supabase = getSupabase();
    await supabase.from('wedding_template_rsvps').delete().eq('id', id);
    fetchResponses();
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Guest Count', 'Message', 'Date'];
    const csvContent = [
      headers.join(','),
      ...responses.map(r => [
        `"${r.guest_name}"`,
        `"${r.guest_email}"`,
        `"${r.guest_phone || ''}"`,
        `"${r.attendance === 'yes' ? 'Attending' : 'Not Attending'}"`,
        r.guests_count,
        `"${(r.message || '').replace(/"/g, '""')}"`,
        `"${new Date(r.created_at).toLocaleDateString('en-US')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}_rsvp_list.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-12 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/60 shadow-xl">
        <div>
          <h1 className="font-serif text-4xl text-stone-800 mb-2">Dashboard</h1>
          <p className="text-stone-500 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Managing: <span className="font-semibold text-rose-900 bg-rose-100 px-2 py-0.5 rounded capitalize">{prettyName}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={onBack} className="px-5 py-2.5 text-sm h-10 shadow-lg shadow-rose-100 hover:shadow-xl bg-gradient-to-r from-rose-500 to-rose-600 border-none text-white">
            <ArrowLeft size={16} strokeWidth={2} /> Back
          </Button>
          <Button onClick={fetchResponses} className="px-5 py-2.5 text-sm h-10 shadow-lg shadow-rose-100 hover:shadow-xl bg-gradient-to-r from-rose-500 to-rose-600 border-none text-white">
            <RefreshCw size={16} strokeWidth={2} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button onClick={exportCSV} className="px-5 py-2.5 text-sm h-10 shadow-lg shadow-rose-100 hover:shadow-xl bg-gradient-to-r from-rose-600 to-rose-700 border-none text-white">
            <Download size={16} strokeWidth={2} /> Excel/CSV
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Total Responses" value={stats.total} icon={<Mail size={24} className="text-stone-400" />} />
        <StatCard label="Accepted" value={stats.accepted} className="bg-gradient-to-br from-green-50 to-white text-green-700 border-green-100" icon={<CheckCircle2 size={24} className="text-green-500" />} />
        <StatCard label="Declined" value={stats.declined} className="bg-gradient-to-br from-stone-50 to-white text-stone-500" icon={<XCircle size={24} className="text-stone-400" />} />
        <StatCard label="Total Guests" value={stats.totalGuests} className="bg-gradient-to-br from-rose-50 to-white text-rose-700 border-rose-100 shadow-rose-100" icon={<Users size={24} className="text-rose-400" />} />
      </div>

      {/* List */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/60 overflow-hidden ring-1 ring-black/5">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-white/50">
          <h2 className="font-serif text-2xl text-stone-700 flex items-center gap-3">
            <Users className="text-rose-400" size={24} strokeWidth={1.5} /> Guest List
          </h2>
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">{responses.length} Entries</span>
        </div>

        {loading ? (
          <div className="p-20 text-center text-stone-400 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
            Loading guests...
          </div>
        ) : responses.length === 0 ? (
          <div className="p-20 text-center text-stone-400 italic bg-stone-50/30">No responses yet.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {responses.map((rsvp) => (
              <div key={rsvp.id} className="p-6 md:p-8 hover:bg-rose-50/30 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                <div className="flex gap-5 items-start">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-serif shadow-sm ${rsvp.attendance === 'yes' ? 'bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600 border border-rose-100' : 'bg-stone-100 text-stone-400 border border-stone-200'}`}>
                    {rsvp.guest_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-stone-800 font-serif leading-none">{rsvp.guest_name}</h3>
                    <div className="text-sm text-stone-500 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <span className="flex items-center gap-1.5"><Mail size={12} strokeWidth={2} /> {rsvp.guest_email}</span>
                      {rsvp.guest_phone && (
                        <>
                          <span className="hidden sm:inline text-stone-300">|</span>
                          <span className="flex items-center gap-1.5"><Phone size={12} strokeWidth={2} /> {rsvp.guest_phone}</span>
                        </>
                      )}
                    </div>
                    {rsvp.message && (
                      <div className="flex gap-2 items-start mt-3 text-sm text-stone-600 italic bg-white/60 p-3 rounded-xl border border-stone-100 max-w-xl">
                        <MessageSquare size={14} className="mt-1 text-rose-400 shrink-0" />
                        "{rsvp.message}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end pl-[4.5rem] md:pl-0">
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${rsvp.attendance === 'yes' ? 'bg-green-100 text-green-700 ring-1 ring-green-200' : 'bg-stone-100 text-stone-500 ring-1 ring-stone-200'}`}>
                      {rsvp.attendance === 'yes' ? <CheckCircle2 size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
                      {rsvp.attendance === 'yes' ? 'Attending' : 'Not Attending'}
                    </span>
                    {rsvp.attendance === 'yes' && (
                      <div className="text-sm font-semibold text-stone-600 mt-2 flex items-center justify-end gap-1.5">
                        <User size={14} strokeWidth={2.5} className="text-rose-400" /> {rsvp.guests_count} Guests
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(rsvp.id)}
                    className="p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; className?: string; icon?: React.ReactNode }> = ({ label, value, className = "", icon }) => (
  <div className={`bg-white p-6 rounded-[1.5rem] shadow-sm border border-stone-100 relative overflow-hidden transition-transform hover:-translate-y-1 ${className}`}>
    <div className="flex justify-between items-start mb-2">
      <p className="text-xs font-bold uppercase tracking-widest opacity-60">{label}</p>
      <div className="opacity-80">{icon}</div>
    </div>
    <p className="text-5xl font-serif font-medium tracking-tight">{value}</p>
  </div>
);