export interface ProductSize {
  size: string;
  available: boolean;
  stockNote: string;
  price: number;
  isKids: boolean;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  borderHex: string;
  textColor: string;
  accentHex: string;
}

export interface ProductSpecs {
  material: string;
  fit: string;
  weight: string;
  origin: string;
  care: string[];
}

export interface ProductDeliveryInfo {
  estimatedDays: string;
  pickupAvailable: boolean;
  pickupLocation: string;
  pickupTimes: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  sku: string;
  brand: string;
  imageUrl: string;
  fallbackImageUrl?: string;
  imageFilename?: string;
  productType: 'tshirt' | 'hoodie' | 'bag' | 'pants' | 'shorts' | 'jacket' | string;
  clubName: string;
  clubAbbr: string;
  clubCity: string;
  price: number;
  kidsPrice?: number;
  adultPrice?: number;
  originalPrice?: number;
  initialsInclusive?: boolean;
  category: string;
  gender: string;
  colors: ProductColor[];
  sizes: ProductSize[];
  description: string;
  bulletPoints: string[];
  specs: ProductSpecs;
  deliveryInfo: ProductDeliveryInfo;
}

export interface CustomizationOptions {
  includeClubLogo: boolean;
  includeBackClubName: boolean;
  playerName: string;
  playerNumber: string;
  initials: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  selectedColor: ProductColor;
  selectedSize: string;
  customization: CustomizationOptions;
  unitPrice: number;
  quantity: number;
  customizationFee: number;
}

export type OrderStatus =
  | 'neu'
  | 'in_bearbeitung'
  | 'bereit'
  | 'abgeschlossen'
  | 'storniert';

export interface OrderRecord {
  orderId: string;
  timestamp: string;
  grandTotal: number;
  deliveryMethod: 'pickup' | 'shipping';
  paymentMethod: string;
  cardLast4?: string;
  cardBrand?: string;
  cardHolder?: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: {
    street: string;
    postalCode: string;
    city: string;
  };
  status: OrderStatus;
  items: CartItem[];
  settlementAccount?: {
    accountHolder: string;
    iban: string;
    notificationEmail: string;
    status: string;
  };
}

export interface StoreSettings {
  clubName: string;
  shortName: string;
  city: string;
  homeGround: string;
  currentBatchDeadline: string;
  pickupPoint: string;
  pickupTimes: string;
  partnerBrand: string;
  notificationEmail: string;
  accountHolder: string;
  iban: string;
  adminPin: string;
  announcementText: string;
  showAnnouncement: boolean;
}
