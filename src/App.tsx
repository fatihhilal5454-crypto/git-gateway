/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductVisualizer from './components/ProductVisualizer';
import ProductInfo from './components/ProductInfo';
import TeamCollectionGrid from './components/TeamCollectionGrid';
import SizeGuideModal from './components/SizeGuideModal';
import CartDrawer from './components/CartDrawer';
import ClubFooter from './components/ClubFooter';
import AdminPage from './components/AdminPage';
import { PRODUCTS, CLUB_INFO } from './data/products';
import { Product, ProductColor, CustomizationOptions, CartItem, StoreSettings } from './types';

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  clubName: CLUB_INFO.name,
  shortName: CLUB_INFO.shortName,
  city: CLUB_INFO.city,
  homeGround: CLUB_INFO.homeGround,
  currentBatchDeadline: CLUB_INFO.currentBatchDeadline,
  pickupPoint: CLUB_INFO.pickupPoint,
  pickupTimes: CLUB_INFO.pickupTimes,
  partnerBrand: CLUB_INFO.partnerBrand,
  notificationEmail: 'th-sportwelt@outlook.de',
  accountHolder: 'Fatih Akmese',
  iban: 'DE63711600000008828830',
  adminPin: 'fatih5454',
  announcementText: 'Bestellrunde für die Saison 2026/27 ist eröffnet',
  showAnnouncement: true
};

import { saveProductsToDB, loadProductsFromDB } from './services/imageDatabase';

