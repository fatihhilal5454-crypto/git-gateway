import { useState } from 'react';
import { 
  Check, 
  Ruler, 
  ChevronDown, 
  Sparkles, 
  ShoppingBag, 
  Clock, 
  ShieldCheck, 
  Truck, 
  Info,
  Layers,
  Heart
} from 'lucide-react';
import { Product, ProductColor, CustomizationOptions } from '../types';

interface ProductInfoProps {
  product: Product;
  selectedColor: ProductColor;
  onSelectColor: (color: ProductColor) => void;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  customization: CustomizationOptions;
  onChangeCustomization: (custom: CustomizationOptions) => void;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
  onAddToCart: () => void;
  onOpenSizeGuide: () => void;
}

export default function ProductInfo({
  product,
  selectedColor,
  onSelectColor,
  selectedSize,
  onSelectSize,
  customization,
  onChangeCustomization,
  quantity,
  onChangeQuantity,
  onAddToCart,
  onOpenSizeGuide
}: ProductInfoProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>('desc');
  const [addedToast, setAddedToast] = useState(false);

  const kidsSizesList = product.sizes.some(s => s.isKids)
    ? (product.sizes.some(s => s.size === '116')
        ? product.sizes.filter(s => s.isKids)
        : [
            {
              size: '116',
              available: true,
              stockNote: 'Auf Lager (Kinder)',
              price: product.kidsPrice ?? product.sizes.find(s => s.isKids)?.price ?? product.price,
              isKids: true
            },
            ...product.sizes.filter(s => s.isKids)
          ])
    : [];

  // Pricing calculations
  const selectedSizeObj =
    product.sizes.find(s => s.size === selectedSize) ||
    kidsSizesList.find(s => s.size === selectedSize);
  const activeBasePrice = selectedSizeObj?.price ?? (
    selectedSizeObj?.isKids ? (product.kidsPrice ?? product.price) : (product.adultPrice ?? product.price)
  );

  const playerNameFee = customization.playerName.trim() ? 4.50 : 0;
  const playerNumberFee = customization.playerNumber.trim() ? 3.50 : 0;
  const isInitialsFree = Boolean(product.initialsInclusive || product.id === 'asv-erima-sixwings-tee-purple');
  const initialsFee = customization.initials.trim() ? (isInitialsFree ? 0 : 2.50) : 0;
  const totalCustomizationFee = playerNameFee + playerNumberFee + initialsFee;
  const unitTotal = activeBasePrice + totalCustomizationFee;
  const lineTotal = unitTotal * quantity;

  const handleAddWithFeedback = () => {
    onAddToCart();
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div id="product-info-section" className="flex flex-col space-y-6">
      {/* Brand & Category Breadcrumb Bar */}
      <div>
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mb-1.5">
          <span className="text-neutral-900 font-semibold">{product.brand}</span>
          <span>/</span>
          <span>{product.clubName}</span>
          <span>/</span>
          <span>{product.category}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-tight">
          {product.name}
        </h1>

        {/* Tagline & SKU */}
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          {product.tagline}
        </p>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
          <span>Art.-Nr.: {product.sku}</span>
          <span>•</span>
          <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            Offizielle Vereinsedition
          </span>
        </div>
      </div>

      {/* Pricing Header */}
      <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black text-neutral-900">
              {unitTotal.toFixed(2)} €
            </span>
            {product.originalPrice && (
              <span className="text-sm text-neutral-400 line-through">
                {product.originalPrice.toFixed(2)} €
              </span>
            )}
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
              -20% Vereinsrabatt
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {product.kidsPrice && product.adultPrice && product.kidsPrice !== product.adultPrice ? (
              <span>Kinder ({product.kidsPrice.toFixed(2)} €) • Erwachsene ({product.adultPrice.toFixed(2)} €) • inkl. MwSt.</span>
            ) : (
              <span>inkl. 19% MwSt. • zzgl. evtl. Flockoptionen</span>
            )}
          </p>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Lieferbar
          </span>
          <p className="text-[11px] text-neutral-500">
            5–8 Werktage mit Flock
          </p>
        </div>
      </div>

      {/* Color Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-900">
            Farbe: <strong className="text-neutral-700 font-medium">{selectedColor.name}</strong>
          </span>
          <span className="text-[11px] text-purple-700 font-medium">Vereinsfarben: Lila & Weiß</span>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {product.colors.map((color) => {
            const isSelected = color.id === selectedColor.id;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => onSelectColor(color)}
                className={`group relative flex items-center justify-center p-1 rounded-xl transition-all ${
                  isSelected
                    ? 'ring-2 ring-purple-900 ring-offset-2 scale-105'
                    : 'hover:scale-105 opacity-90 hover:opacity-100'
                }`}
                title={color.name}
              >
                <div
                  className="w-9 h-9 rounded-lg border shadow-xs flex items-center justify-center transition-transform"
                  style={{
                    backgroundColor: color.hex,
                    borderColor: color.borderHex
                  }}
                >
                  {isSelected && (
                    <Check
                      className="w-4 h-4"
                      style={{ color: color.textColor }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selector & Size Guide */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-neutral-900">
            Größe: <strong className="text-neutral-700 font-medium">{selectedSize || 'Bitte wählen'}</strong>
            {selectedSizeObj?.isKids ? (
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold">
                Kindergröße ({product.kidsPrice?.toFixed(2)} €)
              </span>
            ) : selectedSizeObj && product.adultPrice ? (
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 font-bold">
                Erwachsenengröße ({product.adultPrice?.toFixed(2)} €)
              </span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={onOpenSizeGuide}
            className="flex items-center gap-1 text-purple-700 hover:text-purple-900 font-medium text-xs hover:underline transition-colors cursor-pointer"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Größentabelle & Beratung</span>
          </button>
        </div>

        {kidsSizesList.length > 0 ? (
          <div className="space-y-3 bg-white p-3 rounded-xl border border-neutral-200">
            {/* Kindergrößen (116 - 164) */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>Kindergrößen (116 – 164):</span>
                </span>
                <span className="text-purple-800 font-black text-xs">
                  {product.kidsPrice?.toFixed(2)} €
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {kidsSizesList.map((s) => {
                  const isSelected = s.size === selectedSize;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      onClick={() => onSelectSize(s.size)}
                      className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'border-purple-900 bg-purple-900 text-white shadow-xs ring-2 ring-purple-600/30'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:border-purple-300 hover:bg-white'
                      }`}
                    >
                      <span className="text-xs">{s.size}</span>
                      <span className={`text-[9px] mt-0.5 ${
                        isSelected ? 'text-purple-200' : 'text-neutral-500'
                      }`}>
                        Kinder
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Erwachsenengrößen (XS - 3XL) */}
            <div className="pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neutral-800"></span>
                  <span>Erwachsenengrößen (XS – 3XL):</span>
                </span>
                <span className="text-neutral-900 font-black text-xs">
                  {product.adultPrice?.toFixed(2)} €
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {product.sizes.filter(s => !s.isKids).map((s) => {
                  const isSelected = s.size === selectedSize;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      onClick={() => onSelectSize(s.size)}
                      className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'border-purple-900 bg-purple-900 text-white shadow-xs ring-2 ring-purple-600/30'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:border-neutral-400 hover:bg-white'
                      }`}
                    >
                      <span>{s.size}</span>
                      <span className={`text-[9px] mt-0.5 ${
                        isSelected ? 'text-purple-200' : 'text-neutral-400'
                      }`}>
                        {s.size === 'L' ? '3 Stk.' : 'Lager'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {product.sizes.map((s) => {
              const isSelected = s.size === selectedSize;
              return (
                <button
                  key={s.size}
                  type="button"
                  onClick={() => onSelectSize(s.size)}
                  className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'border-purple-900 bg-purple-900 text-white shadow-xs'
                      : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <span>{s.size}</span>
                  {s.stockNote && (
                    <span className={`text-[9px] font-normal mt-0.5 truncate max-w-full ${
                      isSelected ? 'text-purple-200' : 'text-neutral-400'
                    }`}>
                      {s.size === 'L' ? '3 Stk.' : 'Lager'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Club Customization / Veredelungs-Konfigurator */}
      <div id="customization-options" className="p-4.5 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Vereins-Veredelung (Flock & Druck)
            </h3>
          </div>
          <span className="text-[11px] text-purple-900 font-medium bg-purple-100/80 px-2 py-0.5 rounded-md">
            Offizieller Vereins-Look
          </span>
        </div>

        {/* Included Standard Prints */}
        <div className="space-y-1.5 text-xs text-neutral-700">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={customization.includeClubLogo}
              onChange={(e) =>
                onChangeCustomization({
                  ...customization,
                  includeClubLogo: e.target.checked
                })
              }
              className="w-4 h-4 text-purple-600 rounded-sm border-neutral-300 focus:ring-purple-500"
            />
            <span>ASV Vereinswappen auf linker Brust (Inklusive)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={customization.includeBackClubName}
              onChange={(e) =>
                onChangeCustomization({
                  ...customization,
                  includeBackClubName: e.target.checked
                })
              }
              className="w-4 h-4 text-purple-600 rounded-sm border-neutral-300 focus:ring-purple-500"
            />
            <span>Vereinsname "ASV HAPPING" auf dem Rücken (Inklusive)</span>
          </label>
        </div>

        {/* Custom Individual Player Options */}
        <div className="pt-2 border-t border-purple-200/60 space-y-2.5">
          <div className="text-[11px] font-semibold text-neutral-700">
            Optionale Spieler-Personalisierung (Live-Vorschau oben aktiv):
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Player Name */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                Spielername (+4,50 €)
              </label>
              <input
                type="text"
                placeholder="z.B. Müller"
                maxLength={15}
                value={customization.playerName}
                onChange={(e) =>
                  onChangeCustomization({
                    ...customization,
                    playerName: e.target.value
                  })
                }
                className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-neutral-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
              />
            </div>

            {/* Player Number */}
            <div>
              <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                Rückennummer (+3,50 €)
              </label>
              <input
                type="text"
                placeholder="z.B. 7 oder 10"
                maxLength={3}
                value={customization.playerNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  onChangeCustomization({
                    ...customization,
                    playerNumber: val
                  });
                }}
                className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 placeholder:font-normal placeholder:text-neutral-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
              />
            </div>
          </div>

          {/* Player Initials */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-600 mb-1">
              {isInitialsFree ? (
                <span className="flex items-center gap-1.5 text-purple-900 font-semibold">
                  <span>Initialen unter Erima-Logo (Inklusive / 0,00 €)</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono font-bold">##</span>
                </span>
              ) : (
                <span>Initialen unter dem Wappen (+2,50 €)</span>
              )}
            </label>
            <input
              type="text"
              placeholder="z.B. MM"
              maxLength={3}
              value={customization.initials}
              onChange={(e) =>
                onChangeCustomization({
                  ...customization,
                  initials: e.target.value.toUpperCase()
                })
              }
              className="w-32 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 uppercase placeholder:font-normal placeholder:text-neutral-400 focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Quantity Selector & Add to Cart CTA */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-3">
          {/* Quantity stepper */}
          <div className="flex items-center border border-neutral-300 rounded-xl bg-white overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="px-3.5 py-2.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition-colors text-sm font-bold"
            >
              -
            </button>
            <span className="px-3 text-sm font-bold text-neutral-900 min-w-[32px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onChangeQuantity(quantity + 1)}
              className="px-3.5 py-2.5 text-neutral-600 hover:bg-neutral-100 transition-colors text-sm font-bold"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            id="add-to-cart-button"
            onClick={handleAddWithFeedback}
            className="flex-1 py-3 px-5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
          >
            <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>In den Vereinswarenkorb legen</span>
            <span className="opacity-70 font-normal">|</span>
            <span>{lineTotal.toFixed(2)} €</span>
          </button>
        </div>

        {/* Added Feedback Pill */}
        {addedToast && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Erfolgreich zum Vereinswarenkorb hinzugefügt!</span>
          </div>
        )}
      </div>

      {/* Trust & Delivery Info Box */}
      <div id="club-pickup" className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2.5 text-xs text-neutral-600">
        <div className="flex items-start gap-2.5">
          <Truck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-neutral-900 block">
              Lieferung oder Vereinsheim-Abholung
            </span>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
              Fertigstellung ca. 5–8 Werktage nach Bestellrunde. Kostenlose Übergabe in der Geschäftsstelle (Happinger Str. 77, 83026 Rosenheim) oder DHL-Versand.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-100">
          <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-neutral-900 block">
              Offizieller Vereins-Ausrüster Vertrag
            </span>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
              Original Erima® Sportswear Qualität mit lizenziertem Vereinswappen-Flock für den ASV Happing e.V.
            </p>
          </div>
        </div>
      </div>

      {/* Accordions */}
      <div className="border-t border-neutral-200 divide-y divide-neutral-200 text-xs">
        {/* Accordion 1: Description & Details */}
        <div>
          <button
            type="button"
            onClick={() => toggleAccordion('desc')}
            className="w-full py-3.5 flex items-center justify-between font-bold text-neutral-900 hover:text-purple-700 transition-colors"
          >
            <span>Beschreibung & Produkthighlights</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openAccordion === 'desc' ? 'rotate-180 text-purple-700' : 'text-neutral-400'
              }`}
            />
          </button>
          {openAccordion === 'desc' && (
            <div className="pb-4 space-y-3 text-neutral-600 leading-relaxed animate-in fade-in">
              <p>{product.description}</p>
              <ul className="space-y-1.5 pl-1">
                {product.bulletPoints.map((bp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-700 mt-1.5 shrink-0"></span>
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Accordion 2: Material & Care */}
        <div>
          <button
            type="button"
            onClick={() => toggleAccordion('care')}
            className="w-full py-3.5 flex items-center justify-between font-bold text-neutral-900 hover:text-purple-700 transition-colors"
          >
            <span>Material & Pflegehinweise</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openAccordion === 'care' ? 'rotate-180 text-purple-700' : 'text-neutral-400'
              }`}
            />
          </button>
          {openAccordion === 'care' && (
            <div className="pb-4 space-y-2 text-neutral-600 leading-relaxed animate-in fade-in">
              <p><strong className="text-neutral-800">Materialzusammensetzung:</strong> {product.specs.material}</p>
              <p><strong className="text-neutral-800">Passform & Schnitt:</strong> {product.specs.fit}</p>
              <p><strong className="text-neutral-800">Flock & Veredelung:</strong> {product.specs.origin}</p>
              <div className="pt-2">
                <span className="font-semibold text-neutral-800 block mb-1">Pflegehinweise für beflockte Textilien:</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  {product.specs.care.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 3: Team Sammelbestellung */}
        <div>
          <button
            type="button"
            onClick={() => toggleAccordion('team')}
            className="w-full py-3.5 flex items-center justify-between font-bold text-neutral-900 hover:text-purple-700 transition-colors"
          >
            <span>Mannschafts- & Sammelbestellungen</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openAccordion === 'team' ? 'rotate-180 text-purple-700' : 'text-neutral-400'
              }`}
            />
          </button>
          {openAccordion === 'team' && (
            <div className="pb-4 space-y-2 text-neutral-600 leading-relaxed animate-in fade-in text-[11px]">
              <p>
                Du möchtest für eine komplette Mannschaft bestellen?
              </p>
              <p>
                Ab 10 Stück profitiert das Team von kostenfreier Nummernbedruckung und gesammelter Lieferung im Vereinskarton an den jeweiligen Trainer.
              </p>
              <p className="font-medium text-purple-800">
                Kontakt Vereinsausrüster: vereinsshop@asv-happing.de
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
