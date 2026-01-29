import React, { useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Copy, Download, LayoutDashboard, Plus, QrCode as QrIcon, Link as LinkIcon, Palette, Eye } from 'lucide-react';
import QRCode from 'react-qr-code';

interface LinkShareProps {
  slug: string;
  coupleName: string;
  onNewForm: () => void;
  onDashboard: () => void;
  onPreview: () => void;
}

export const LinkShare: React.FC<LinkShareProps> = ({ slug, coupleName, onNewForm, onDashboard, onPreview }) => {
  const [copied, setCopied] = React.useState(false);

  // Construct the clean URL (assuming server rewrite)
  // For sandbox fallback, we can also use query params, but user requested clean structure
  const cleanLink = `${window.location.origin}/${slug}`;

  // No need for useEffect effect for QR code anymore since we use a React component

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById("qr-code-svg");
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

  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up pb-12">
      <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden ring-1 ring-stone-100">

        {/* Header */}
        <div className="bg-gradient-to-br from-rose-900 via-rose-800 to-rose-900 text-white p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <h2 className="font-serif text-3xl md:text-4xl mb-3 relative z-10">Welcome, {coupleName}</h2>
          <p className="opacity-90 font-sans font-light relative z-10 text-rose-100">Your wedding page is live.</p>
        </div>

        <div className="p-8 md:p-12 space-y-10">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Link Logic */}
            <div className="space-y-6">
              <div className="bg-stone-50/80 p-6 rounded-2xl border border-stone-200 shadow-inner h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                    <LinkIcon size={20} />
                  </div>
                  <h3 className="font-serif text-xl text-stone-800">Your RSVP Link</h3>
                </div>

                <p className="text-sm text-stone-500 mb-4">
                  Share this link with your guests:
                </p>

                <div className="flex flex-col gap-3">
                  <div className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-600 text-sm font-mono truncate flex items-center justify-between">
                    <span className="truncate">{cleanLink}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCopy} className="py-2 text-sm flex-1 text-rose-600 border-rose-200 hover:bg-rose-50">
                      {copied ? 'Copied!' : <><Copy size={16} strokeWidth={1.5} /> Copy</>}
                    </Button>
                    <Button variant="outline" onClick={onPreview} className="py-2 text-sm px-4 text-rose-600 border-rose-200 hover:bg-rose-50" title="Preview Form">
                      <Eye size={16} strokeWidth={1.5} /> Preview
                    </Button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-stone-200/60">
                  <div className="flex items-start gap-3">
                    <Palette size={20} className="text-purple-500 mt-1" />
                    <div>
                      <h4 className="font-bold text-stone-700 text-sm mb-1">Server Note</h4>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        To use these clean URLs ({`.../rsvp/${slug}`}), ensure your host redirects all 404s to index.html (SPA Rewrite).<br />
                        <span className="opacity-70">If using simple hosting, you can still use: <code>?rsvp={slug}</code></span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: QR Code */}
            <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center justify-center text-center h-full">
              <div className="p-4 bg-white rounded-2xl shadow-lg border border-stone-50 ring-4 ring-stone-50 mb-6">
                <div style={{ height: "auto", margin: "0 auto", maxWidth: 200, width: "100%" }}>
                  <QRCode
                    id="qr-code-svg"
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={cleanLink}
                    level='H'
                    viewBox={`0 0 256 256`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-stone-800 mb-2">
                <QrIcon size={20} className="text-rose-600" strokeWidth={1.5} />
                <h3 className="font-serif text-xl">QR Code</h3>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed max-w-xs mb-4">
                Points to your personalized RSVP page.
              </p>
              <Button variant="outline" onClick={handleDownload} className="text-sm border-stone-300 w-full md:w-auto">
                <Download size={16} strokeWidth={1.5} /> Download SVG
              </Button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="border-t border-stone-100 pt-8 flex justify-center">
            <Button onClick={onDashboard} className="px-8">
              <LayoutDashboard size={18} strokeWidth={1.5} /> View Dashboard
            </Button>
          </div>

          <div className="text-center text-xs text-stone-400 font-medium tracking-wide">
            ID: {slug}
          </div>
        </div>
      </div>
    </div>
  );
};