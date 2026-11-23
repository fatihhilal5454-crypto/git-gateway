import { useState } from 'react';
import { ShoppingBag, Shield, Edit2, Check, X, Sparkles } from 'lucide-react';
import { CLUB_INFO } from '../data/products';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  clubName: string;
  onUpdateClubName: (name: string) => void;
  onOpenAdmin: () => void;
  showAnnouncement?: boolean;
  announcementText?: string;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  clubName,
  onUpdateClubName,
  onOpenAdmin,
  showAnnouncement = true,
  announcementText = 'Bestellrunde für die Saison 2026/27 ist eröffnet'
}: NavbarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(clubName);

  const handleSaveName = () => {
    const trimmed = draftName.trim();
    if (trimmed) {
      onUpdateClubName(trimmed);
    } else {
      setDraftName(clubName);
    }
    setIsEditingName(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {showAnnouncement && announcementText && (
        <div className="bg-purple-950 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>{announcementText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Club Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src="/favicon.png"
              alt={clubName}
              className="w-full h-full object-contain p-0.5"
              onError={(e) => {
                e.currentTarget.src = CLUB_INFO.logoUrl;
              }}
            />
          </div>

          <div className="min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') {
                      setDraftName(clubName);
                      setIsEditingName(false);
                    }
                  }}
                  className="px-2 py-0.5 text-sm font-bold border border-purple-400 rounded-lg text-neutral-900 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                  title="Speichern"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(clubName);
                    setIsEditingName(false);
                  }}
                  className="p-1 text-neutral-500 hover:bg-neutral-100 rounded cursor-pointer"
                  title="Abbrechen"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold text-neutral-900 truncate">
                  {clubName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(clubName);
                    setIsEditingName(true);
                  }}
                  className="text-neutral-400 hover:text-purple-700 p-0.5 rounded transition-colors cursor-pointer"
                  title="Vereinsnamen anpassen"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
            <p className="text-[11px] text-neutral-500 truncate">
              Offizieller Vereins- &amp; Teamwear-Shop • {CLUB_INFO.partnerBrand}
            </p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="#collection-grid"
            className="hidden md:inline-flex text-xs font-semibold text-neutral-600 hover:text-purple-800 px-3 py-2 rounded-xl hover:bg-purple-50 transition-colors"
          >
            Kollektion
          </a>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 hover:border-purple-300 bg-white hover:bg-purple-50/60 text-neutral-700 hover:text-purple-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-purple-700" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Warenkorb</span>
            {cartCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-purple-950 text-[10px] font-black leading-none">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
