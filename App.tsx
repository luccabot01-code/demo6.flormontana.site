import React, { useState, useEffect } from 'react';
import { Setup } from './components/Setup';
import { LinkShare } from './components/LinkShare';
import { RsvpForm } from './components/RsvpForm';
import { Dashboard } from './components/Dashboard';
import { ViewState } from './types';
import Petals from './components/Petals';
import { CheckCircle2, EyeOff } from 'lucide-react';
import { Button } from './components/ui/Button';
import { getSupabase } from './services/supabase';
import { applyTheme } from './utils/themes';

const App: React.FC = () => {
  // Synchronous State Initialization
  const [view, setView] = (() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    let initialView: ViewState = 'setup';

    // 1. Dashboard
    if (path.startsWith('/dashboard/')) {
      const slug = path.split('/dashboard/')[1];
      if (slug) return useState<ViewState>('dashboard');
    }

    // 2. RSVP Specific
    if (path.endsWith('/rsvp')) {
      return useState<ViewState>('form');
    }

    // 3. Main Landing / Slug
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length === 1 && pathParts[0] !== 'assets' && pathParts[0] !== 'favicon.ico') {
      return useState<ViewState>('form');
    }

    // 4. Query Params
    if (params.get('dashboard')) return useState<ViewState>('dashboard');
    if (params.get('rsvp')) return useState<ViewState>('form');
    if (params.get('setup')) return useState<ViewState>('link');

    // 5. Default Root -> Redirect logic handles this, but for INIT we default to:
    // Actually, for the DEMO, if it's root '/', we want 'form' immediately too.
    if (path === '/' && !params.toString()) {
      return useState<ViewState>('form');
    }

    return useState<ViewState>('setup');
  })();

  const [coupleSlug, setCoupleSlug] = (() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    if (path.startsWith('/dashboard/') && path.split('/dashboard/')[1]) {
      return useState(decodeURIComponent(path.split('/dashboard/')[1]));
    }

    // RSVP path logic for initial state is complex, simplifying for demo:
    // If we detected 'form' view above from path parts, we should try to extract slug here.
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length === 1 && pathParts[0] !== 'assets') {
      return useState(decodeURIComponent(pathParts[0]));
    }
    if (path.endsWith('/rsvp')) {
      const parts = path.split('/');
      if (parts.length >= 3) return useState(decodeURIComponent(parts[parts.length - 2]));
    }

    if (params.get('dashboard')) return useState(params.get('dashboard') || '');
    if (params.get('rsvp')) return useState(params.get('rsvp') || '');
    if (params.get('setup')) return useState(params.get('setup') || '');

    // DEMO Root Fallback
    if (path === '/' && !params.toString()) {
      return useState('mary&john');
    }

    return useState('');
  })();

  const [coupleName, setCoupleName] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('name')) return decodeURIComponent(params.get('name')!);

    // Demo Root Fallback
    if (window.location.pathname === '/' && !params.toString()) return 'Mary & John';
    return '';
  });

  const [isLoadingName, setIsLoadingName] = useState(true);
  const [coverImage, setCoverImage] = useState<string | null>('/freepik__talk__37233.png');
  const [isPreview, setIsPreview] = useState(false);

  // Routing Effect - simplified to specific updates if needed or browser nav handling
  useEffect(() => {
    // We strictly use this for DEMO root redirect enforcement if needed,
    // but the state is already set. We just need to ensure URL matches state if it was '/'
    if (window.location.pathname === '/') {
      updateHistory('/mary&john');
    }
  }, []);

  // History Helper
  const updateHistory = (url: string) => {
    try {
      window.history.pushState({}, '', url);
    } catch (e) {
      // Ignore sandbox history errors
    }
  };

  const handleSetupSuccess = (slug: string, name: string) => {
    setCoupleSlug(slug);
    setCoupleName(name);
    // Use query params for immediate feedback in sandbox, 
    // but LinkShare will show the clean URLs
    const newUrl = `/?setup=${slug}&name=${encodeURIComponent(name)}`;
    updateHistory(newUrl);
    setView('link');
  };

  const handleDashboardNav = () => {
    const newUrl = `/dashboard/${coupleSlug}`;
    updateHistory(newUrl);
    setView('dashboard');
  };

  const handleNewEvent = () => {
    updateHistory('/');
    setCoupleSlug('');
    setCoupleName('');
    setView('setup');
  };

  const handleRsvpSuccess = () => {
    setView('success');
  };

  const handlePreview = () => {
    setIsPreview(true);
    setView('form');
  };

  const handleClosePreview = () => {
    setIsPreview(false);
    // If we have a slug, we assume we want to go back to the dashboard/hub
    // The 'link' view is part of the setup flow which customers don't see
    setView('dashboard');
  };

  // Helper to format name from slug if real name isn't set yet
  const getDisplayName = () => {
    if (coupleName) return coupleName;
    if (!coupleSlug) return 'Our Wedding';
    return coupleSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Fetch Theme
  useEffect(() => {
    const fetchThemeAndName = async () => {
      if (!coupleSlug) return;
      const supabase = getSupabase();
      try {
        const { data, error } = await supabase
          .from('wedding_template_couples')
          .select('theme_id, couple_name, cover_image_url')
          .eq('slug', coupleSlug)
          .single();

        if (data) {
          if (data.theme_id) applyTheme(data.theme_id);
          if (data.couple_name) setCoupleName(data.couple_name);
          // DEMO: Keep hardcoded image
          // if (data.cover_image_url) setCoverImage(data.cover_image_url);
        } else {
          // Default or fallback
          applyTheme('rose');
        }
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setIsLoadingName(false);
      }
    };
    if (coupleSlug) {
      setIsLoadingName(true);
      fetchThemeAndName();
    } else {
      setIsLoadingName(false);
    }
  }, [coupleSlug]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 relative">
      {/* Dynamic Background - Now using theme variables */}
      <div
        className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] via-stone-100 to-stone-200"
        style={{
          backgroundImage: `radial-gradient(ellipse at top, var(--color-primary-50), #f5f5f4, #e7e5e4)`
        }}
      />

      {/* Texture Layer */}
      <div
        className="fixed inset-0 z-0 opacity-100 pointer-events-none"
        style={{
          backgroundImage: `url(/bg-texture.png)`,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px'
        }}
      />

      {/* Loading Overlay - Prevents FOUC (Flash of Unstyled Color) */}
      {isLoadingName && coupleSlug && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-opacity duration-500">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-stone-100 rounded-full"></div>
            <div
              className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--color-primary-500) transparent transparent transparent' }}
            ></div>
          </div>
          <p className="mt-6 font-serif italic text-stone-400 animate-pulse tracking-widest uppercase text-xs">
            Honoring the moment...
          </p>
        </div>
      )}

      <Petals />

      {/* Main Content Area */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">

        {/* Header - Only show for Guest Views */}
        {(view === 'form' || view === 'success') && (
          <header className="mb-2 text-center animate-fade-in select-none pt-12">
            <h1 className="font-slight text-7xl md:text-9xl mb-6 drop-shadow-sm text-rose-600 pb-2 leading-relaxed tracking-wider">
              {isLoadingName ? (
                <span className="opacity-0">Loading</span>
              ) : (
                getDisplayName()
              )}
            </h1>
            <p className="font-serif italic text-stone-500 tracking-[0.2em] uppercase text-sm md:text-base">
              Join us on our special day
            </p>
          </header>
        )}

        <div className="w-full max-w-6xl">
          {view === 'setup' && <Setup onSuccess={handleSetupSuccess} />}

          {view === 'link' && (
            <LinkShare
              slug={coupleSlug}
              coupleName={getDisplayName()}
              onNewForm={handleNewEvent}
              onDashboard={handleDashboardNav}
              onPreview={handlePreview}
            />
          )}

          {view === 'form' && (
            <>
              {isPreview && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                  <Button
                    variant="secondary"
                    onClick={handleClosePreview}
                    className="shadow-2xl border-2 border-white/50 backdrop-blur-md bg-stone-900/90 text-sm py-2 px-4"
                  >
                    <EyeOff size={16} strokeWidth={2} /> Close Preview
                  </Button>
                </div>
              )}
              <RsvpForm
                slug={coupleSlug}
                coverImage={coverImage}
                onSuccess={handleRsvpSuccess}
              />
            </>
          )}

          {view === 'success' && (
            <div className="text-center animate-slide-up bg-white/90 backdrop-blur-xl p-12 rounded-[2rem] shadow-2xl border border-white/60 max-w-md mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-300 via-rose-500 to-rose-300"></div>
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-3xl mb-4 text-stone-800">RSVP Received</h2>
              <p className="text-stone-600 mb-10 font-sans leading-relaxed text-lg font-light">
                Thank you for your response. Your details have been saved.
              </p>

              {isPreview ? (
                <Button variant="outline" onClick={handleClosePreview}>
                  <EyeOff size={16} /> Back to Preview
                </Button>
              ) : (
                <p className="font-script text-4xl text-rose-500">See you there!</p>
              )}
            </div>
          )}

          {view === 'dashboard' && (
            <Dashboard
              slug={coupleSlug}
              coverImage={coverImage}
              onPreview={handlePreview}
              onCoverUpdate={setCoverImage}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-stone-400 text-xs font-bold tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity">
        <p></p>
      </footer>
    </div>
  );
};

export default App;