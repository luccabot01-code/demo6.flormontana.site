import React, { useState } from 'react';
import { getSupabase } from '../services/supabase';
import { Button } from './ui/Button';
import { Heart, Sparkles, Gem } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';

interface SetupProps {
  onSuccess: (slug: string, name: string) => void;
}

export const Setup: React.FC<SetupProps> = ({ onSuccess }) => {
  const [names, setNames] = useState('');
  const [themeId, setThemeId] = useState('charcoal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+&\s+/g, '&') // Replace ' & ' with '&'
      .replace(/\s+/g, '-')     // Replace other spaces with hyphens
      .replace(/[^a-z0-9&-\u00C0-\u00FF]+/g, '') // Remove invalid chars, preserve & and foreign chars if needed (basic)
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const slug = createSlug(names);

    if (slug.length < 3) {
      setError('Please enter a valid couple name (e.g. Mary & John)');
      setLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();

      // Check for existing couple with this slug
      let { data: existingHost, error: checkError } = await supabase
        .from('wedding_template_couples')
        .select('id')
        .eq('slug', slug)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingHost) {
        setError('This couple name is already taken. Please try a different name.');
        setLoading(false);
        return;
      }

      // Create new host
      const { error: insertError } = await supabase
        .from('wedding_template_couples')
        .insert([{
          slug: slug,
          couple_name: names,
          theme_id: themeId
        }])
        .single();
      if (insertError) throw insertError;

      onSuccess(slug, names);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative animate-fade-in">
      <div className="absolute -top-16 -left-16 text-rose-200/50 animate-pulse-slow">
        <Sparkles size={120} strokeWidth={0.5} />
      </div>

      <div className="bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] shadow-2xl border border-white/60 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-200 via-rose-500 to-rose-200" />

        <div className="mb-8 flex justify-center relative">
          <div className="absolute inset-0 bg-rose-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="w-24 h-24 bg-gradient-to-tr from-rose-50 to-white rounded-full flex items-center justify-center shadow-lg border border-rose-100 relative z-10">
            <Heart className="text-rose-500 fill-rose-500 animate-float" size={40} strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl text-stone-800 mb-4 tracking-tight">
          Wedding RSVP
        </h1>
        <p className="font-sans text-stone-500 mb-8 leading-relaxed font-light">
          Let's create your legendary invitation page.<br />Enter your names to begin.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left group">
            <label htmlFor="names" className="block text-xs font-bold text-stone-400 mb-2 uppercase tracking-widest pl-1">Couple Names</label>
            <div className="relative">
              <input
                type="text"
                id="names"
                required
                value={names}
                onChange={(e) => setNames(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-stone-50/50 border border-stone-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100/50 outline-none transition-all font-serif text-2xl text-stone-700 placeholder-stone-300"
                placeholder="Mary & John"
              />
              <Gem className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-rose-500 transition-colors" size={20} strokeWidth={1.5} />
            </div>
            {names && (
              <p className="text-xs text-stone-400 mt-2 pl-1 font-mono opacity-60">
                your-site.com/{createSlug(names)}
              </p>
            )}
          </div>

          <div className="flex justify-center pb-2">
            <ThemeSelector currentThemeId={themeId} onSelect={setThemeId} />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              {error}
            </div>
          )}

          <Button type="submit" className="w-full text-lg shadow-rose-200/50 shadow-xl hover:shadow-rose-300/50 hover:-translate-y-1" isLoading={loading}>
            Create Page
          </Button>
        </form>
      </div>
    </div>
  );
};