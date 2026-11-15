import React from 'react';
import { Star, ShieldCheck, Truck, CheckCircle2, MessageCircle, ShoppingBag, Clock, Sparkles, Tag, Check } from 'lucide-react';
import { Product, ProductPackOption, StoreSettings } from '../types';
import { ProductGallery } from './ProductGallery';
import { trackActionClick } from '../utils/analyticsTracker';

interface HeroSectionProps {
  product: Product;
  settings: StoreSettings;
  onBuyNowClick: () => void;
  selectedPackId?: string | null;
  onSelectPack?: (packId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  product,
  settings,
  onBuyNowClick,
  selectedPackId,
  onSelectPack
}) => {
  if (!product) {
    return (
      <section id="hero" className="py-12 bg-neutral-50 text-center">
        <div className="max-w-md mx-auto p-8 bg-white rounded-3xl border border-neutral-200 shadow-sm">
          <p className="text-neutral-600 font-bold">No featured product currently selected.</p>
          <p className="text-xs text-neutral-400 mt-1">Select a featured product from the Admin Product Catalog.</p>
        </div>
      </section>
    );
  }

  const safeImages = (product.images && product.images.length > 0)
    ? product.images
    : [
        '/uploads/products-2026_08_10_8199dd40342051f2b8e-1790410943014.jpg',
        '/uploads/products-2025_10_25_0f3cc2f232bcb5c3857-1790410944169.jpg'
      ];

  const packOptions: ProductPackOption[] = Array.isArray(product.packOptions)
    ? product.packOptions.filter((p) => p && p.label)
    : [];

  const activePack: ProductPackOption | null =
    packOptions.find((p) => p.id === selectedPackId) ||
    packOptions.find((p) => p.isDefault && p.inStock !== false) ||
    packOptions.find((p) => p.inStock !== false) ||
    packOptions[0] ||
    null;

  const sale = activePack ? activePack.price : (product?.salePrice || 0);
  const regular = activePack
    ? (activePack.regularPrice && activePack.regularPrice > activePack.price ? activePack.regularPrice : activePack.price)
    : (product?.regularPrice || product?.salePrice || 0);
  const discountPercent = regular > sale ? Math.round(((regular - sale) / regular) * 100) : 0;
  const savingsAmount = Math.max(0, regular - sale);

  const standardPacks = packOptions.filter((p) => !p.discountText || !p.discountText.trim());
  const offerPacks = packOptions.filter((p) => p.discountText && p.discountText.trim());

  // WhatsApp link preparation
  const cleanNumber = (settings?.whatsappNumber || '03082494870').replace(/[^0-9]/g, '');
  const internationalNumber = cleanNumber.startsWith('0') ? '92' + cleanNumber.slice(1) : (cleanNumber || '923082494870');
  const rawMsg = settings?.whatsappPrefilledMessage || 'Assalam-o-Alaikum Ammi Express, I need information about {product}.';
  const productWithPack = activePack
    ? `${product?.title || 'Ammi Express Smart Product'} (${activePack.label} - Rs. ${activePack.price.toLocaleString()})`
    : (product?.title || 'Ammi Express Smart Product');
  const encodedMsg = encodeURIComponent(
    rawMsg.replace('{product}', productWithPack)
  );
  const whatsappUrl = `https://wa.me/${internationalNumber}?text=${encodedMsg}`;

  return (
    <section id="hero" className="py-6 md:py-12 bg-gradient-to-b from-[#FFF9E6]/60 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Desktop: 2-column (Left: Info, Right: Gallery) | Mobile: Gallery on top */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Gallery Column (Desktop Right, Mobile First) */}
          <div className="w-full lg:col-span-6 lg:order-2">
            <ProductGallery
              images={safeImages}
              productTitle={product?.title || 'Product'}
              badge={product?.badge}
              videoUrl={product?.productVideoLink || product?.videoUrl}
            />
          </div>

          {/* Info Column (Desktop Left, Mobile Second) */}
          <div className="w-full lg:col-span-6 lg:order-1 flex flex-col space-y-4 md:space-y-5">
            
            {/* Top Micro Badges */}
            <div className="flex items-center flex-wrap gap-2 text-xs">
              <span className="bg-[#F5B800]/20 text-[#8C6000] font-extrabold px-3 py-1 rounded-full border border-[#F5B800]/40">
                {settings?.heroSettings?.badge || 'Official Ammi Express'}
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                In Stock ({product?.stockCount ?? 50} left)
              </span>
              {settings?.heroSettings?.saleNotice && (
                <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                  {settings.heroSettings.saleNotice}
                </span>
              )}
            </div>

            {/* Headline & Title */}
            <div>
              <p className="text-xs md:text-sm font-bold tracking-wider uppercase text-[#F5B800] mb-1">
                {settings?.heroSettings?.subheading || product?.headline}
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#171717] tracking-tight leading-snug">
                {settings?.heroSettings?.heading || product?.title}
                {settings?.heroSettings?.headingHighlight && (
                  <span className="text-[#F5B800] block mt-1">
                    {settings.heroSettings.headingHighlight}
                  </span>
                )}
              </h1>
            </div>

            {/* Ratings & Social Proof */}
            <div className="flex items-center gap-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-extrabold text-sm text-[#171717]">
                {(typeof product?.rating === 'number' && !isNaN(product.rating) ? product.rating : 4.9).toFixed(1)}
              </span>
              <span className="text-neutral-400 text-sm">•</span>
              <a
                href="#reviews"
                className="text-xs md:text-sm font-semibold text-neutral-600 hover:text-black underline underline-offset-2"
              >
                {product?.reviewCount || 120} verified Pakistani reviews
              </a>
            </div>

            {/* Pricing Showcase */}
            <div className="bg-[#FFF9E6] border border-[#F5B800]/40 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
                  Rs. {(sale ?? 0).toLocaleString()}
                </span>
                {regular > sale && (
                  <span className="text-lg sm:text-xl text-neutral-500 line-through font-medium">
                    Rs. {(regular ?? 0).toLocaleString()}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-[#C62828] text-white text-xs font-black px-2.5 py-1 rounded-md tracking-wide">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              {(savingsAmount > 0 || activePack?.discountText) && (
                <div className="mt-2 text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-1.5 flex-wrap">
                  <Sparkles className="w-4 h-4 text-[#F5B800] shrink-0" />
                  <span>
                    {savingsAmount > 0 ? `You Save: Rs. ${savingsAmount.toLocaleString()} today!` : ''}
                    {savingsAmount > 0 && activePack?.discountText ? ' • ' : ''}
                    {activePack?.discountText ? activePack.discountText : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Framed Pack Size & Discount Offer Selector (Side Panel) */}
            {packOptions.length > 0 && (
              <div
                aria-label="Select Pack Size and Discount Offer"
                className="rounded-2xl border-2 border-[#E7C973] bg-gradient-to-br from-[#FFFEFA] via-white to-[#FFF8E1]/75 p-4 shadow-sm"
              >
                {/* Frame Header */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#EFE3BD]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                      Pack Size:
                    </span>
                    <span className="text-sm font-black text-[#171717]">
                      {activePack?.label} — Rs. {(activePack?.price ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#16803D] shrink-0">
                    Choose Weight &amp; Offer
                  </span>
                </div>

                {/* Standard Weight Options (e.g., 500g, 1 KG) */}
                {standardPacks.length > 0 && (
                  <div className={`grid gap-2.5 ${standardPacks.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {standardPacks.map((pack) => {
                      const isSelected = activePack?.id === pack.id;
                      const isDisabled = pack.inStock === false;
                      return (
                        <button
                          key={pack.id}
                          type="button"
                          disabled={isDisabled}
                          aria-pressed={isSelected}
                          onClick={() => onSelectPack?.(pack.id)}
                          className={`group relative text-left rounded-xl p-3 border-2 transition-all duration-150 min-h-[68px] flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B800] ${
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed bg-neutral-100 border-neutral-200'
                              : isSelected
                              ? 'border-[#171717] bg-[#FFF9E6] ring-2 ring-[#F5B800]/35 shadow-sm'
                              : 'border-neutral-200/90 bg-white hover:border-[#F5B800] hover:bg-[#FFFDF7]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <span className="text-sm sm:text-base font-black text-[#171717] block leading-tight">
                                {pack.label}
                              </span>
                              {(pack.sublabel || pack.badge) && (
                                <span className={`text-[11px] font-semibold block mt-0.5 ${isSelected ? 'text-[#8C6000]' : 'text-neutral-500'}`}>
                                  {pack.sublabel || pack.badge}
                                </span>
                              )}
                            </div>
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                                isSelected
                                  ? 'bg-[#171717] border-[#171717] text-[#F5B800]'
                                  : 'border-neutral-300 bg-white group-hover:border-[#F5B800]'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                          </div>

                          <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-sm sm:text-base font-black text-[#171717]">
                              Rs. {pack.price.toLocaleString()}
                            </span>
                            {pack.regularPrice && pack.regularPrice > pack.price && (
                              <span className="text-[11px] text-neutral-400 line-through font-medium">
                                Rs. {pack.regularPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Discount Offer Pack Options (e.g., 2 KG Discount Offer, 3 KG Best Value) */}
                {offerPacks.length > 0 && (
                  <div className={`space-y-2 ${standardPacks.length > 0 ? 'mt-2.5' : ''}`}>
                    {offerPacks.map((pack) => {
                      const isSelected = activePack?.id === pack.id;
                      const isDisabled = pack.inStock === false;
                      return (
                        <button
                          key={pack.id}
                          type="button"
                          disabled={isDisabled}
                          aria-pressed={isSelected}
                          onClick={() => onSelectPack?.(pack.id)}
                          className={`group w-full text-left rounded-xl px-3.5 py-3 border-2 transition-all duration-150 min-h-[56px] flex items-center justify-between gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B800] ${
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed bg-neutral-100 border-neutral-200'
                              : isSelected
                              ? 'border-[#171717] bg-gradient-to-r from-[#FFF9E6] to-[#ECFDF5]/60 ring-2 ring-[#F5B800]/40 shadow-sm'
                              : 'border-[#E6D5A7] bg-white hover:border-[#16803D] hover:bg-[#F7FDF9]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                                isSelected
                                  ? 'bg-[#171717] border-[#171717] text-[#F5B800]'
                                  : 'border-neutral-300 bg-white group-hover:border-[#16803D]'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm sm:text-base font-black text-[#171717]">
                                  {pack.label}
                                </span>
                                {pack.sublabel && (
                                  <span className="text-xs font-medium text-neutral-500">
                                    · {pack.sublabel}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#16803D] mt-0.5">
                                <Tag className="w-3.5 h-3.5 shrink-0" />
                                <span>{pack.discountText}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm sm:text-base font-black text-[#171717] block">
                              Rs. {pack.price.toLocaleString()}
                            </span>
                            {pack.regularPrice && pack.regularPrice > pack.price && (
                              <span className="text-[11px] text-neutral-400 line-through font-medium block">
                                Rs. {pack.regularPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Short Description */}
            <p className="text-sm md:text-base text-neutral-700 leading-relaxed">
              {product?.shortDescription}
            </p>

            {/* Dynamic Product Benefits / Key Features */}
            {(() => {
              const activeBenefits = (product?.benefits || [])
                .filter((b) => b.enabled !== false && ((b.text && b.text.trim()) || (b.title && b.title.trim())))
                .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

              if (activeBenefits.length === 0) return null;

              return (
                <div id="product-hero-benefits" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {activeBenefits.map((benefit) => (
                    <div
                      key={benefit.id}
                      className="flex items-center gap-2 text-xs md:text-sm font-semibold text-neutral-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#16803D] shrink-0" />
                      <span>{benefit.text || benefit.title}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* CTAs Section (Section 9 & 24) */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Buy Now CTA */}
              <button
                type="button"
                onClick={() => {
                  trackActionClick('cod_button');
                  onBuyNowClick();
                }}
                className="flex-1 bg-[#171717] hover:bg-[#F5B800] text-white hover:text-black font-extrabold text-base sm:text-lg py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer transform active:scale-98"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{settings?.heroSettings?.buttonText || 'Order Cash On Delivery Now'}</span>
              </button>

              {/* Order on WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackActionClick('whatsapp_button')}
                className="bg-[#16803D] hover:bg-[#126830] text-white font-extrabold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-center"
              >
                <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Trust Badges below CTA */}
            <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between gap-2 text-[11px] sm:text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#F5B800]" />
                <span>Rs. {settings.deliveryCharge} Flat Nationwide Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#16803D]" />
                <span>Open &amp; Check Parcel</span>
              </div>
              <div className="flex items-center gap-1.5 hidden sm:flex">
                <Clock className="w-4 h-4 text-neutral-500" />
                <span>2-4 Business Days</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
