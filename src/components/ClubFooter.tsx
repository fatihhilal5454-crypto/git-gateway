import { MapPin, Clock, Mail, Shield, ShieldCheck } from 'lucide-react';
import { CLUB_INFO } from '../data/products';

interface ClubFooterProps {
  clubName: string;
  onOpenAdmin: () => void;
}

export default function ClubFooter({ clubName, onOpenAdmin }: ClubFooterProps) {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50 text-neutral-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Club Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/favicon.png"
              alt={clubName}
              className="w-8 h-8 rounded-lg object-contain bg-white border border-neutral-200 p-0.5"
            />
            <div>
              <div className="font-extrabold text-sm text-neutral-900">{clubName}</div>
              <div className="text-[11px] text-neutral-500">Partner: {CLUB_INFO.partnerBrand}</div>
            </div>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Offizieller Team- &amp; Vereinsausrüstungsshop mit individueller Beflockung (Vereinswappen, Spielername, Rückennummer &amp; Initialen).
          </p>
        </div>

        {/* Pickup Info */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
            Vereinsabholung &amp; Ausgabe
          </h4>
          <div className="flex items-start gap-2 text-neutral-600">
            <MapPin className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <span>{CLUB_INFO.pickupPoint}</span>
          </div>
          <div className="flex items-start gap-2 text-neutral-600">
            <Clock className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <span>{CLUB_INFO.pickupTimes}</span>
          </div>
        </div>

        {/* Contact & Admin */}
        <div className="space-y-3">
          <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
            Service &amp; Verwaltung
          </h4>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-700 shrink-0" />
            <a href="mailto:th-sportwelt@outlook.de" className="hover:text-purple-800 font-medium">
              th-sportwelt@outlook.de
            </a>
          </div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>SSL-gesicherte Zahlung &amp; Bestellabwicklung</span>
          </div>
          <div className="pt-1">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:border-purple-300 hover:text-purple-900 text-neutral-700 font-semibold transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-purple-700" />
              <span>Admin-Bereich öffnen</span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 py-4 px-4 text-center text-[11px] text-neutral-400">
        © {new Date().getFullYear()} {clubName} • Offizieller Vereinsshop
      </div>
    </footer>
  );
}
