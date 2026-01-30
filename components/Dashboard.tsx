import React, { useEffect, useState } from 'react';
import { getSupabase } from '../services/supabase';
import { RsvpResponse, DashboardStats } from '../types';
import { Button } from './ui/Button';
import { RefreshCw, Download, Trash2, Users, CheckCircle2, XCircle, Mail, MessageSquare, Phone, Copy, Link as LinkIcon, QrCode as QrIcon, Eye, Palette, Camera, ArrowLeft } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Modal } from './ui/Modal';
import { HamburgerMenu } from './ui/HamburgerMenu';
import { applyTheme, themes } from '../utils/themes';

interface DashboardProps {
  slug: string;
  coverImage: string | null;
  onPreview: () => void;
  onCoverUpdate: (url: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ slug, coverImage, onPreview, onCoverUpdate }) => {
  // DEMO DATA: Hardcoded responses
  const demoResponses: RsvpResponse[] = [
    { id: '1', host_id: 'demo', guest_name: 'Sarah & Mike Thompson', guest_email: 'sarah.thompson88@gmail.com', guest_phone: '+1 (555) 123-4567', attendance: 'yes', guests_count: 2, message: "So excited to celebrate with you both! Can't wait!", created_at: new Date().toISOString() },
    { id: '2', host_id: 'demo', guest_name: 'Aunt Linda', guest_email: 'linda.johnson1960@aol.com', guest_phone: '+1 (555) 876-5432', attendance: 'yes', guests_count: 1, message: "So happy for my favorite nephew! Love you both.", created_at: new Date().toISOString() },
    { id: '3', host_id: 'demo', guest_name: 'The Miller Family', guest_email: 'sam.miller@comcast.net', guest_phone: '', attendance: 'yes', guests_count: 4, message: "The whole gang is coming! Kids are excited.", created_at: new Date().toISOString() },
    { id: '4', host_id: 'demo', guest_name: 'Dr. Alan Grant', guest_email: 'agrant@university.edu', guest_phone: '', attendance: 'no', guests_count: 0, message: "Regretfully decline due to prior commitments.", created_at: new Date().toISOString() },
    { id: '5', host_id: 'demo', guest_name: 'Jessica Chen', guest_email: 'jess.chen@designstudio.com', guest_phone: '+1 (555) 987-6543', attendance: 'yes', guests_count: 1, message: "Wouldn't miss it for the world. See you there!", created_at: new Date().toISOString() },
    { id: '6', host_id: 'demo', guest_name: 'Marcus & Tom', guest_email: 'marcus.t@gmail.com', guest_phone: '+1 (555) 654-3210', attendance: 'yes', guests_count: 2, message: "Count us in! Can't wait to see the venue.", created_at: new Date().toISOString() }
  ];

  const [responses, setResponses] = useState<RsvpResponse[]>(demoResponses);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total: 6,
    accepted: 5,
    declined: 1,
    totalGuests: 10
  });
  const [copied, setCopied] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
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

  // Texture for inner cards (simulating 50% opacity with overlay)
  const subtleTexture = {
    backgroundImage: 'linear-gradient(rgba(255, 253, 249, 0.5), rgba(255, 253, 249, 0.5)), url(/bg-texture.png)',
    backgroundRepeat: 'repeat',
    backgroundSize: '300px',
    backgroundColor: '#fffdf9'
  };

  // Link Construction
  // Link Construction - HARDCODED FOR DEMO
  const cleanLink = `https://demo6.flormontana.site/mary&john`;

  const handleThemeUpdate = async (themeId: string) => {
    // 1. Instant local update
    applyTheme(themeId);
    setShowThemePicker(false);

    // 2. Persist to DB (DISABLED FOR DEMO)
    // const supabase = getSupabase();
    // ...
  };

  const fetchResponses = async () => {
    // DISABLED FOR DEMO - Using static data
    setLoading(false);
    if (displayName === '') setDisplayName('Mary & John'); // Hardcode name if missing
  };

  const handleDelete = async (id: string) => {
    // DISABLED FOR DEMO
    alert("This is a demo. Records cannot be deleted.");
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

  /* Upload Logic Removed for Demo */
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Disabled
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
        <div className="relative rounded-[4px] border border-stone-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden" style={subtleTexture}>
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

          {/* Mobile Hamburger Menu - Absolute positioned relative to Header */}
          <HamburgerMenu
            onUploadClick={() => alert('Demo Mode: Upload disabled')}
            onPreviewClick={onPreview}
            onRefreshClick={fetchResponses}
            onExportClick={exportCSV}
            onDownloadQR={handleDownloadQR}
            onThemeClick={() => setShowThemePicker(true)}
            qrLink={cleanLink}
            uploading={false}
            loading={loading}
          />

          {/* Back to Canva Button (Left) */}
          <a
            href="https://flormontana.my.canva.site/save-the-date/page-2"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex absolute top-6 left-6 z-20"
          >
            <Button
              className="text-white font-serif italic px-5 h-10 border-none flex items-center justify-center transition-all hover:opacity-90 active:scale-95 text-sm"
              style={{
                backgroundColor: 'var(--color-primary-500)',
                boxShadow: '0 4px 12px -2px var(--color-primary-100)'
              }}
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Canva
            </Button>
          </a>

          {/* Floating Desktop Actions Panel */}
          <div className="hidden md:flex absolute top-6 right-6 z-20 items-center gap-2 p-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:bg-white/80 transition-all duration-300">


            <Button
              onClick={onPreview}
              className="text-white font-serif italic px-5 h-10 border-none flex items-center justify-center transition-all hover:opacity-90 active:scale-95 text-sm"
              style={{
                backgroundColor: 'var(--color-primary-500)',
                boxShadow: '0 4px 12px -2px var(--color-primary-100)'
              }}
            >
              <Eye size={14} className="mr-2" /> Preview
            </Button>

            <div className="h-6 w-[1px] bg-white/40 mx-1"></div>

            <Button
              onClick={fetchResponses}
              className="text-white px-3 h-10 border-none flex items-center justify-center transition-all hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: 'var(--color-primary-500)',
                boxShadow: '0 4px 12px -2px var(--color-primary-100)'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>

            <Button
              onClick={exportCSV}
              className="text-white font-serif tracking-wide px-5 h-10 border-none flex items-center justify-center transition-all hover:opacity-90 active:scale-95 text-sm"
              style={{
                backgroundColor: 'var(--color-primary-500)',
                boxShadow: '0 4px 12px -2px var(--color-primary-100)'
              }}
            >
              <Download size={14} className="mr-2" /> .CSV
            </Button>
          </div>
          <div className="p-6 md:p-10 relative">


            {/* Mobile Decorative corner (optional, keeping it clean) */}
            <div className="absolute top-0 right-0 p-4 opacity-10 md:hidden">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor" className="text-rose-900">
                <path d="M50 0C50 27.614 27.614 50 0 50C27.614 50 50 72.386 50 100C50 72.386 72.386 50 100 50C72.386 50 50 27.614 50 0Z" />
              </svg>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 w-full">
              <div className="text-center md:text-left min-w-0 max-w-full">
                <h1
                  className="font-script text-5xl md:text-7xl tracking-normal capitalize break-words leading-tight"
                  style={{ color: 'var(--color-primary-600)' }}
                >
                  {(loading && !displayName) ? (
                    <span className="animate-pulse text-stone-200">Loading...</span>
                  ) : (
                    displayName || prettyName
                  )}
                </h1>
              </div>


            </div>
          </div>

          {/* Share & Invite Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Link & Instructions */}
            <div className="lg:col-span-2 rounded-[4px] border border-stone-200 p-8 shadow-sm flex flex-col justify-between" style={subtleTexture}>
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                    <LinkIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-stone-800">Share Your Link</h3>
                    <p className="text-stone-600 text-xs uppercase tracking-widest font-bold">Your Guests' Gateway</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <div className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-600 text-sm font-mono truncate flex items-center">
                    <span className="truncate">{`flormontana@etsy/${slug.replace(/\b\w/g, c => c.toUpperCase())}`}</span>
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
            <div className="hidden lg:flex rounded-[4px] border border-stone-200 p-8 shadow-sm flex-col items-center justify-center text-center" style={subtleTexture}>
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
        <div className="rounded-[4px] border border-stone-200 shadow-sm relative" style={subtleTexture}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-200 to-transparent opacity-50"></div>

          <div className="p-8 md:p-10 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-rose-300">
                <Users size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="font-serif text-3xl text-stone-800">Guest List</h2>
                <p className="font-sans text-xs font-bold text-stone-600 tracking-widest uppercase mt-1">Managed Responses</p>
              </div>
            </div>
            <span className="font-serif italic text-stone-600 text-lg border-b border-stone-200 pb-1 px-2">{responses.length} entries</span>
          </div>

          {loading ? (
            <div className="p-32 text-center flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-[3px] border-stone-100 border-t-rose-400 rounded-full animate-spin"></div>
              <p className="font-serif italic text-stone-600">Retrieving your guest list...</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="p-32 text-center bg-stone-50/30">
              <p className="font-serif text-2xl text-stone-500 italic mb-2">No responses yet</p>
              <p className="font-sans text-xs text-stone-600 tracking-widest uppercase">Share your link to get started</p>
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
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-stone-500 tracking-wider uppercase font-sans">
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
                            <p className="text-stone-600 font-serif italic text-lg">
                              Party of <strong className="text-stone-800 font-sans not-italic text-sm">{rsvp.guests_count}</strong>
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
  <div
    className={`p-8 rounded-[4px] border border-stone-200 flex flex-col gap-4 hover:shadow-lg transition-all duration-300 group relative overflow-hidden`}
    style={{
      backgroundImage: 'linear-gradient(rgba(255, 253, 249, 0.5), rgba(255, 253, 249, 0.5)), url(/bg-texture.png)',
      backgroundRepeat: 'repeat',
      backgroundSize: '300px',
      backgroundColor: '#fffdf9'
    }}
  >
    {/* Background accent */}
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-150 duration-500 ${accent.replace('text', 'bg')}`}></div>

    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${bg} ${accent}`}>
      {icon}
    </div>

    <div>
      <p className="font-serif text-5xl text-stone-800 mb-1">{value}</p>
      <p className="font-sans text-xs font-bold text-stone-600 tracking-widest uppercase">{label}</p>
    </div>
  </div>
);