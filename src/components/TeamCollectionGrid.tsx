import { useState, useMemo } from 'react';
import { Layers, ArrowRight, Check } from 'lucide-react';
import { Product } from '../types';

interface TeamCollectionGridProps {
  products: Product[];
  currentProductId: string;
  onSelectProduct: (product: Product) => void;
}

export default function TeamCollectionGrid({
  products,
  currentProductId,
  onSelectProduct
}: TeamCollectionGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ['Alle', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Alle') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const handleChoose = (product: Product) => {
    onSelectProduct(product);
    const stage = document.getElementById('product-main');
    if (stage) {
      stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="collection-grid" className="mt-16 pt-12 border-t border-neutral-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-800 mb-1.5">
            <Layers className="w-4 h-4" />
            <span>Offizielle Vereinskollektion</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Alle Vereinsartikel entdecken ({products.length})
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Wähle einen Artikel aus der Kollektion, um Größe, Farbe und Beflockung individuell anzupassen.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredProducts.map((product) => {
          const isActive = product.id === currentProductId;
          const displayImage = product.imageUrl || product.fallbackImageUrl || '';
          const minPrice = product.kidsPrice && product.kidsPrice < product.price ? product.kidsPrice : product.price;

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => handleChoose(product)}
              className={`group text-left rounded-2xl border p-4 transition-all flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'border-purple-700 bg-purple-50/40 ring-2 ring-purple-600/30 shadow-md'
                  : 'border-neutral-200 bg-white hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="aspect-square w-full rounded-xl bg-neutral-50 border border-neutral-100 overflow-hidden mb-3.5 flex items-center justify-center relative">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={product.name}
                      onError={(e) => {
                        if (product.fallbackImageUrl && e.currentTarget.src !== product.fallbackImageUrl) {
                          e.currentTarget.src = product.fallbackImageUrl;
                        }
                      }}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs font-bold text-neutral-400">{product.sku}</span>
                  )}

                  {isActive && (
                    <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-900 text-white text-[10px] font-bold">
                      <Check className="w-3 h-3" />
                      Aktiv
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                  {product.category}
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mt-0.5 line-clamp-2 group-hover:text-purple-900">
                  {product.name}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                  {product.tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-extrabold text-neutral-900">
                    {product.kidsPrice && product.kidsPrice !== product.price ? 'ab ' : ''}
                    {minPrice.toFixed(2)} €
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-[11px] text-neutral-400 line-through">
                      UVP {product.originalPrice.toFixed(2)} €
                    </div>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-800 group-hover:translate-x-0.5 transition-transform">
                  <span>Wählen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