export default function App() {
  // Store Settings (saved in localStorage for Netlify static drag-and-drop hosting)
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const stored = localStorage.getItem('asv_store_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.adminPin === '1961' || parsed.adminPin === 'fatih123' || !parsed.adminPin) {
          parsed.adminPin = 'fatih5454';
          localStorage.setItem('asv_store_settings', JSON.stringify({ ...DEFAULT_STORE_SETTINGS, ...parsed }));
        }
        return {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed,
          iban: parsed.iban || DEFAULT_STORE_SETTINGS.iban,
          adminPin: parsed.adminPin === 'fatih123' ? 'fatih5454' : parsed.adminPin
        };
      }
    } catch {
      // fallback
    }
    return DEFAULT_STORE_SETTINGS;
  });

  // Dynamic products list (can be managed / modified via AdminPage & saved to IndexedDB / localStorage)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('asv_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return PRODUCTS;
  });

  // Hydrate from persistent IndexedDB database on startup
  useEffect(() => {
    loadProductsFromDB()
      .then((dbProducts) => {
        if (Array.isArray(dbProducts) && dbProducts.length > 0) {
          setProducts(dbProducts);
        }
      })
      .catch((err) => console.warn('Could not load products from IndexedDB:', err));
  }, []);

  // Current view: 'shop' or 'admin'
  const [currentView, setCurrentView] = useState<'shop' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      if (
        path === '/admin' ||
        path.startsWith('/admin') ||
        hash === '#admin' ||
        hash.startsWith('#/admin') ||
        search.includes('view=admin')
      ) {
        return 'admin';
      }
    }
    return 'shop';
  });

  // Active product selection in shop
  const [currentProduct, setCurrentProduct] = useState<Product>(products[0] || PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    products[0]?.colors[0] || PRODUCTS[0].colors[0]
  );
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [customization, setCustomization] = useState<CustomizationOptions>({
    includeClubLogo: true,
    includeBackClubName: true,
    playerName: '',
    playerNumber: '',
    initials: ''
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('asv_cart_items') || localStorage.getItem('sbr_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);

  // Sync products updates to both IndexedDB and LocalStorage
  const handleUpdateProducts = (updated: Product[]) => {
    setProducts(updated);
    // Asynchronously save to persistent IndexedDB database & localStorage
    saveProductsToDB(updated).catch((err) => console.error('Failed to save to database:', err));
    // If current selected product was edited, update it
    const stillExists = updated.find((p) => p.id === currentProduct.id);
    if (stillExists) {
      setCurrentProduct(stillExists);
    } else if (updated.length > 0) {
      setCurrentProduct(updated[0]);
    }
  };

  const handleResetProducts = () => {
    setProducts(PRODUCTS);
    saveProductsToDB(PRODUCTS).catch(() => {});
    try {
      localStorage.removeItem('asv_products');
    } catch {
      // ignore
    }
    setCurrentProduct(PRODUCTS[0]);
    setSelectedColor(PRODUCTS[0].colors[0]);
  };

  // Sync settings updates
  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('asv_store_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  };

  // URL & Routing Listeners for Netlify Drag and Drop
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      if (
        path === '/admin' ||
        path.startsWith('/admin') ||
        hash === '#admin' ||
        hash.startsWith('#/admin') ||
        search.includes('view=admin')
      ) {
        setCurrentView('admin');
      } else {
        setCurrentView('shop');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    // Keyboard shortcut to toggle admin: Cmd+Shift+A or Ctrl+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setCurrentView((prev) => (prev === 'admin' ? 'shop' : 'admin'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenAdmin = () => {
    setCurrentView('admin');
    window.location.hash = '#admin';
    try {
      window.history.pushState(null, '', '/admin');
    } catch {
      // ignore on restricted hosts
    }
  };

  const handleBackToShop = () => {
    setCurrentView('shop');
    if (window.location.hash === '#admin' || window.location.hash.startsWith('#/admin')) {
      window.location.hash = '';
    }
    try {
      window.history.pushState(null, '', '/');
    } catch {
      // ignore
    }
  };

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('asv_cart_items', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Verify returning Stripe Checkout session if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutState = params.get('checkout');
    const sessionId = params.get('session_id');
    if (checkoutState === 'success' && sessionId) {
      fetch(`/api/checkout-session/${encodeURIComponent(sessionId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.paid) {
            try {
              const pendingRaw = localStorage.getItem('asv_pending_stripe_order');
              const pending = pendingRaw ? JSON.parse(pendingRaw) : null;
              const stored = JSON.parse(localStorage.getItem('asv_orders') || '[]');
              const alreadyRecorded = stored.some((o: { orderId?: string }) => o.orderId === data.orderId);
              if (!alreadyRecorded) {
                stored.unshift({
                  orderId: data.orderId,
                  timestamp: new Date().toISOString(),
                  items: pending?.items || [],
                  grandTotal: data.amountTotal || pending?.grandTotal || 0,
                  deliveryMethod: pending?.deliveryMethod || 'pickup',
                  paymentMethod: 'Kredit-/Debitkarte (Stripe)',
                  cardHolder: data.customerName || pending?.customerName || 'Kunde',
                  customerEmail: data.customerEmail || pending?.customerEmail || '',
                  status: 'neu',
                  settlementAccount: {
                    accountHolder: settings.accountHolder,
                    iban: settings.iban,
                    notificationEmail: settings.notificationEmail,
                    status: 'PAID_STRIPE'
                  }
                });
                localStorage.setItem('asv_orders', JSON.stringify(stored));
              }
              localStorage.removeItem('asv_pending_stripe_order');
            } catch {
              // ignore storage errors
            }
            setCartItems([]);
          }
          window.history.replaceState(null, '', window.location.pathname + window.location.hash);
        })
        .catch(() => {});
    } else if (checkoutState === 'cancel') {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  }, [settings.accountHolder, settings.iban, settings.notificationEmail]);

  // When switching product, synchronize color and size
  const handleSelectProduct = (product: Product) => {
    setCurrentProduct(product);
    setSelectedColor(product.colors[0]);
    const defaultSize = product.sizes.find(s => s.size === 'M')?.size || product.sizes[0]?.size || 'M';
    setSelectedSize(defaultSize);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    const selectedSizeObj = currentProduct.sizes.find(s => s.size === selectedSize);
    const unitPrice = selectedSizeObj?.price ?? (
      selectedSizeObj?.isKids ? (currentProduct.kidsPrice ?? currentProduct.price) : (currentProduct.adultPrice ?? currentProduct.price)
    );

    const playerNameFee = customization.playerName.trim() ? 4.50 : 0;
    const playerNumberFee = customization.playerNumber.trim() ? 3.50 : 0;
    const isInitialsFree = Boolean(currentProduct.initialsInclusive || currentProduct.id === 'asv-erima-sixwings-tee-purple');
    const initialsFee = customization.initials.trim() ? (isInitialsFree ? 0 : 2.50) : 0;
    const customizationFee = playerNameFee + playerNumberFee + initialsFee;

    const newItem: CartItem = {
      id: `${currentProduct.id}-${selectedColor.id}-${selectedSize}-${Date.now()}`,
      productId: currentProduct.id,
      productName: currentProduct.name,
      selectedColor,
      selectedSize,
      customization: { ...customization },
      unitPrice,
      quantity,
      customizationFee
    };

    setCartItems((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // If Admin View is active, render the Admin Page
  if (currentView === 'admin') {
    return (
      <AdminPage
        products={products}
        onUpdateProducts={handleUpdateProducts}
        onResetProducts={handleResetProducts}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onBackToShop={handleBackToShop}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-purple-700 selection:text-white">
      {/* Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        clubName={settings.clubName}
        onUpdateClubName={(name) => handleUpdateSettings({ ...settings, clubName: name })}
        onOpenAdmin={handleOpenAdmin}
        showAnnouncement={settings.showAnnouncement}
        announcementText={settings.announcementText}
      />

      {/* Main Product Stage */}
      <main id="product-main" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Visualizer & Viewpoints */}
          <div className="lg:col-span-6 xl:col-span-7 sticky top-24">
            <ProductVisualizer
              product={currentProduct}
              selectedColor={selectedColor}
              customization={customization}
            />
          </div>

          {/* Right Column: Product Options, Customization & Add to Cart */}
          <div className="lg:col-span-6 xl:col-span-5">
            <ProductInfo
              product={currentProduct}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              customization={customization}
              onChangeCustomization={setCustomization}
              quantity={quantity}
              onChangeQuantity={setQuantity}
              onAddToCart={handleAddToCart}
              onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
            />
          </div>
        </div>

        {/* Team Merchandise Collection Grid */}
        <TeamCollectionGrid
          products={products}
          currentProductId={currentProduct.id}
          onSelectProduct={handleSelectProduct}
        />
      </main>

      {/* Footer */}
      <ClubFooter
        clubName={settings.clubName}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* Modals & Slide-out Drawers */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        settings={settings}
      />
    </div>
  );
}
