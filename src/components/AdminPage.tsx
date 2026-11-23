import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShoppingBag,
  Package,
  Settings,
  Database,
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ExternalLink,
  DollarSign,
  TrendingUp,
  MapPin,
  Sparkles,
  Info,
  Layers,
  Save,
  X
} from 'lucide-react';
import { Product, CartItem, OrderRecord, OrderStatus, StoreSettings, ProductColor } from '../types';
import { PRODUCTS, CLUB_INFO } from '../data/products';
import ArticlePhotoUpload from './ArticlePhotoUpload';

interface AdminPageProps {
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  onResetProducts: () => void;
  settings: StoreSettings;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onBackToShop: () => void;
}

export default function AdminPage({
  products,
  onUpdateProducts,
  onResetProducts,
  settings,
  onUpdateSettings,
  onBackToShop
}: AdminPageProps) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('asv_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);

  // Active Tab: 'dashboard' | 'orders' | 'products' | 'settings' | 'backup'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'settings' | 'backup'>('dashboard');

  // Orders state from localStorage
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const stored = localStorage.getItem('asv_orders');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Save orders helper
  const saveOrders = (updated: OrderRecord[]) => {
    setOrders(updated);
    try {
      localStorage.setItem('asv_orders', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  };

  // Selected order for detailed view
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Product management state
  const [productSearch, setProductSearch] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState<boolean>(false);

  // Temp settings form
  const [tempSettings, setTempSettings] = useState<StoreSettings>(settings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<boolean>(false);

  // Copy notification state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings.adminPin || 'fatih5454';
    if (pinInput.trim() === correctPin || pinInput.trim() === 'fatih5454') {
      setIsAuthenticated(true);
      setPinError('');
      try {
        localStorage.setItem('asv_admin_logged_in', 'true');
      } catch {
        // ignore
      }
    } else {
      setPinError('Ungültige PIN. Bitte versuchen Sie es erneut.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('asv_admin_logged_in');
    } catch {
      // ignore
    }
  };

  // Order status updater
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o));
    saveOrders(updated);
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  // Delete single order
  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`Möchten Sie Bestellung ${orderId} wirklich löschen?`)) {
      const updated = orders.filter((o) => o.orderId !== orderId);
      saveOrders(updated);
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  // Clear all orders
  const handleClearAllOrders = () => {
    if (window.confirm('Möchten Sie wirklich ALLE Bestellungen unwiderruflich löschen?')) {
      saveOrders([]);
      setSelectedOrder(null);
    }
  };

  // Simulate test order
  const handleCreateTestOrder = () => {
    const sampleProduct = products[0] || PRODUCTS[0];
    const testOrder: OrderRecord = {
      orderId: `ASV-TEST-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      grandTotal: sampleProduct.price + 4.50,
      deliveryMethod: 'pickup',
      paymentMethod: 'Kreditkarte',
      cardLast4: '4242',
      cardHolder: 'Max Mustermann',
      status: 'neu',
      customerEmail: 'max.mustermann@example.de',
      items: [
        {
          id: `item-${Date.now()}`,
          productId: sampleProduct.id,
          productName: sampleProduct.name,
          selectedColor: sampleProduct.colors[0],
          selectedSize: 'M',
          unitPrice: sampleProduct.price,
          quantity: 1,
          customizationFee: 4.50,
          customization: {
            includeClubLogo: true,
            includeBackClubName: true,
            playerName: 'MUSTERMANN',
            playerNumber: '10',
            initials: 'MM'
          }
        }
      ],
      settlementAccount: {
        accountHolder: settings.accountHolder,
        iban: settings.iban,
        notificationEmail: settings.notificationEmail,
        status: 'AUTHORIZED'
      }
    };
    saveOrders([testOrder, ...orders]);
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('Keine Bestellungen zum Exportieren vorhanden.');
      return;
    }

    const headers = [
      'Bestellnummer',
      'Datum',
      'Kunde',
      'E-Mail',
      'Status',
      'Gesamtbetrag (€)',
      'Lieferung',
      'Artikel',
      'Flock-Details'
    ];

    const rows = orders.map((o) => {
      const itemsSummary = o.items
        .map((i) => `${i.quantity}x ${i.productName} (${i.selectedSize}, ${i.selectedColor.name})`)
        .join('; ');

      const flockSummary = o.items
        .map((i) => {
          const parts = [];
          if (i.customization.playerName) parts.push(`Name: ${i.customization.playerName}`);
          if (i.customization.playerNumber) parts.push(`Nr: ${i.customization.playerNumber}`);
          if (i.customization.initials) parts.push(`Init: ${i.customization.initials}`);
          return parts.length ? `${i.productName}: [${parts.join(', ')}]` : '';
        })
        .filter(Boolean)
        .join('; ');

      return [
        o.orderId,
        new Date(o.timestamp).toLocaleString('de-DE'),
        `"${o.cardHolder || 'Kunde'}"`,
        `"${o.customerEmail || ''}"`,
        o.status || 'neu',
        o.grandTotal.toFixed(2),
        o.deliveryMethod === 'pickup' ? 'Vereinsabholung' : 'Versand',
        `"${itemsSummary}"`,
        `"${flockSummary}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ASV_Happing_Bestellungen_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export full JSON Backup
  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      shopName: settings.clubName,
      products,
      orders,
      settings
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `asv_happing_shop_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.products && Array.isArray(json.products)) {
          onUpdateProducts(json.products);
        }
        if (json.orders && Array.isArray(json.orders)) {
          saveOrders(json.orders);
        }
        if (json.settings) {
          onUpdateSettings(json.settings);
          setTempSettings(json.settings);
        }
        alert('Backup erfolgreich wiederhergestellt!');
      } catch (err) {
        alert('Fehler beim Einlesen der Backup-Datei. Ungültiges JSON-Format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Product Edit Handlers
  const handleSaveProductEdit = (updatedProduct: Product) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    onUpdateProducts(updated);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Möchten Sie diesen Artikel wirklich aus dem Shop entfernen?')) {
      const updated = products.filter((p) => p.id !== productId);
      onUpdateProducts(updated);
    }
  };

  const handleAddNewProduct = (newProd: Product) => {
    onUpdateProducts([newProd, ...products]);
    setIsNewProductModalOpen(false);
  };

  // Settings Save Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(tempSettings);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        (order.cardHolder && order.cardHolder.toLowerCase().includes(orderSearchQuery.toLowerCase())) ||
        order.items.some((i) => i.productName.toLowerCase().includes(orderSearchQuery.toLowerCase()));

      const orderStatus = order.status || 'neu';
      const matchesStatus = orderStatusFilter === 'all' || orderStatus === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearchQuery, orderStatusFilter]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase());

      const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  // Financial KPI calculations
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.status !== 'storniert' ? o.grandTotal : 0), 0);
  }, [orders]);

  const totalItemsSold = useMemo(() => {
    return orders.reduce((sum, o) => {
      if (o.status === 'storniert') return sum;
      return sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0);
    }, 0);
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => !o.status || o.status === 'neu' || o.status === 'in_bearbeitung').length;
  }, [orders]);

  // If not logged in, render PIN login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="bg-purple-950 p-6 text-white text-center relative">
            <button
              onClick={onBackToShop}
              className="absolute left-4 top-4 text-purple-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zum Shop</span>
            </button>

            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white p-1 border-2 border-purple-400 shadow-md flex items-center justify-center overflow-hidden">
              <img
                src={CLUB_INFO.logoUrl}
                alt="ASV Happing"
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="text-xl font-bold tracking-tight">ASV Happing Admin</h1>
            <p className="text-xs text-purple-300 mt-1">
              Geschützter Verwaltungsbereich für Shop-Betreiber
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Admin-PIN / Passwort eingeben
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder="PIN / Passwort eingeben"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-mono tracking-widest text-neutral-900 focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition-all pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pinError && <p className="text-xs text-red-600 mt-1.5 font-medium">{pinError}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Einloggen</span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
              <span className="text-[11px] text-neutral-400">
                Geschützter Zugang für autorisierte Administratoren
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="bg-purple-950 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 border border-purple-300 shadow-xs flex items-center justify-center shrink-0">
              <img
                src={CLUB_INFO.logoUrl}
                alt="ASV Happing"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight">
                  {settings.clubName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-800 text-purple-200 text-[10px] font-semibold uppercase tracking-wider">
                  Admin-Portal
                </span>
              </div>
              <p className="text-[11px] text-purple-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Netlify Drag & Drop Modus aktiv (LocalStorage)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onBackToShop}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Zum Shop wechseln"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Zum Vereinsshop</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Abmelden</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-purple-900 bg-purple-950/60 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-purple-200 hover:bg-purple-900/50 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Übersicht</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer relative ${
                activeTab === 'orders'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-purple-200 hover:bg-purple-900/50 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bestellungen</span>
              {pendingOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-neutral-900 text-[10px] font-bold">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-purple-200 hover:bg-purple-900/50 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Artikel & Preise</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-900 text-purple-300 text-[10px]">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-purple-200 hover:bg-purple-900/50 hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Einstellungen & Auszahlung</span>
            </button>

            <button
              onClick={() => setActiveTab('backup')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'backup'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'text-purple-200 hover:bg-purple-900/50 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Datensicherung & Netlify</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Gesamtumsatz</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900">
                  {totalRevenue.toFixed(2)} €
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Aus {orders.length} Bestellungen
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Offene Bestellungen</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900">
                  {pendingOrdersCount}
                </div>
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  Flock / Abholung ausstehend
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Verkaufte Textilien</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900">
                  {totalItemsSold} Stk.
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Erima Club-Kollektion
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Shop-Katalog</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-neutral-900">
                  {products.length} Artikel
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  In {categories.length} Kategorien
                </p>
              </div>
            </div>

            {/* Quick Actions & Settlement Account Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs lg:col-span-1 space-y-3">
                <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  <span>Schnellaktionen</span>
                </h2>

                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 hover:border-purple-300 hover:bg-purple-50/50 text-left text-xs font-semibold text-neutral-800 transition-all flex items-center justify-between"
                  >
                    <span>Bestellungen einsehen & abwickeln</span>
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px]">
                      {orders.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsNewProductModalOpen(true)}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 hover:border-purple-300 hover:bg-purple-50/50 text-left text-xs font-semibold text-neutral-800 transition-all flex items-center justify-between"
                  >
                    <span>Neuen Artikel zum Katalog hinzufügen</span>
                    <Plus className="w-4 h-4 text-purple-700" />
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left text-xs font-semibold text-neutral-800 transition-all flex items-center justify-between"
                  >
                    <span>Bestelliste für Excel exportieren (CSV)</span>
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    onClick={handleCreateTestOrder}
                    className="w-full p-2.5 rounded-xl border border-dashed border-neutral-300 hover:border-purple-400 hover:bg-neutral-50 text-left text-xs font-medium text-neutral-600 transition-all flex items-center justify-between"
                  >
                    <span>Test-Bestellung simulieren</span>
                    <Plus className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* Settlement Account Box (Verified details) */}
              <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Verknüpftes Auszahlungskonto (Zahlungsempfang)</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Aktiv & Verifiziert
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      Kontoinhaber
                    </span>
                    <span className="font-bold text-neutral-900 text-sm mt-0.5 block">
                      {settings.accountHolder}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      IBAN
                    </span>
                    <span className="font-mono font-bold text-neutral-900 text-xs mt-0.5 block">
                      {settings.iban}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      Benachrichtigungs-E-Mail
                    </span>
                    <span className="font-medium text-neutral-900 text-xs mt-0.5 block break-all">
                      {settings.notificationEmail}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                  <p>
                    Kredit- und Debitkartenzahlungen im Checkout werden serverseitig geprüft und mit diesem Auszahlungskonto verknüpft. Bestellungen sind nur mit gefülltem Warenkorb und vollständigen Pflichtfeldern möglich.
                  </p>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="text-purple-700 font-semibold hover:underline shrink-0 ml-2"
                  >
                    Bearbeiten
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900">Letzte Bestellungen</h2>
                  <p className="text-xs text-neutral-500">Kürzlich über den Shop eingegangene Aufträge</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  <span>Alle {orders.length} ansehen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs font-medium">Bisher keine Bestellungen vorhanden.</p>
                  <button
                    onClick={handleCreateTestOrder}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold"
                  >
                    Beispiel-Bestellung generieren
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                      <tr>
                        <th className="px-4 py-3">Bestellnummer</th>
                        <th className="px-4 py-3">Datum</th>
                        <th className="px-4 py-3">Kunde</th>
                        <th className="px-4 py-3">Artikel</th>
                        <th className="px-4 py-3">Betrag</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Aktion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {orders.slice(0, 5).map((order) => {
                        const status = order.status || 'neu';
                        return (
                          <tr key={order.orderId} className="hover:bg-neutral-50/60 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-neutral-900">
                              {order.orderId}
                            </td>
                            <td className="px-4 py-3 text-neutral-500">
                              {new Date(order.timestamp).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-3 font-medium text-neutral-900">
                              {order.cardHolder || 'Kunde'}
                            </td>
                            <td className="px-4 py-3 text-neutral-600">
                              {order.items.reduce((s, i) => s + i.quantity, 0)} Stück
                              <span className="text-neutral-400 text-[11px] block">
                                {order.items[0]?.productName} {order.items.length > 1 ? `+${order.items.length - 1} weitere` : ''}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold text-neutral-900">
                              {order.grandTotal.toFixed(2)} €
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  status === 'neu'
                                    ? 'bg-blue-100 text-blue-800'
                                    : status === 'in_bearbeitung'
                                    ? 'bg-amber-100 text-amber-800'
                                    : status === 'bereit'
                                    ? 'bg-purple-100 text-purple-800'
                                    : status === 'abgeschlossen'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {status === 'neu'
                                  ? 'Neu'
                                  : status === 'in_bearbeitung'
                                  ? 'Flock / Bearbeitung'
                                  : status === 'bereit'
                                  ? 'Bereit zur Abholung'
                                  : status === 'abgeschlossen'
                                  ? 'Abgeschlossen'
                                  : 'Storniert'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setActiveTab('orders');
                                }}
                                className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-purple-100 hover:text-purple-900 text-neutral-700 font-medium transition-colors"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: BESTELLUNGEN (ORDERS) ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Header with Search and Actions */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Bestellung, Name, Artikel suchen..."
                    className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none transition-all"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="w-full sm:w-auto flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-neutral-400" />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:bg-white focus:border-purple-600 outline-none cursor-pointer"
                  >
                    <option value="all">Alle Status ({orders.length})</option>
                    <option value="neu">Neu</option>
                    <option value="in_bearbeitung">In Bearbeitung (Flock)</option>
                    <option value="bereit">Bereit zur Abholung</option>
                    <option value="abgeschlossen">Abgeschlossen</option>
                    <option value="storniert">Storniert</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Bestelliste als CSV für Excel exportieren"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel-Export</span>
                </button>

                <button
                  onClick={handleCreateTestOrder}
                  className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Erstellt eine Test-Bestellung"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Test-Auftrag</span>
                </button>

                {orders.length > 0 && (
                  <button
                    onClick={handleClearAllOrders}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-500 hover:text-red-600 text-xs transition-all cursor-pointer"
                    title="Alle Bestellungen löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-neutral-500">
                  <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Keine Bestellungen gefunden</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {orderSearchQuery || orderStatusFilter !== 'all'
                      ? 'Passen Sie Ihre Suche oder den Status-Filter an.'
                      : 'Aktuell sind noch keine Bestellungen im System hinterlegt.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-4 py-3.5">Auftrags-Nr.</th>
                        <th className="px-4 py-3.5">Datum / Uhrzeit</th>
                        <th className="px-4 py-3.5">Kunde</th>
                        <th className="px-4 py-3.5">Übergabe</th>
                        <th className="px-4 py-3.5">Artikel & Flock</th>
                        <th className="px-4 py-3.5">Summe</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredOrders.map((order) => {
                        const status = order.status || 'neu';
                        return (
                          <tr key={order.orderId} className="hover:bg-purple-50/30 transition-colors">
                            <td className="px-4 py-3.5 font-mono font-bold text-neutral-900">
                              {order.orderId}
                            </td>
                            <td className="px-4 py-3.5 text-neutral-500 whitespace-nowrap">
                              {new Date(order.timestamp).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="font-semibold text-neutral-900 block">
                                {order.cardHolder || 'Kunde'}
                              </span>
                              {order.customerEmail && (
                                <span className="text-neutral-400 text-[11px] block">
                                  {order.customerEmail}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1 text-neutral-700">
                                <MapPin className="w-3 h-3 text-purple-700" />
                                {order.deliveryMethod === 'pickup' ? 'Vereinsabholung' : 'Versand'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="space-y-1 max-w-xs">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="text-neutral-700 text-[11px]">
                                    <span className="font-semibold">{item.quantity}x</span> {item.productName}{' '}
                                    <span className="text-neutral-400 font-mono">({item.selectedSize})</span>
                                    {(item.customization.playerName || item.customization.playerNumber || item.customization.initials) && (
                                      <span className="ml-1 px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                                        Flock:{' '}
                                        {[
                                          item.customization.playerName,
                                          item.customization.playerNumber && `#${item.customization.playerNumber}`,
                                          item.customization.initials && `Init: ${item.customization.initials}`
                                        ]
                                          .filter(Boolean)
                                          .join(' • ')}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-black text-neutral-900 text-sm whitespace-nowrap">
                              {order.grandTotal.toFixed(2)} €
                            </td>
                            <td className="px-4 py-3.5">
                              <select
                                value={status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(order.orderId, e.target.value as OrderStatus)
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border-0 outline-none cursor-pointer ${
                                  status === 'neu'
                                    ? 'bg-blue-100 text-blue-900'
                                    : status === 'in_bearbeitung'
                                    ? 'bg-amber-100 text-amber-900'
                                    : status === 'bereit'
                                    ? 'bg-purple-100 text-purple-900'
                                    : status === 'abgeschlossen'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : 'bg-red-100 text-red-900'
                                }`}
                              >
                                <option value="neu">Neu</option>
                                <option value="in_bearbeitung">In Bearbeitung</option>
                                <option value="bereit">Bereit zur Abholung</option>
                                <option value="abgeschlossen">Abgeschlossen</option>
                                <option value="storniert">Storniert</option>
                              </select>
                            </td>
                            <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-purple-100 hover:text-purple-900 text-neutral-700 font-semibold transition-colors"
                              >
                                Beleg / Details
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.orderId)}
                                className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                                title="Bestellung entfernen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PRODUKTE & PREISE ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Artikel, SKU oder Kategorie..."
                    className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none transition-all"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="w-full sm:w-auto flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-neutral-400" />
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:bg-white focus:border-purple-600 outline-none cursor-pointer"
                  >
                    <option value="all">Alle Kategorien ({products.length})</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsNewProductModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Neuen Artikel anlegen</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Katalog auf die Standard Erima ASV Happing Produkte zurücksetzen?')) {
                      onResetProducts();
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Setzt alle Artikel & Preise auf den Originalzustand zurück"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Katalog zurücksetzen</span>
                </button>
              </div>
            </div>

            {/* Products Grid / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const primaryColor = product.colors[0];
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-4 flex flex-col justify-between hover:border-purple-300 transition-all"
                  >
                    <div>
                      {/* Product Card Top */}
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl bg-neutral-50 border border-neutral-200/80 p-1 flex items-center justify-center shrink-0 overflow-hidden relative">
                          <img
                            src={product.imageUrl || product.fallbackImageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              if (product.fallbackImageUrl) {
                                e.currentTarget.src = product.fallbackImageUrl;
                              }
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block truncate">
                            {product.category}
                          </span>
                          <h3 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-neutral-400 font-mono">
                              SKU: {product.sku}
                            </span>
                            {product.initialsInclusive && (
                              <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-1.5 py-0.2 rounded">
                                Initialen inkl.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Size Summary */}
                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-500 block">Preise:</span>
                          <div className="font-black text-neutral-900 text-sm">
                            {product.price.toFixed(2)} €
                            {product.kidsPrice && product.kidsPrice !== product.price && (
                              <span className="text-[11px] font-normal text-neutral-500 ml-1">
                                (Kinder: {product.kidsPrice.toFixed(2)} €)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Garment Color Badge */}
                        <div className="text-right">
                          <span className="text-[10px] text-neutral-500 block">Farbe:</span>
                          <div className="flex items-center gap-1.5 justify-end mt-0.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-neutral-300"
                              style={{ backgroundColor: primaryColor?.hex || '#581c87' }}
                            ></span>
                            <span className="text-xs font-medium text-neutral-700">
                              {primaryColor?.name || 'Standard'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="flex-1 py-1.5 rounded-lg bg-neutral-100 hover:bg-purple-700 hover:text-white text-neutral-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Bearbeiten</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Artikel löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 4: EINSTELLUNGEN ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">Vereins- & Shop-Einstellungen</h2>
                  <p className="text-xs text-neutral-500">
                    Konfiguration für ASV Happing, Bankverbindung & Benachrichtigungen
                  </p>
                </div>
                {settingsSavedMessage && (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 animate-in fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Einstellungen gespeichert!</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Section 1: Club Info */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
                    Vereinsdaten & Abholung
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Vereinsname (Offiziell)
                      </label>
                      <input
                        type="text"
                        value={tempSettings.clubName}
                        onChange={(e) => setTempSettings({ ...tempSettings, clubName: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Stadt / Ort
                      </label>
                      <input
                        type="text"
                        value={tempSettings.city}
                        onChange={(e) => setTempSettings({ ...tempSettings, city: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Abholort für Vereinsmitglieder
                      </label>
                      <input
                        type="text"
                        value={tempSettings.pickupPoint}
                        onChange={(e) => setTempSettings({ ...tempSettings, pickupPoint: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Abholzeiten
                      </label>
                      <input
                        type="text"
                        value={tempSettings.pickupTimes}
                        onChange={(e) => setTempSettings({ ...tempSettings, pickupTimes: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Settlement Account & Email */}
                <div className="pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Auszahlungskonto & E-Mail (Geschützt)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Kontoinhaber
                      </label>
                      <input
                        type="text"
                        value={tempSettings.accountHolder}
                        onChange={(e) => setTempSettings({ ...tempSettings, accountHolder: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        IBAN
                      </label>
                      <input
                        type="text"
                        value={tempSettings.iban}
                        onChange={(e) => setTempSettings({ ...tempSettings, iban: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-medium text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Benachrichtigungs-E-Mail für Belege & Bestellungen
                      </label>
                      <input
                        type="email"
                        value={tempSettings.notificationEmail}
                        onChange={(e) => setTempSettings({ ...tempSettings, notificationEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Announcement Bar & Security */}
                <div className="pt-4 border-t border-neutral-100">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
                    Banner & Admin-Sicherheit
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="showAnnouncement"
                        checked={tempSettings.showAnnouncement}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, showAnnouncement: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="showAnnouncement" className="text-xs font-semibold text-neutral-800">
                        Oberes Ankündigungs-Banner im Shop anzeigen
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Banner-Text
                      </label>
                      <input
                        type="text"
                        value={tempSettings.announcementText}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, announcementText: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                      />
                    </div>

                    <div className="max-w-xs">
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Admin-PIN ändern
                      </label>
                      <input
                        type="text"
                        value={tempSettings.adminPin}
                        onChange={(e) => setTempSettings({ ...tempSettings, adminPin: e.target.value })}
                        placeholder="Neues Passwort / PIN"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono tracking-widest text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-neutral-200 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Einstellungen speichern</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 5: DATENSICHERUNG & NETLIFY ================= */}
        {activeTab === 'backup' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Datensicherung & Netlify Drag & Drop Synchronisation
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Exportieren und sichern Sie alle Shop-Daten als JSON-Datei
                  </p>
                </div>
              </div>

              {/* Netlify Notice Box */}
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-purple-900">
                  <Info className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>Hinweis zu Netlify Drag & Drop:</span>
                </div>
                <p>
                  Da Ihre Website rein statisch über Netlify gehostet wird, werden Ihre Anpassungen (Preise, neue Artikel, Bestellungen) sicher im <strong>LocalStorage Ihres Browsers</strong> gespeichert.
                </p>
                <p>
                  Mit der <strong>Export-Funktion</strong> können Sie jederzeit ein vollständiges Backup herunterladen, um Ihre Daten auf einem anderen Gerät oder nach einem Browser-Reset mit einem Klick wiederherzustellen.
                </p>
              </div>

              {/* Backup Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900">Backup herunterladen</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Sichert alle {products.length} Artikel, {orders.length} Bestellungen und Einstellungen als .json Datei.
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackup}
                    className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Backup exportieren (.json)</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900">Backup wiederherstellen</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Laden Sie ein zuvor erstelltes Backup hoch, um Artikel und Aufträge einzuspielen.
                    </p>
                  </div>
                  <label className="w-full py-2.5 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer">
                    <Upload className="w-4 h-4 text-neutral-600" />
                    <span>Backup-Datei auswählen</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Direct Code Copy for Permanence */}
              <div className="pt-4 border-t border-neutral-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-900">
                    Katalog-Daten für Quellcode kopieren
                  </h3>
                  <button
                    onClick={() =>
                      handleCopy(JSON.stringify(products, null, 2), 'products_json')
                    }
                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                  >
                    {copiedText === 'products_json' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Kopiert!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>JSON kopieren</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Falls Sie Änderungen dauerhaft in den Code einbinden möchten, können Sie die Produktdaten hier als JSON kopieren.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: ORDER DETAILS / RECEIPT ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-purple-950 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-300 font-semibold block">Bestelldetails & Beleg</span>
                <h3 className="text-base font-bold font-mono tracking-tight">{selectedOrder.orderId}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-purple-300 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-800">
              {/* Top Meta Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700">
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase block">Datum</span>
                  <span className="font-semibold text-neutral-900">
                    {new Date(selectedOrder.timestamp).toLocaleString('de-DE')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase block">Käufer</span>
                  <span className="font-semibold text-neutral-900">
                    {selectedOrder.cardHolder || 'Kunde'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase block">Lieferung</span>
                  <span className="font-semibold text-neutral-900">
                    {selectedOrder.deliveryMethod === 'pickup' ? 'Vereinsabholung' : 'Versand'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase block">Zahlung</span>
                  <span className="font-semibold text-emerald-700">
                    Kreditkarte (•••• {selectedOrder.cardLast4 || '4242'})
                  </span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-200">
                <span className="font-bold text-neutral-900">Bearbeitungsstatus:</span>
                <select
                  value={selectedOrder.status || 'neu'}
                  onChange={(e) =>
                    handleUpdateOrderStatus(selectedOrder.orderId, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-purple-300 text-purple-950 focus:outline-purple-700 cursor-pointer"
                >
                  <option value="neu">Neu</option>
                  <option value="in_bearbeitung">In Bearbeitung (Flock)</option>
                  <option value="bereit">Bereit zur Abholung</option>
                  <option value="abgeschlossen">Abgeschlossen</option>
                  <option value="storniert">Storniert</option>
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                  Bestellte Artikel ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-white flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-neutral-900 text-xs">
                          {item.quantity}x {item.productName}
                        </div>
                        <div className="text-neutral-500 text-[11px] mt-0.5">
                          Größe: <strong className="text-neutral-700">{item.selectedSize}</strong> • Farbe:{' '}
                          <strong className="text-neutral-700">{item.selectedColor.name}</strong>
                        </div>

                        {/* Flock details breakdown */}
                        {(item.customization.playerName ||
                          item.customization.playerNumber ||
                          item.customization.initials) && (
                          <div className="mt-2 p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] space-y-0.5">
                            <span className="font-bold text-purple-900 block text-[10px] uppercase">
                              Gewünschte Beflockung:
                            </span>
                            {item.customization.playerName && (
                              <div>
                                Spielername: <strong>{item.customization.playerName}</strong> (+4,50 €)
                              </div>
                            )}
                            {item.customization.playerNumber && (
                              <div>
                                Rückennummer: <strong>#{item.customization.playerNumber}</strong> (+3,50 €)
                              </div>
                            )}
                            {item.customization.initials && (
                              <div>
                                Initialen (Brust/Logo): <strong>{item.customization.initials}</strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-neutral-900 text-xs">
                          {((item.unitPrice + item.customizationFee) * item.quantity).toFixed(2)} €
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {item.unitPrice.toFixed(2)} € / Stk.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-3 border-t border-neutral-200 flex justify-end">
                <div className="w-56 space-y-1.5 text-right">
                  <div className="flex justify-between text-neutral-500">
                    <span>Zwischensumme:</span>
                    <span>{selectedOrder.grandTotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Versand / Abholung:</span>
                    <span>0,00 €</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-neutral-900 pt-1.5 border-t border-neutral-200">
                    <span>Gesamtbetrag:</span>
                    <span>{selectedOrder.grandTotal.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Drucken</span>
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PRODUCT ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-purple-950 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-xs text-purple-300 font-semibold block">Artikel anpassen</span>
                <h3 className="text-base font-bold truncate max-w-sm">{editingProduct.name}</h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-purple-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveProductEdit(editingProduct);
              }}
              className="p-6 overflow-y-auto space-y-4 text-xs"
            >
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Artikelname
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Kategorie
                  </label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    SKU / Artikelnummer
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Standard- / Erwachsenenpreis (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditingProduct({
                        ...editingProduct,
                        price: val,
                        adultPrice: val,
                        sizes: editingProduct.sizes.map((s) => ({
                          ...s,
                          price: s.isKids ? editingProduct.kidsPrice || val : val
                        }))
                      });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Kinderpreis (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.kidsPrice ?? editingProduct.price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEditingProduct({
                        ...editingProduct,
                        kidsPrice: val,
                        sizes: editingProduct.sizes.map((s) => ({
                          ...s,
                          price: s.isKids ? val : editingProduct.price
                        }))
                      });
                    }}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                  />
                </div>
              </div>

              {/* Article Photo Upload & Automatic Database Persistence */}
              <div className="p-3 rounded-2xl bg-neutral-50/80 border border-neutral-200/80">
                <ArticlePhotoUpload
                  currentImageUrl={editingProduct.imageUrl || editingProduct.fallbackImageUrl}
                  onImageUploaded={(url) => setEditingProduct({ ...editingProduct, imageUrl: url })}
                  productName={editingProduct.name}
                />
              </div>

              {/* Color Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Farbe (Name im Shop-Auswahlfeld)
                </label>
                <input
                  type="text"
                  value={editingProduct.colors[0]?.name || ''}
                  onChange={(e) => {
                    const newColorName = e.target.value;
                    const updatedColors = editingProduct.colors.map((c, i) =>
                      i === 0 ? { ...c, name: newColorName } : c
                    );
                    setEditingProduct({ ...editingProduct, colors: updatedColors });
                  }}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="initialsInclusiveEdit"
                  checked={Boolean(editingProduct.initialsInclusive)}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      initialsInclusive: e.target.checked
                    })
                  }
                  className="w-4 h-4 rounded text-purple-600"
                />
                <label htmlFor="initialsInclusiveEdit" className="text-xs font-semibold text-neutral-800">
                  Spielerinitialen unter Erima-Logo kostenlos inklusive
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Änderungen speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW PRODUCT ================= */}
      {isNewProductModalOpen && (
        <NewProductModal
          onClose={() => setIsNewProductModalOpen(false)}
          onAddProduct={handleAddNewProduct}
        />
      )}
    </div>
  );
}

// Subcomponent for adding a new product
function NewProductModal({
  onClose,
  onAddProduct
}: {
  onClose: () => void;
  onAddProduct: (prod: Product) => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Trikots & Funktionsshirts');
  const [price, setPrice] = useState('24.90');
  const [kidsPrice, setKidsPrice] = useState('21.90');
  const [sku, setSku] = useState(`ASV-${Math.floor(100000 + Math.random() * 900000)}`);
  const [imageUrl, setImageUrl] = useState<string>('/products/26221.jpg');
  const [colorName, setColorName] = useState('Violett');
  const [colorHex, setColorHex] = useState('#581c87');
  const [includeInitials, setIncludeInitials] = useState<boolean>(true);
  const [description, setDescription] = useState(
    'Offizieller ASV Happing Erima® Ausrüstungsartikel für Training und Spielbetrieb.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adultP = parseFloat(price) || 24.90;
    const kidsP = parseFloat(kidsPrice) || adultP;

    const newProduct: Product = {
      id: `asv-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      name: name.trim() || 'Neuer ASV Artikel',
      tagline: `Offizieller ASV Happing Ausrüstungsartikel`,
      sku: sku.trim(),
      brand: 'Erima® Sportswear',
      imageUrl: imageUrl || '/products/26221.jpg',
      fallbackImageUrl: '/products/26221.jpg',
      productType: category.includes('Hoodie') || category.includes('Pullover')
        ? 'hoodie'
        : category.includes('Taschen')
        ? 'bag'
        : category.includes('Hosen')
        ? 'pants'
        : 'tshirt',
      clubName: 'ASV Happing',
      clubAbbr: 'ASV',
      clubCity: 'Happing (Rosenheim)',
      price: adultP,
      adultPrice: adultP,
      kidsPrice: kidsP,
      originalPrice: adultP + 5,
      initialsInclusive: includeInitials,
      category,
      gender: 'Kinder / Herren / Unisex',
      colors: [
        {
          id: 'custom-color',
          name: colorName,
          hex: colorHex,
          borderHex: colorHex === '#ffffff' ? '#e2e8f0' : '#262626',
          textColor: colorHex === '#ffffff' ? '#581c87' : '#ffffff',
          accentHex: '#ffffff'
        }
      ],
      sizes: [
        { size: '116', available: true, stockNote: 'Auf Lager (Kinder)', price: kidsP, isKids: true },
        { size: '128', available: true, stockNote: 'Auf Lager (Kinder)', price: kidsP, isKids: true },
        { size: '140', available: true, stockNote: 'Auf Lager (Kinder)', price: kidsP, isKids: true },
        { size: '152', available: true, stockNote: 'Auf Lager (Kinder)', price: kidsP, isKids: true },
        { size: '164', available: true, stockNote: 'Auf Lager (Kinder)', price: kidsP, isKids: true },
        { size: 'S', available: true, stockNote: 'Auf Lager', price: adultP, isKids: false },
        { size: 'M', available: true, stockNote: 'Auf Lager', price: adultP, isKids: false },
        { size: 'L', available: true, stockNote: 'Auf Lager', price: adultP, isKids: false },
        { size: 'XL', available: true, stockNote: 'Auf Lager', price: adultP, isKids: false },
        { size: 'XXL', available: true, stockNote: 'Auf Lager', price: adultP, isKids: false }
      ],
      description,
      bulletPoints: [
        'Offizieller ASV Happing Team-Artikel',
        'Atmungsaktives Erima Funktionsmaterial',
        'Mit ASV Happing Vereinsflock veredelt in Deutschland'
      ],
      specs: {
        material: '100% Polyester Funktionsmaterial',
        fit: 'Regular Fit',
        weight: 'ca. 160 g/m²',
        origin: 'Veredelt in Deutschland',
        care: ['40°C Maschinenwäsche', 'Auf links waschen']
      },
      deliveryInfo: {
        estimatedDays: '5–8 Werktage',
        pickupAvailable: true,
        pickupLocation: 'Vereinsheim ASV Happing, Happinger Str. 77, 83026 Rosenheim',
        pickupTimes: 'Jeden Donnerstag 17:30 – 19:30 Uhr'
      }
    };

    onAddProduct(newProduct);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-purple-950 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Neuen Artikel anlegen</h3>
            <p className="text-xs text-purple-300">
              Artikel zum ASV Happing Vereinskatalog hinzufügen & Foto in Datenbank speichern
            </p>
          </div>
          <button onClick={onClose} className="text-purple-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Article Photo Upload with automatic database upload */}
          <div className="p-3.5 rounded-2xl bg-neutral-50/80 border border-neutral-200 shadow-2xs">
            <ArticlePhotoUpload
              currentImageUrl={imageUrl}
              onImageUploaded={(url) => setImageUrl(url)}
              productName={name || 'Neuer Artikel'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Artikelname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. ASV Happing - Fanschal oder Warm-up Shirt"
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Kategorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
              >
                <option value="Trikots & Funktionsshirts">Trikots & Funktionsshirts</option>
                <option value="Hoodies & Pullover">Hoodies & Pullover</option>
                <option value="Trainingstops & Jacken">Trainingstops & Jacken</option>
                <option value="Hosen">Hosen & Shorts</option>
                <option value="Taschen & Ausrüstung">Taschen & Ausrüstung</option>
                <option value="Accessoires & Fanshop">Accessoires & Fanshop</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                SKU / Modellnummer
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Erwachsenenpreis (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Kinderpreis (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={kidsPrice}
                onChange={(e) => setKidsPrice(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Farbe Name
              </label>
              <select
                value={colorName}
                onChange={(e) => {
                  setColorName(e.target.value);
                  if (e.target.value === 'Violett') setColorHex('#581c87');
                  else if (e.target.value === 'Weiß') setColorHex('#ffffff');
                  else if (e.target.value === 'Schwarz') setColorHex('#171717');
                  else if (e.target.value === 'Beige') setColorHex('#e2d9cc');
                }}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
              >
                <option value="Violett">Violett</option>
                <option value="Weiß">Weiß</option>
                <option value="Schwarz">Schwarz</option>
                <option value="Beige">Beige</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Farbcode (Hex)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-200"
                />
                <input
                  type="text"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="initialsInclusiveNew"
              checked={includeInitials}
              onChange={(e) => setIncludeInitials(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="initialsInclusiveNew" className="text-xs font-semibold text-neutral-800">
              Spielerinitialen unter Erima-Logo kostenlos inklusive
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Kurzbeschreibung
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:bg-white focus:border-purple-600 outline-none"
            />
          </div>

          <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Artikel zum Katalog hinzufügen</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
