import React, { useState } from 'react';
import { Camera, Eye, RefreshCw, Download, X, QrCode as QrIcon } from 'lucide-react';
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
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-rose-500 rounded-lg shadow-lg md:hidden"
                aria-label="Menu"
            >
                <span
                    className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ease-out ${isOpen ? 'rotate-45 translate-y-2' : ''
                        }`}
                />
                <span
                    className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ease-out ${isOpen ? 'opacity-0 scale-0' : ''
                        }`}
                />
                <span
                    className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ease-out ${isOpen ? '-rotate-45 -translate-y-2' : ''
                        }`}
                />
            </button>

            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Slide-in Menu */}
            <div
                className={`fixed top-0 right-0 z-40 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <span className="font-serif text-lg text-stone-800">Actions</span>
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
                            <QrIcon size={18} className="text-rose-500" />
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
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-stone-100 bg-white">
                    <p className="text-xs text-stone-400 text-center">
                        Swipe right or tap outside to close
                    </p>
                </div>
            </div>
        </>
    );
};
