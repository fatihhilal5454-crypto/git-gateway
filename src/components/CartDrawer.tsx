import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Truck,
  MapPin,
  CheckCircle,
  CreditCard,
  Lock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { CartItem, OrderRecord, StoreSettings } from '../types';
import { CLUB_INFO } from '../data/products';
import {
  MERCHANT_EMAIL,
  MERCHANT_HOLDER,
  MERCHANT_IBAN,
  MERCHANT_IBAN_FORMATTED,
  detectCardBrand,
  formatIban,
  normalizeIban,
  validateCardCvc,
  validateCardExpiry,
  validateCardLuhn,
  validateEmail,
  validateGermanPostalCode
} from '../utils/paymentValidation';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  settings?: StoreSettings;
}

interface FormErrors {
  cart?: string;
  customerName?: string;
  customerEmail?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  cardHolder?: string;
  orderConfirmed?: string;
  server?: string;
}

interface CompletedOrderSummary {
  orderId: string;
  grandTotal: number;
  deliveryMethod: 'pickup' | 'shipping';
  cardBrand: string;
  cardLast4: string;
  customerEmail: string;
  shippingSummary?: string;
  settlementStatus: string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings
}: CartDrawerProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('pickup');

  // Required customer & shipping fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');

  // Credit / Debit Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [stripeRedirectUrl, setStripeRedirectUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderSummary | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/payment-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data && typeof data.stripeConfigured === 'boolean') {
          setStripeConfigured(data.stripeConfigured);
        }
      })
      .catch(() => {
        // Fallback to validated local card check if backend status is unreachable
      });
    return () => {
      active = false;
    };
  }, []);

  if (!isOpen) return null;

  const merchantIbanRaw = settings?.iban ? normalizeIban(settings.iban) : MERCHANT_IBAN;
  const merchantIban = /^DE\d{20}$/.test(merchantIbanRaw) ? merchantIbanRaw : MERCHANT_IBAN;
  const merchantIbanFormatted = formatIban(merchantIban) || MERCHANT_IBAN_FORMATTED;
  const merchantHolder = settings?.accountHolder?.trim() || MERCHANT_HOLDER;
  const merchantEmail = settings?.notificationEmail?.trim() || MERCHANT_EMAIL;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.unitPrice + item.customizationFee) * item.quantity,
    0
  );
  const shippingCost = deliveryMethod === 'pickup' ? 0 : subtotal >= 50 ? 0 : 4.9;
  const grandTotal = Number((subtotal + shippingCost).toFixed(2));
  const hasCartItems = cartItems.length > 0 && subtotal > 0 && grandTotal > 0;
  const detectedBrand = cardNumber.replace(/\D/g, '').length >= 1 ? detectCardBrand(cardNumber) : null;

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => {
      if (!prev[field] && !prev.server) return prev;
      const next = { ...prev };
      delete next[field];
      delete next.server;
      return next;
    });
  };

  const validateCheckoutForm = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!hasCartItems) {
      nextErrors.cart = 'Dein Warenkorb ist leer. Bitte lege zuerst mindestens einen Artikel in den Warenkorb.';
    }

    if (customerName.trim().length < 3) {
      nextErrors.customerName = 'Bitte gib deinen vollständigen Vor- und Nachnamen ein.';
    }

    if (!validateEmail(customerEmail)) {
      nextErrors.customerEmail = 'Bitte gib eine gültige E-Mail-Adresse ein.';
    }

    if (deliveryMethod === 'shipping') {
      if (street.trim().length < 4) {
        nextErrors.street = 'Bitte gib Straße und Hausnummer für den Versand ein.';
      }
      if (!validateGermanPostalCode(postalCode)) {
        nextErrors.postalCode = 'Bitte gib eine gültige 5-stellige PLZ ein.';
      }
      if (city.trim().length < 2) {
        nextErrors.city = 'Bitte gib deinen Wohnort ein.';
      }
    }

    if (!stripeConfigured) {
      if (!validateCardLuhn(cardNumber)) {
        nextErrors.cardNumber = 'Bitte gib eine gültige Kredit- oder Debitkartennummer ein.';
      }
      if (!validateCardExpiry(cardExpiry)) {
        nextErrors.cardExpiry = 'Ungültiges oder abgelaufenes Datum (MM/JJ).';
      }
      if (!validateCardCvc(cardCvc, cardNumber)) {
        nextErrors.cardCvc = 'Bitte gib eine gültige 3- bzw. 4-stellige CVC ein.';
      }
      if (cardHolder.trim().length < 3) {
        nextErrors.cardHolder = 'Bitte gib den Namen des Karteninhabers ein.';
      }
    }

    if (!orderConfirmed) {
      nextErrors.orderConfirmed = 'Bitte bestätige die zahlungspflichtige Bestellung per Kredit- oder Debitkarte.';
    }

    return nextErrors;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateCheckoutForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsCheckingOut(true);

    const shippingAddress =
      deliveryMethod === 'shipping'
        ? {
            street: street.trim(),
            postalCode: postalCode.trim(),
            city: city.trim()
          }
        : undefined;

    try {
      if (stripeConfigured) {
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim(),
            deliveryMethod,
            shippingAddress,
            items: cartItems
          })
        });

        const data = await res.json();
        if (!res.ok || !data?.checkoutUrl) {
          setErrors({
            server: data?.error || 'Stripe-Zahlungssitzung konnte nicht gestartet werden.'
          });
          setIsCheckingOut(false);
          return;
        }

        // Persist pending order metadata for post-redirect confirmation
        try {
          localStorage.setItem(
            'asv_pending_stripe_order',
            JSON.stringify({
              orderId: data.orderId,
              items: cartItems,
              deliveryMethod,
              customerName: customerName.trim(),
              customerEmail: customerEmail.trim(),
              shippingAddress,
              grandTotal
            })
          );
        } catch {
          // ignore
        }

        setStripeRedirectUrl(data.checkoutUrl);
        try {
          if (window.top) {
            window.top.location.href = data.checkoutUrl;
          } else {
            window.location.href = data.checkoutUrl;
          }
        } catch {
          // If cross-origin frame blocks top redirect, user can click the direct Stripe button shown below
        }
        setIsCheckingOut(false);
        return;
      }

      const cardDigits = cardNumber.replace(/\D/g, '');
      const cardLast4 = cardDigits.slice(-4);
      const cardBrand = detectCardBrand(cardNumber);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          deliveryMethod,
          shippingAddress,
          items: cartItems,
          cardHolder: cardHolder.trim(),
          cardLast4,
          cardBrand,
          merchantIban,
          merchantHolder,
          merchantEmail
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.order) {
        setErrors({
          server: data?.error || 'Bestellung konnte nicht verarbeitet werden. Bitte überprüfe deine Eingaben.'
        });
        setIsCheckingOut(false);
        return;
      }

      const transactionRecord: OrderRecord = data.order;

      try {
        const stored = JSON.parse(localStorage.getItem('asv_orders') || '[]');
        stored.unshift(transactionRecord);
        localStorage.setItem('asv_orders', JSON.stringify(stored));
      } catch {
        // LocalStorage fallback
      }

      setCompletedOrder({
        orderId: transactionRecord.orderId,
        grandTotal: transactionRecord.grandTotal,
        deliveryMethod,
        cardBrand,
        cardLast4,
        customerEmail: customerEmail.trim(),
        shippingSummary: shippingAddress
          ? `${shippingAddress.street}, ${shippingAddress.postalCode} ${shippingAddress.city}`
          : undefined,
        settlementStatus: transactionRecord.settlementAccount?.status || 'AWAITING_PSP_CAPTURE'
      });

      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setCardHolder('');
      setOrderConfirmed(false);
      onClearCart();
    } catch {
      setErrors({
        server: 'Verbindung zum Zahlungsserver fehlgeschlagen. Bitte versuche es erneut.'
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div
      id="cart-drawer-backdrop"
      className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex justify-end transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="cart-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-neutral-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-neutral-800" />
            <h3 className="font-bold text-neutral-900 text-base">
              Vereins-Warenkorb ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stripe Redirect Fallback Screen */}
        {stripeRedirectUrl ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
              <CreditCard className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-neutral-900">
              Weiterleitung zur sicheren Kartenzahlung
            </h4>
            <p className="text-xs text-neutral-600 max-w-xs leading-relaxed">
              Klicke unten, falls sich der Stripe-Checkout für deine Kredit- oder Debitkarte nicht automatisch geöffnet hat.
            </p>
            <a
              href={stripeRedirectUrl}
              target="_top"
              rel="noopener noreferrer"
              className="w-full py-3 bg-purple-950 text-white rounded-xl text-xs font-bold hover:bg-purple-900 transition-all flex items-center justify-center gap-2"
            >
              <span>Jetzt mit Kredit- / Debitkarte bezahlen</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ) : completedOrder ? (
          /* Order Complete Notification Screen */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-bold text-neutral-900">
              Vielen Dank für deine Bestellung!
            </h4>
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 w-full max-w-xs space-y-1.5 text-left">
              <p className="font-semibold text-neutral-900">
                Bestellnummer: <span className="font-mono">{completedOrder.orderId}</span>
              </p>
              <p>
                Zahlungsart: <strong>{completedOrder.cardBrand} (•••• {completedOrder.cardLast4})</strong>
              </p>
              <p>
                Betrag: <strong>{completedOrder.grandTotal.toFixed(2)} €</strong>
              </p>
              <p>
                {completedOrder.deliveryMethod === 'pickup'
                  ? `Abholung: ${CLUB_INFO.pickupPoint}`
                  : `Versand an: ${completedOrder.shippingSummary}`}
              </p>
            </div>
            <p className="text-[11px] text-neutral-500 max-w-xs leading-relaxed">
              Die Bestellung ({completedOrder.orderId}) wurde mit dem Auszahlungskonto ({merchantIbanFormatted}) verknüpft und an {completedOrder.customerEmail} protokolliert.
            </p>
            <button
              type="button"
              onClick={() => {
                setCompletedOrder(null);
                onClose();
              }}
              className="mt-2 px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Weiter im Vereinsshop stöbern
            </button>
          </div>
        ) : !hasCartItems ? (
          /* Empty Cart State — blocks empty checkout completely */
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-3 text-neutral-500">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="font-semibold text-neutral-800 text-sm">
              Dein Vereinswarenkorb ist noch leer
            </div>
            <p className="text-xs max-w-xs leading-relaxed">
              Wähle dein Trikot, Kurzhosen oder Socken aus und lege mindestens einen Artikel in den Warenkorb, bevor du zur Kasse gehst.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Zum Team-Shop
            </button>
          </div>
        ) : (
          /* Active Cart + Validated Credit/Debit Card Checkout */
          <form onSubmit={handleCheckout} noValidate className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Cart Items List */}
              <div className="divide-y divide-neutral-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex gap-3.5">
                    <div
                      className="w-12 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0"
                      style={{
                        backgroundColor: item.selectedColor.hex,
                        borderColor: item.selectedColor.borderHex
                      }}
                    >
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: item.selectedColor.textColor }}
                      >
                        {item.selectedSize}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-neutral-900 leading-tight">
                          {item.productName}
                        </h5>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="text-neutral-400 hover:text-red-600 transition-colors p-1 -mr-1 cursor-pointer"
                          title="Entfernen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-500 mt-1 space-y-0.5">
                        <div>Farbe: {item.selectedColor.name} • Größe: {item.selectedSize}</div>
                        {item.customization.playerName && (
                          <div className="font-medium text-blue-700">
                            Name: {item.customization.playerName.toUpperCase()}
                            {item.customization.playerNumber && ` #${item.customization.playerNumber}`}
                          </div>
                        )}
                        {item.customization.initials && (
                          <div className="text-neutral-600">
                            Initialen: {item.customization.initials.toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50 text-xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="px-2 py-0.5 text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 font-medium text-neutral-800">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="px-2 py-0.5 text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-neutral-900">
                            {((item.unitPrice + item.customizationFee) * item.quantity).toFixed(2)} €
                          </div>
                          {item.customizationFee > 0 && (
                            <div className="text-[10px] text-neutral-400">
                              inkl. {item.customizationFee.toFixed(2)} € Flock
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Option Selector */}
              <div className="space-y-1.5 pt-4 border-t border-neutral-200">
                <label className="text-xs font-semibold text-neutral-800 block">
                  Lieferart / Übergabe
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      deliveryMethod === 'pickup'
                        ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600 text-neutral-900'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-purple-700" />
                      <span>Vereinsabholung</span>
                    </div>
                    <span className="text-[10px] text-purple-700 font-medium">0,00 € (Happinger Str. 77)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('shipping')}
                    className={`p-2 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      deliveryMethod === 'shipping'
                        ? 'border-purple-600 bg-purple-50/40 ring-1 ring-purple-600 text-neutral-900'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Truck className="w-3.5 h-3.5 text-neutral-700" />
                      <span>Postversand</span>
                    </div>
                    <span className="text-[10px] text-neutral-500">
                      {subtotal >= 50 ? 'Kostenlos ab 50 €' : '4,90 € DHL'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Required Buyer & Shipping Fields */}
              <div className="space-y-2.5 pt-3 border-t border-neutral-200">
                <span className="text-xs font-semibold text-neutral-800 block">
                  Bestelldaten (Pflichtfelder)
                </span>

                <div>
                  <label className="block text-[10px] font-medium text-neutral-600 mb-0.5">
                    Vor- und Nachname *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="z. B. Lukas Weber"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      clearFieldError('customerName');
                    }}
                    className={`w-full px-3 py-1.5 bg-neutral-50 border rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white outline-none transition-colors ${
                      errors.customerName ? 'border-red-500 bg-red-50/30' : 'border-neutral-200 focus:border-purple-600'
                    }`}
                  />
                  {errors.customerName && (
                    <p className="text-[10px] text-red-600 mt-0.5">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-neutral-600 mb-0.5">
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@beispiel.de"
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      clearFieldError('customerEmail');
                    }}
                    className={`w-full px-3 py-1.5 bg-neutral-50 border rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white outline-none transition-colors ${
                      errors.customerEmail ? 'border-red-500 bg-red-50/30' : 'border-neutral-200 focus:border-purple-600'
                    }`}
                  />
                  {errors.customerEmail && (
                    <p className="text-[10px] text-red-600 mt-0.5">{errors.customerEmail}</p>
                  )}
                </div>

                {deliveryMethod === 'shipping' && (
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="block text-[10px] font-medium text-neutral-600 mb-0.5">
                        Straße & Hausnummer *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Musterstraße 12"
                        value={street}
                        onChange={(e) => {
                          setStreet(e.target.value);
                          clearFieldError('street');
                        }}
                        className={`w-full px-3 py-1.5 bg-neutral-50 border rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white outline-none transition-colors ${
                          errors.street ? 'border-red-500 bg-red-50/30' : 'border-neutral-200 focus:border-purple-600'
                        }`}
                      />
                      {errors.street && (
                        <p className="text-[10px] text-red-600 mt-0.5">{errors.street}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-600 mb-0.5">
                          PLZ *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="83026"
                          value={postalCode}
                          onChange={(e) => {
                            setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 5));
                            clearFieldError('postalCode');
                          }}
                          className={`w-full px-2.5 py-1.5 bg-neutral-50 border rounded-lg text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:bg-white outline-none transition-colors ${
                            errors.postalCode ? 'border-red-500 bg-red-50/30' : 'border-neutral-200 focus:border-purple-600'
                          }`}
                        />
                        {errors.postalCode && (
                          <p className="text-[10px] text-red-600 mt-0.5">{errors.postalCode}</p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-[10px] font-medium text-neutral-600 mb-0.5">
                          Ort *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Rosenheim"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            clearFieldError('city');
                          }}
                          className={`w-full px-2.5 py-1.5 bg-neutral-50 border rounded-lg text-xs text-neutral-900 placeholder:text-neutral-400 focus:bg-white outline-none transition-colors ${
                            errors.city ? 'border-red-500 bg-red-50/30' : 'border-neutral-200 focus:border-purple-600'
                          }`}
                        />
                        {errors.city && (
                          <p className="text-[10px] text-red-600 mt-0.5">{errors.city}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method: Exclusively Credit or Debit Card */}
              <div className="space-y-2.5 pt-3 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-purple-700" />
                    <span>Zahlungsart: Kreditkarte</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-neutral-900 text-white tracking-wider">VISA</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-600 text-white tracking-wider">MC</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white tracking-wider">AMEX</span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-700 text-white tracking-wider">DEBIT</span>
                  </div>
                </div>

                {stripeConfigured ? (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-600 space-y-1.5">
                    <div className="font-semibold text-neutral-900">
                      Sichere Kredit- &amp; Debitkartenzahlung (Stripe Checkout)
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Nach Klick auf „Zur Kasse“ wirst du zur verschlüsselten Kartenzahlung (Visa, Mastercard, Amex, Debitkarte) weitergeleitet. Auszahlung direkt auf Konto <span className="font-mono font-semibold text-neutral-800">•••• {merchantIban.slice(-4)}</span>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[10px] font-medium text-neutral-600">
                          Kartennummer (Kredit- oder Debitkarte) *
                        </label>
                        {detectedBrand && (
                          <span className="text-[10px] font-bold text-purple-700">
                            {detectedBrand}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="0000 0000 0000 0000"
                          maxLength={23}
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 19);
                            const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                            setCardNumber(formatted);
                            clearFieldError('cardNumber');
                          }}
                          className={`w-full pl-8 pr-3 py-1.5 bg-white border rounded-lg text-xs font-mono font-medium text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors ${
                            errors.cardNumber ? 'border-red-500 bg-red-50/30' : 'border-neutral-200 focus:border-purple-600'
                          }`}
                        />
                        <CreditCard className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {errors.cardNumber && (
                        <p className="text-[10px] text-red-600 mt-0.5">{errors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-neutral-600 mb-0.5">
                          Gültig bis (MM/JJ) *
                        </label>
                        <input
                          type="text"
                          required
                          inputMode="numeric"
                          autoComplete="cc-exp"
                          placeholder="MM/JJ"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
                            setCardExpiry(val);
                            clearFieldError('cardExpiry');
                          }}
                          className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs font-mono font-medium text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors text-center ${
                            errors.cardExpiry ? 'border-red-500 bg-red-50/30' : 'border-neutral-200 focus:border-purple-600'
                          }`}
                        />
                        {errors.cardExpiry && (
                          <p className="text-[10px] text-red-600 mt-0.5">{errors.cardExpiry}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-neutral-600 mb-0.5">
                          Prüfziffer (CVC) *
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            required
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            placeholder="•••"
                            maxLength={4}
                            value={cardCvc}
                            onChange={(e) => {
                              setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
                              clearFieldError('cardCvc');
                            }}
                            className={`w-full pl-2.5 pr-6 py-1.5 bg-white border rounded-lg text-xs font-mono font-medium text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors text-center ${
                              errors.cardCvc ? 'border-red-500 bg-red-50/30' : 'border-neutral-200 focus:border-purple-600'
                            }`}
                          />
                          <Lock className="w-3 h-3 text-neutral-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        {errors.cardCvc && (
                          <p className="text-[10px] text-red-600 mt-0.5">{errors.cardCvc}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-neutral-600 mb-0.5">
                        Karteninhaber *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="cc-name"
                        placeholder="Vor- und Nachname auf der Karte"
                        value={cardHolder}
                        onChange={(e) => {
                          setCardHolder(e.target.value);
                          clearFieldError('cardHolder');
                        }}
                        className={`w-full px-2.5 py-1.5 bg-white border rounded-lg text-xs font-medium text-neutral-900 placeholder:text-neutral-400 outline-none transition-colors ${
                          errors.cardHolder ? 'border-red-500 bg-red-50/30' : 'border-neutral-200 focus:border-purple-600'
                        }`}
                      />
                      {errors.cardHolder && (
                        <p className="text-[10px] text-red-600 mt-0.5">{errors.cardHolder}</p>
                      )}
                    </div>
                  </div>
                )}

                <label className="flex items-start gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={orderConfirmed}
                    onChange={(e) => {
                      setOrderConfirmed(e.target.checked);
                      clearFieldError('orderConfirmed');
                    }}
                    className="mt-0.5 w-4 h-4 text-purple-700 rounded border-neutral-300 focus:ring-purple-600"
                  />
                  <span className="text-[11px] text-neutral-700 leading-snug">
                    Ich bestätige die zahlungspflichtige Bestellung über <strong>{grandTotal.toFixed(2)} €</strong> per Kredit- oder Debitkarte. *
                  </span>
                </label>
                {errors.orderConfirmed && (
                  <p className="text-[10px] text-red-600">{errors.orderConfirmed}</p>
                )}
              </div>
            </div>

            {/* Sticky Checkout Footer */}
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/90 space-y-3 shrink-0">
              {errorCount > 0 && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {errors.server || errors.cart || 'Bitte fülle alle markierten Pflichtfelder und Kartendaten korrekt aus.'}
                  </span>
                </div>
              )}

              <div className="space-y-1 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Zwischensumme (inkl. 19% MwSt.)</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span>Versandkosten</span>
                  <span>{shippingCost === 0 ? 'Kostenlos' : `${shippingCost.toFixed(2)} €`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-1 border-t border-neutral-200">
                  <span>Gesamtsumme</span>
                  <span>{grandTotal.toFixed(2)} €</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!hasCartItems || isCheckingOut}
                className="w-full py-3 bg-purple-950 text-white rounded-xl text-xs font-bold hover:bg-purple-900 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCheckingOut ? (
                  <span>Wird geprüft &amp; übermittelt...</span>
                ) : (
                  <>
                    <span>Zur Kasse • {grandTotal.toFixed(2)} € bezahlen</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Kredit-/Debitkarte • Zielkonto IBAN •••• {merchantIban.slice(-4)}</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
