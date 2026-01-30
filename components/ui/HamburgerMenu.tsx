import React, { useState } from 'react';
import { Camera, Eye, RefreshCw, Download, X, QrCode as QrIcon, Palette } from 'lucide-react';
import QRCode from 'react-qr-code';

interface HamburgerMenuProps {
    onUploadClick: () => void;
    onPreviewClick: () => void;
    onRefreshClick: () => void;
    onExportClick: () => void;
    onDownloadQR: () => void;
    qrLink: string;
    uploading: boolean;
    loading: boolean;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
    onUploadClick,
    onPreviewClick,
    onRefreshClick,
    onExportClick,
    onDownloadQR,
    qrLink,
    uploading,
    loading
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`absolute z-50 w-12 h-12 flex flex-col items-center justify-center gap-1.5 bg-[var(--color-primary-500)] rounded-xl shadow-lg md:hidden transition-all duration-300 ${isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
                style={{ top: '16px', right: '16px' }}
                aria-label="Menu"
            >
                <span className="block w-6 h-0.5 bg-white rounded-full" />
                <span className="block w-6 h-0.5 bg-white rounded-full" />
                <span className="block w-6 h-0.5 bg-white rounded-full" />
            </button>

            {/* Backdrop - Tapping here also closes the menu */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Slide-in Menu with Swipe-to-Close */}
            <div
                className={`fixed top-0 right-0 z-40 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                onTouchStart={(e) => {
                    const touch = e.touches[0];
                    const startX = touch.clientX;
                    const handleTouchMove = (moveEvent: TouchEvent) => {
                        const currentX = moveEvent.touches[0].clientX;
                        if (currentX - startX > 50) { // Swipe right to close
                            setIsOpen(false);
                            document.removeEventListener('touchmove', handleTouchMove as any);
                        }
                    };
                    document.addEventListener('touchmove', handleTouchMove as any, { passive: true });
                    document.addEventListener('touchend', () => {
                        document.removeEventListener('touchmove', handleTouchMove as any);
                    }, { once: true });
                }}
            >
                {/* Menu Header (Simplified, no X button) */}
                <div className="flex items-center justify-start p-8 border-b border-stone-100">
                    <span className="font-serif text-2xl text-stone-800 tracking-wide">Actions</span>
                </div>

                {/* Menu Items */}
                <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-80px)]">
                    <button
                        onClick={() => handleAction(onUploadClick)}
                        disabled={uploading}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium disabled:opacity-50"
                        style={{
                            backgroundColor: 'var(--color-primary-50)',
                            color: 'var(--color-primary-600)'
                        }}
                    >
                        {uploading ? (
                            <RefreshCw size={18} className="animate-spin" />
                        ) : (
                            <Camera size={18} />
                        )}
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                    </button>

                    <button
                        onClick={() => handleAction(onPreviewClick)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
                        style={{
                            backgroundColor: 'var(--color-primary-50)',
                            color: 'var(--color-primary-600)'
                        }}
                    >
                        <Eye size={18} />
                        Preview RSVP
                    </button>





                    <button
                        onClick={() => handleAction(onRefreshClick)}
                        disabled={loading}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium disabled:opacity-50"
                        style={{
                            backgroundColor: 'var(--color-primary-50)',
                            color: 'var(--color-primary-600)'
                        }}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Refresh Data
                    </button>

                    <button
                        onClick={() => handleAction(onExportClick)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium"
                        style={{
                            backgroundColor: 'var(--color-primary-50)',
                            color: 'var(--color-primary-600)'
                        }}
                    >
                        <Download size={18} />
                        Export CSV
                    </button>

                    {/* QR Code Section */}
                    <div className="mt-8 pt-6 border-t border-stone-100">
                        <div className="flex items-center gap-2 mb-4 text-stone-800 px-2">
                            <QrIcon size={18} className="text-[var(--color-primary-500)]" />
                            <h4 className="font-serif text-base">Event QR Code</h4>
                        </div>

                        <div className="bg-stone-50 rounded-xl p-4 flex flex-col items-center gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <QRCode
                                    id="qr-code-svg-mobile"
                                    size={120}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={qrLink}
                                    level='H'
                                />
                            </div>
                            <button
                                onClick={() => handleAction(onDownloadQR)}
                                className="w-full py-2 px-4 border border-stone-200 rounded-lg text-xs font-semibold text-stone-600 bg-white hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={14} /> Download SVG
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menu Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-100 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                    <p className="text-xs text-stone-400 text-center flex items-center justify-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-stone-300 animate-pulse"></span>
                        Swipe right or tap outside to close
                    </p>
                </div>
            </div>
        </>
    );
};
