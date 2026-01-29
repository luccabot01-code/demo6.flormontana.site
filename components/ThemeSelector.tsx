import React, { useState } from 'react';
import { themes, applyTheme, Theme } from '../utils/themes';
import { Palette, X, Search, Check } from 'lucide-react';
import { Button } from './ui/Button';

interface ThemeSelectorProps {
    currentThemeId: string;
    onSelect: (themeId: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentThemeId, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const handleSelect = (themeId: string) => {
        applyTheme(themeId);
        onSelect(themeId);
        setIsOpen(false);
    };

    const filteredThemes = themes.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="gap-2 border-stone-300 hover:border-rose-400 hover:text-rose-600"
            >
                <Palette size={18} />
                <span className="hidden sm:inline">Choose Theme</span>
                <div
                    className="w-4 h-4 rounded-full border border-stone-200 shadow-sm ml-1"
                    style={{ backgroundColor: themes.find(t => t.id === currentThemeId)?.color }}
                />
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden relative border border-white/50">

                        {/* Header */}
                        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                            <div>
                                <h3 className="font-serif text-2xl text-stone-800">Select a Theme</h3>
                                <p className="text-stone-500 text-sm">Choose a color palette for your wedding page.</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-stone-200/50 rounded-full transition-colors text-stone-500"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-stone-100 bg-white">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    autoFocus
                                    placeholder="Search colors..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-rose-300 outline-none transition-all placeholder-stone-400 font-sans"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/30">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {filteredThemes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => handleSelect(theme.id)}
                                        className={`group relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 border hover:shadow-lg hover:-translate-y-1 ${currentThemeId === theme.id ? 'bg-white border-stone-900 shadow-md ring-1 ring-stone-900' : 'bg-white border-stone-100 hover:border-transparent'}`}
                                    >
                                        <div
                                            className="w-16 h-16 rounded-full shadow-inner ring-4 ring-stone-50 transition-transform group-hover:scale-110"
                                            style={{ backgroundColor: theme.color }}
                                        />
                                        <span className={`text-sm font-medium ${currentThemeId === theme.id ? 'text-stone-900' : 'text-stone-600'}`}>
                                            {theme.name}
                                        </span>
                                        {currentThemeId === theme.id && (
                                            <div className="absolute top-3 right-3 text-stone-900 bg-white rounded-full p-1 shadow-sm">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {filteredThemes.length === 0 && (
                                <div className="text-center py-12 text-stone-400">
                                    <p>No themes found matching "{search}"</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};
