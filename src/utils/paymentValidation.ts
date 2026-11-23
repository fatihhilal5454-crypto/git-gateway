/**
 * Credit & Debit Card validation utilities and German IBAN merchant settlement configuration.
 */

export const MERCHANT_IBAN = 'DE63711600000008828830';
export const MERCHANT_IBAN_FORMATTED = 'DE63 7116 0000 0008 8288 30';
export const MERCHANT_HOLDER = 'Fatih Akmese';
export const MERCHANT_EMAIL = 'th-sportwelt@outlook.de';

export type CardBrand = 'Visa' | 'Mastercard' | 'American Express' | 'Debitkarte';

export function detectCardBrand(rawNumber: string): CardBrand {
  const digits = rawNumber.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Debitkarte';
}

/**
 * Validates credit or debit card number length (13-19 digits) and Luhn checksum.
 */
export function validateCardLuhn(rawNumber: string): boolean {
  const digits = rawNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  if (/^0+$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Validates MM/YY expiry date format and ensures the card is not expired.
 */
export function validateCardExpiry(expiry: string): boolean {
  const match = expiry.trim().match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (year > currentYear + 20) return false;

  return true;
}

export function validateCardCvc(cvc: string, cardNumber: string): boolean {
  const digits = cvc.replace(/\D/g, '');
  const brand = detectCardBrand(cardNumber);
  if (brand === 'American Express') {
    return digits.length === 4;
  }
  return digits.length === 3 || digits.length === 4;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validateGermanPostalCode(plz: string): boolean {
  return /^\d{5}$/.test(plz.trim());
}

export function normalizeIban(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase();
}

export function formatIban(raw: string): string {
  const clean = normalizeIban(raw).replace(/[^A-Z0-9]/g, '');
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}
