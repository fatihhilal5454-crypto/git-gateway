import { X, Ruler, CheckCircle2 } from 'lucide-react';
import { SIZE_CHART } from '../data/products';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div
      id="size-guide-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="size-guide-modal-content"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-purple-700" />
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Erima® Größentabelle & Passformberatung
              </h3>
              <p className="text-xs text-neutral-500">
                Kinder (116–164) & Erwachsene (XS–3XL) • Erima® Kollektion • ASV Happing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-neutral-700">
          {/* Sizing Table */}
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-100/80 text-neutral-900 font-semibold border-b border-neutral-200">
                  <th className="py-2.5 px-3">Größe</th>
                  <th className="py-2.5 px-3">Kategorie</th>
                  <th className="py-2.5 px-3">Brustumfang</th>
                  <th className="py-2.5 px-3">Taillenumfang</th>
                  <th className="py-2.5 px-3">Körpergröße</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {SIZE_CHART.map((row) => {
                  const isKids = ['116', '128', '140', '152', '164'].includes(row.size);
                  return (
                    <tr key={row.size} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-2 px-3 font-bold text-neutral-900">{row.size}</td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                          isKids ? 'bg-purple-100 text-purple-800' : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {isKids ? 'Kinder' : 'Erwachsene'}
                        </span>
                      </td>
                      <td className="py-2 px-3">{row.chest}</td>
                      <td className="py-2 px-3">{row.waist}</td>
                      <td className="py-2 px-3">{row.height}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Fit Tip */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-950 space-y-1">
              <span className="font-semibold block">Passform-Tipp von unserem Team:</span>
              <p className="leading-relaxed">
                Das ASV Happing Erima® Funktionsshirt hat einen regulären, sportlichen Schnitt. Wenn du zwischen zwei Größen schwankst oder das Shirt locker beim Warmmachen tragen möchtest, empfehlen wir eine Nummer größer.
              </p>
            </div>
          </div>

          {/* Measuring Instructions */}
          <div className="text-xs text-neutral-600 space-y-2">
            <div className="font-semibold text-neutral-900">So misst du richtig:</div>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-neutral-800">Brustumfang:</strong> Miss an der stärksten Stelle deiner Brust waagerecht um den Körper.</li>
              <li><strong className="text-neutral-800">Taillenumfang:</strong> Miss an der schmalsten Stelle deiner Taille, ohne das Maßband einzuschnüren.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
