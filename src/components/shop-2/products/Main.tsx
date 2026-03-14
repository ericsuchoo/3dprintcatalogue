import React, { useMemo, useState } from "react";
import { ProductCardD1 as ProductCard } from "../../ProductCardD1";
import { useFavorites } from "../../../context/FavoritesContext";
import type { ShopPageDataD1, ProductLiteD1 } from "../../../types/shop-d1";

interface Props {
  data: ShopPageDataD1;
}

export const Main: React.FC<Props> = ({ data }) => {
  const { favorites } = useFavorites();
  const [searchVal, setSearchVal] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const products = (data.products || []) as ProductLiteD1[];

  const favoriteProducts = useMemo(() => {
    return products.filter((p) => favorites.includes(String(p.slug)));
  }, [products, favorites]);

  const filteredProducts = useMemo(() => {
    if (!searchVal) return favoriteProducts;

    return favoriteProducts.filter((p) => {
      const haystack =
        `${p.title} ${p.subtitle || ""} ${p.description || ""}`.toLowerCase();

      return haystack.includes(searchVal.toLowerCase());
    });
  }, [favoriteProducts, searchVal]);

  const favoriteProductIds = useMemo(() => {
    return favoriteProducts
      .map((p) => Number(p.id))
      .filter((id) => Number.isInteger(id) && id > 0);
  }, [favoriteProducts]);

  const generateShareUrl = async (): Promise<string> => {
    if (!favoriteProductIds.length) {
      throw new Error("No hay favoritos para compartir");
    }

    const response = await fetch("/api/share-favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productIds: favoriteProductIds,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result?.shareUrl) {
      throw new Error(result?.error || "No se pudo generar la lista");
    }

    setShareUrl(result.shareUrl);
    return result.shareUrl as string;
  };

  const handleNativeShare = async () => {
    try {
      setIsSharing(true);

      const url = shareUrl || (await generateShareUrl());

      if (navigator.share) {
        await navigator.share({
          title: "Mis favoritos DCimpress 3D Store",
          text: "Te comparto mi lista de favoritos",
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      alert("Enlace copiado al portapapeles");
    } catch (error) {
      console.error(error);
      alert("No se pudo compartir la lista");
    } finally {
      setIsSharing(false);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      setIsSharing(true);

      const url = shareUrl || (await generateShareUrl());
      const text = encodeURIComponent(
        `Te comparto mi lista de favoritos de DCimpress 3D Store: ${url}`
      );

      window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error(error);
      alert("No se pudo abrir WhatsApp");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      setIsSharing(true);

      const url = shareUrl || (await generateShareUrl());
      await navigator.clipboard.writeText(url);
      alert("Enlace copiado al portapapeles");
    } catch (error) {
      console.error(error);
      alert("No se pudo copiar el enlace");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen px-4 md:px-6 pt-24 md:pt-28 pb-8">
      <div className="grid grid-cols-1 gap-x-10 gap-y-10 items-start lg:grid-cols-[240px,1fr]">
        <div className="sticky top-28">
          <div className="grid grid-cols-1 gap-6 border border-[#00eeff] p-6 md:p-8 bg-[#0f0f0f] rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">❤️</span>
              <div className="text-2xl leading-none font-bold italic text-red-500">
                Mis Me gusta
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-black text-zinc-300">
              <span className="text-red-400">Guardados:</span>
              <span className="text-white">{favoriteProducts.length}</span>
            </div>

            <div className="text-sm text-zinc-400 leading-relaxed">
              Aquí se muestran únicamente los productos que marcaste como favoritos.
            </div>

            {favoriteProducts.length > 0 && (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  disabled={isSharing}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-[#00eeff]/40 text-[#00eeff] bg-[#00eeff]/10 hover:bg-[#00eeff]/20 transition uppercase tracking-[0.18em] font-black text-[10px] disabled:opacity-50"
                >
                  {isSharing ? "Generando..." : "Compartir lista"}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  disabled={isSharing}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-green-500/40 text-green-400 bg-green-500/10 hover:bg-green-500/20 transition uppercase tracking-[0.18em] font-black text-[10px] disabled:opacity-50"
                >
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={isSharing}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-full border border-white/10 text-white/80 bg-white/5 hover:bg-white/10 hover:border-white/30 transition uppercase tracking-[0.18em] font-black text-[10px] disabled:opacity-50"
                >
                  Copiar enlace
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase italic text-white tracking-tight">
                <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  Mis favoritos
                </span>
              </h1>

              <p className="text-xs md:text-sm text-zinc-500 uppercase tracking-[0.18em] mt-2 font-bold">
                {favoriteProducts.length} producto{favoriteProducts.length === 1 ? "" : "s"} guardado
                {favoriteProducts.length === 1 ? "" : "s"}
              </p>
            </div>

            {favoriteProducts.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  disabled={isSharing}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-[#00eeff]/40 text-[#00eeff] bg-[#00eeff]/10 hover:bg-[#00eeff]/20 transition uppercase tracking-[0.18em] font-black text-[10px] disabled:opacity-50"
                >
                  {isSharing ? "Generando..." : "Compartir"}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  disabled={isSharing}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-green-500/40 text-green-400 bg-green-500/10 hover:bg-green-500/20 transition uppercase tracking-[0.18em] font-black text-[10px] disabled:opacity-50"
                >
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={isSharing}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-white/10 text-white/80 bg-white/5 hover:bg-white/10 hover:border-white/30 transition uppercase tracking-[0.18em] font-black text-[10px] disabled:opacity-50"
                >
                  Copiar enlace
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
            <input
              type="search"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Buscar en mis favoritos..."
              className="bg-[#0f0f0f] border border-white/10 rounded-lg px-5 py-4 w-full text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <div className="text-sm uppercase tracking-[0.18em] my-6 text-zinc-400 font-bold">
            {filteredProducts.length} Favorito{filteredProducts.length === 1 ? "" : "s"}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] px-6 py-12 text-center">
              <div className="text-xl md:text-2xl font-black uppercase italic text-white">
                No tienes favoritos aún
              </div>

              <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">
                Marca productos con el corazón para guardarlos aquí.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.slug ?? index}
                  card={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};