import { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Tag, Eye } from 'lucide-react';
import { Product, ProductColor, CustomizationOptions } from '../types';

interface ProductVisualizerProps {
  product: Product;
  selectedColor: ProductColor;
  customization: CustomizationOptions;
}

export default function ProductVisualizer({
  product,
  selectedColor,
  customization
}: ProductVisualizerProps) {
  const [imgSrc, setImgSrc] = useState<string>(product.imageUrl || product.fallbackImageUrl || '');
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');

  useEffect(() => {
    setImgSrc(product.imageUrl || product.fallbackImageUrl || '');
    setViewMode('front');
  }, [product]);

  const hasBackPrint =
    customization.includeBackClubName ||
    Boolean(customization.playerName.trim()) ||
    Boolean(customization.playerNumber.trim());

  return (
    <div className="space-y-4">
      {/* Main Visual Stage */}
      <div className="relative rounded-3xl border border-neutral-200 bg-gradient-to-b from-neutral-50 to-white overflow-hidden shadow-sm">
        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs border border-neutral-200 text-[11px] font-bold text-neutral-800 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>{product.clubName} Edition</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/90 text-white text-[11px] font-semibold shadow-xs">
            <Tag className="w-3 h-3 text-purple-300" />
            <span>Art.-Nr. {product.sku}</span>
          </span>
        </div>

        {/* View Toggle */}
        <div className="absolute bottom-4 left-4 z-10 flex p-1 rounded-xl bg-white/95 backdrop-blur-xs border border-neutral-200 shadow-sm text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('front')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'front'
                ? 'bg-purple-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Produktansicht
          </button>
          <button
            type="button"
            onClick={() => setViewMode('back')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
              viewMode === 'back'
                ? 'bg-purple-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Flock-Vorschau</span>
          </button>
        </div>

        {/* Image or Flock Preview */}
        {viewMode === 'front' ? (
          <div className="aspect-[4/4.2] w-full flex items-center justify-center p-8 sm:p-12">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={product.name}
                onError={() => {
                  if (product.fallbackImageUrl && imgSrc !== product.fallbackImageUrl) {
                    setImgSrc(product.fallbackImageUrl);
                  } else {
                    setImgSrc('');
                  }
                }}
                className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-300 hover:scale-[1.02]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-56 h-64 rounded-3xl border-2 flex flex-col items-center justify-center p-6 text-center shadow-inner"
                style={{
                  backgroundColor: selectedColor.hex,
                  borderColor: selectedColor.borderHex,
                  color: selectedColor.textColor
                }}
              >
                <span className="text-xs font-bold uppercase tracking-widest opacity-75">
                  {product.brand}
                </span>
                <span className="text-lg font-black mt-2 leading-tight">{product.name}</span>
                <span className="text-xs mt-2 opacity-80">{selectedColor.name}</span>
              </div>
            )}

            {/* Active Crest / Initials Floating Chip */}
            {(customization.includeClubLogo || customization.initials.trim()) && (
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs border border-purple-200 rounded-xl px-3 py-2 shadow-sm text-[11px] space-y-0.5">
                {customization.includeClubLogo && (
                  <div className="font-bold text-purple-950 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-700" />
                    <span>Brustwappen: {product.clubAbbr}</span>
                  </div>
                )}
                {customization.initials.trim() && (
                  <div className="text-neutral-600 font-semibold">
                    Initialen (##): <span className="text-purple-800 font-black">{customization.initials.toUpperCase()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[4/4.2] w-full flex items-center justify-center p-8 sm:p-12">
            <div
              className="w-full max-w-xs aspect-[3/3.4] rounded-3xl border-2 shadow-xl flex flex-col items-center justify-between p-6 text-center transition-colors"
              style={{
                backgroundColor: selectedColor.hex,
                borderColor: selectedColor.borderHex,
                color: selectedColor.textColor
              }}
            >
              <div className="space-y-1 pt-2">
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                  Rückendruck-Simulation
                </div>
                {customization.includeBackClubName && (
                  <div className="text-base sm:text-lg font-black tracking-wide uppercase">
                    {product.clubName}
                  </div>
                )}
              </div>

              <div className="my-auto space-y-2">
                {customization.playerNumber.trim() ? (
                  <div className="text-6xl sm:text-7xl font-black tracking-tighter leading-none">
                    {customization.playerNumber}
                  </div>
                ) : (
                  <div className="text-sm font-medium opacity-60">Keine Rückennummer</div>
                )}

                {customization.playerName.trim() && (
                  <div className="text-base sm:text-lg font-extrabold tracking-widest uppercase">
                    {customization.playerName}
                  </div>
                )}
              </div>

              <div className="text-[11px] font-semibold opacity-80 pb-1">
                {hasBackPrint ? 'OEKO-TEX® Transferflock' : 'Ohne Rückendruck'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Color & Print Summary Strip */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center gap-2.5">
          <span
            className="w-6 h-6 rounded-full border shrink-0 shadow-2xs"
            style={{
              backgroundColor: selectedColor.hex,
              borderColor: selectedColor.borderHex
            }}
          />
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold text-neutral-400">Vereinsfarbe</div>
            <div className="font-bold text-neutral-900 truncate">{selectedColor.name}</div>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-400">Veredelung</div>
            <div className="font-bold text-purple-900">
              {customization.includeClubLogo ? 'Inkl. Vereinswappen' : 'Standard'}
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
        </div>
      </div>
    </div>
  );
}
