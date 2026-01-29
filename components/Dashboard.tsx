import React, { useEffect, useState } from 'react';
import { getSupabase } from '../services/supabase';
import { RsvpResponse, DashboardStats } from '../types';
import { Button } from './ui/Button';
import { RefreshCw, Download, Trash2, Users, CheckCircle2, XCircle, Mail, MessageSquare, Phone, Copy, Link as LinkIcon, QrCode as QrIcon, Eye, Palette, Camera } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Modal } from './ui/Modal';
import { HamburgerMenu } from './ui/HamburgerMenu';

interface DashboardProps {
  slug: string;
  coverImage: string | null;
  onPreview: () => void;
  onCoverUpdate: (url: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ slug, coverImage, onPreview, onCoverUpdate }) => {
  const [responses, setResponses] = useState<RsvpResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, accepted: 0, declined: 0, totalGuests: 0 });
  const [copied, setCopied] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Fallback prettification, though we try to fetch display name
  const prettyName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const [displayName, setDisplayName] = useState('');

  // Link Construction
  const cleanLink = `${window.location.protocol}//${window.location.host}/${slug}`;

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const supabase = getSupabase();
      // Fetch id AND couple_name
      const { data: host } = await supabase
        .from('wedding_template_couples')
        .select('id, couple_name')
        .eq('slug', slug)
        .single();

      if (host) {
        if (host.couple_name) setDisplayName(host.couple_name);

        const { data, error } = await supabase
          .from('wedding_template_rsvps')
          .select('*')
          .eq('couple_id', host.id)
          .order('created_at', { ascending: false });

        if (data && !error) {
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

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg-dashboard");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}-rsvp-qr.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    fetchResponses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];

      // 10MB Check
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size must be less than 10MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const supabase = getSupabase();

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('couple_covers')
        .upload(filePath, file);

      if (uploadError) {
        // If bucket doesn't exist, this fails. We assume bucket exists via SQL migration.
        throw uploadError;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('couple_covers')
        .getPublicUrl(filePath);

      // 3. Update Couple Record
      // We need couple ID. fetchResponses already fetches it but doesn't store it in a way we can easily access globally without another fetch or state.
      // Let's refactor slightly to store coupleId or just fetch again.
      // Easiest is to fetch ID again to be safe.
      const { data: host } = await supabase
        .from('wedding_template_couples')
        .select('id')
        .eq('slug', slug)
        .single();

      if (host) {
        await supabase
          .from('wedding_template_couples')
          .update({ cover_image_url: publicUrl })
          .eq('id', host.id);

        onCoverUpdate(publicUrl);

        setModalConfig({
          isOpen: true,
          type: 'success',
          title: 'Cover Updated',
          message: 'Your beautiful cover photo has been successfully uploaded and applied.'
        });
      }

    } catch (error: any) {
      console.error('Error uploading image: ', error);
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Upload Failed',
        message: error.message || 'Error uploading image. Please check your connection and try again.'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
      <div className="w-full max-w-6xl mx-auto space-y-10 animate-fade-in pb-16 px-4 md:px-0">
        {/* Header Section */}
        <div className="relative bg-[#fffdf9] rounded-[4px] border border-stone-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
          {coverImage && (
            <div className="w-full h-48 md:h-64 relative overflow-hidden">
              <img
                src={coverImage}
                alt="Wedding Cover"
                className="w-full h-full object-cover animate-fade-in"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#fffdf9] via-transparent to-transparent opacity-60" />
            </div>
          )}
          <div className="p-6 md:p-10 relative">
            {/* Mobile Hamburger Menu */}
            <div className="absolute top-4 right-4 z-50 md:hidden">
              <HamburgerMenu
                onUploadClick={() => fileInputRef.current?.click()}
                onPreviewClick={onPreview}
                onRefreshClick={fetchResponses}
                onExportClick={exportCSV}
                onDownloadQR={handleDownloadQR}
                qrLink={cleanLink}
                uploading={uploading}
                loading={loading}
              />
            </div>

            {/* Decorative corner */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor" className="text-rose-900">
                <path d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z" />
              </svg>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 w-full">
              <div className="text-center md:text-left min-w-0">
                <h1
                  className="font-script text-5xl md:text-7xl tracking-normal capitalize whitespace-nowrap"
                  style={{ color: 'var(--color-primary-600)' }}
                >
                  {(loading && !displayName) ? (
                    <span className="animate-pulse text-stone-200">Loading...</span>
                  ) : (
                    displayName || prettyName
                  )}
                </h1>
              </div>

              <div className="hidden md:flex flex-nowrap items-center justify-end gap-3 shrink-0">
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white font-serif italic px-6 border-none cursor-pointer flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
                    style={{
                      backgroundColor: 'var(--color-primary-500)',
                      boxShadow: '0 8px 16px -4px var(--color-primary-100)'
                    }}
                  >
                    {uploading ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Camera size={16} className="mr-2" />}
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                </div>

                <Button
                  onClick={onPreview}
                  className="text-white font-serif italic px-6 border-none flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
                  style={{
                    backgroundColor: 'var(--color-primary-500)',
                    boxShadow: '0 8px 16px -4px var(--color-primary-100)'
                  }}
                >
                  <Eye size={16} className="mr-2" /> Preview RSVP
                </Button>
                <Button
                  onClick={fetchResponses}
                  className="text-white px-6 border-none flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
                  style={{
                    backgroundColor: 'var(--color-primary-500)',
                    boxShadow: '0 8px 16px -4px var(--color-primary-100)'
                  }}
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </Button>
                <Button
                  onClick={exportCSV}
                  className="text-white font-serif tracking-wide px-8 border-none flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
                  style={{
                    backgroundColor: 'var(--color-primary-500)',
                    boxShadow: '0 8px 20px -4px var(--color-primary-200)'
                  }}
                >
                  <Download size={16} className="mr-2" /> Export .CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Share & Invite Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Link & Instructions */}
            <div className="lg:col-span-2 bg-white rounded-[4px] border border-stone-200 p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                    <LinkIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-stone-800">Share Your Link</h3>
                    <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">Your Guests' Gateway</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <div className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-600 text-sm font-mono truncate flex items-center">
                    <span className="truncate">{cleanLink}</span>
                  </div>
                  <Button onClick={handleCopy} className="bg-stone-800 hover:bg-black text-white px-6">
                    {copied ? 'Copied!' : <><Copy size={16} className="mr-2" /> Copy Link</>}
                  </Button>
                </div>
              </div>

              <div className="bg-stone-50/50 rounded-xl p-5 border border-stone-100">
                <div className="flex items-start gap-3">
                  <Palette size={18} className="text-rose-400 mt-1 shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-bold text-stone-700 text-sm">How it Works</h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-stone-500 leading-relaxed opacity-90">
                      <li>Share the link above with your guests via WhatsApp, Email, or Instagram.</li>
                      <li>Download the QR code SVG and customize its color in Canva for your physical invitations.</li>
                      <li>Guests will see your personalized page and fill out the RSVP form.</li>
                      <li>Use this Dashboard to track responses and manage your guest list.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code (Desktop) */}
            <div className="hidden lg:flex bg-white rounded-[4px] border border-stone-200 p-8 shadow-sm flex-col items-center justify-center text-center">
              <div className="p-3 bg-white rounded-xl shadow-lg border border-stone-50 ring-4 ring-stone-50 mb-6">
                <div style={{ height: "auto", margin: "0 auto", maxWidth: 140, width: "100%" }}>
                  <QRCode
                    id="qr-code-svg-dashboard"
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={cleanLink}
                    level='H'
                    viewBox={`0 0 256 256`}
                  />
                </div>
              </div>

              <div className="space-y-4 w-full">
                <div className="flex items-center justify-center gap-2 text-stone-800">
                  <QrIcon size={18} className="text-rose-500" />
                  <h3 className="font-serif text-lg">Event QR Code</h3>
                </div>
                <Button onClick={handleDownloadQR} variant="outline" className="w-full text-xs h-9 border-stone-300">
                  <Download size={14} className="mr-2" /> Download SVG
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Responses" value={stats.total} icon={<Mail size={20} />} accent="text-rose-600" bg="bg-rose-50" />
          <StatCard
            label="Joyfully Accepted"
            value={stats.accepted}
            icon={<CheckCircle2 size={20} />}
            accent="text-rose-600"
            bg="bg-rose-50"
          />
          <StatCard
            label="Regretfully Declined"
            value={stats.declined}
            icon={<XCircle size={20} />}
            accent="text-rose-600"
            bg="bg-rose-50"
          />
          <StatCard
            label="Total Guests"
            value={stats.totalGuests}
            icon={<Users size={20} />}
            accent="text-rose-600"
            bg="bg-rose-50"
          />
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-[4px] border border-stone-200 shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent opacity-50"></div>

          <div className="p-8 md:p-10 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-rose-300">
                <Users size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-3xl text-stone-800">Guest List</h2>
                <p className="font-sans text-xs font-bold text-stone-400 tracking-widest uppercase mt-1">Managed Responses</p>
              </div>
            </div>
            <span className="font-serif italic text-stone-400 text-lg border-b border-stone-200 pb-1 px-2">{responses.length} entries</span>
          </div>

          {loading ? (
            <div className="p-32 text-center flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-[3px] border-stone-100 border-t-rose-400 rounded-full animate-spin"></div>
              <p className="font-serif italic text-stone-400">Retrieving your guest list...</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="p-32 text-center bg-stone-50/30">
              <p className="font-serif text-2xl text-stone-300 italic mb-2">No responses yet</p>
              <p className="font-sans text-xs text-stone-400 tracking-widest uppercase">Share your link to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {responses.map((rsvp) => (
                <div key={rsvp.id} className="p-6 md:px-10 md:py-8 hover:bg-[#fffdf9] transition-all duration-300 group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                    {/* Guest Info */}
                    <div className="flex items-start gap-6">
                      <div className={`w-16 h-16 shrink-0 rounded-full flex items-center justify-center text-3xl font-serif border-2 ${rsvp.attendance === 'yes'
                        ? 'border-rose-100 bg-rose-50 text-rose-500'
                        : 'border-stone-100 bg-stone-50 text-stone-300'
                        }`}>
                        {rsvp.guest_name.charAt(0).toUpperCase()}
                      </div>

                      <div className="space-y-2">
                        <div>
                          <h3 className="font-serif text-2xl text-stone-800 leading-none mb-1">{rsvp.guest_name}</h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-stone-400 tracking-wider uppercase font-sans">
                            <span className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-default">
                              <Mail size={10} /> {rsvp.guest_email || 'No email'}
                            </span>
                            {rsvp.guest_phone && (
                              <span className="flex items-center gap-1 hover:text-rose-500 transition-colors cursor-default">
                                <Phone size={10} /> {rsvp.guest_phone}
                              </span>
                            )}
                          </div>
                        </div>

                        {rsvp.message && (
                          <div className="bg-stone-50 rounded-r-xl rounded-bl-xl border-l-2 border-rose-200 p-3 max-w-lg">
                            <div className="flex gap-2">
                              <MessageSquare size={12} className="text-rose-300 shrink-0 mt-1" />
                              <p className="font-serif italic text-stone-600 text-lg leading-relaxed">"{rsvp.message}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between md:justify-end gap-8 pl-[5.5rem] md:pl-0">
                      <div className="text-right space-y-1">
                        {rsvp.attendance === 'yes' ? (
                          <>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              <span className="text-[10px] font-bold tracking-widest uppercase">Attending</span>
                            </div>
                            <p className="text-stone-400 font-serif italic text-lg">
                              Party of <strong className="text-stone-700 font-sans not-italic text-sm">{rsvp.guests_count}</strong>
                            </p>
                          </>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 text-stone-500 rounded-full border border-stone-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                            <span className="text-[10px] font-bold tracking-widest uppercase">Declined</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(rsvp.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-stone-300 hover:text-red-500 hover:bg-white hover:shadow-md hover:border hover:border-red-100 transition-all"
                        title="Delete Entry"
                      >
                        <Trash2 size={18} strokeWidth={1.5} />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
  bg?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  accent = 'text-stone-800',
  bg = 'bg-white'
}) => (
  <div className={`p-8 rounded-[4px] border border-stone-200 flex flex-col gap-4 hover:shadow-lg transition-all duration-300 group bg-white relative overflow-hidden`}>
    {/* Background accent */}
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-150 duration-500 ${accent.replace('text', 'bg')}`}></div>

    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${bg} ${accent}`}>
      {icon}
    </div>

    <div>
      <p className="font-serif text-5xl text-stone-800 mb-1">{value}</p>
      <p className="font-sans text-xs font-bold text-stone-400 tracking-widest uppercase">{label}</p>
    </div>
  </div>
);