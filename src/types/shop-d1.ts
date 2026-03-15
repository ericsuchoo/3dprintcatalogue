export type D1SelectItem = {
  title: string;
  slug: string;
};

export type PriceModeD1 = "fixed" | "from" | "quote";

export type ProductLiteD1 = {
  id: string | number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price: number | null;
  priceMode?: PriceModeD1 | null;
  discount: number;
  units: number | null;
  coverUrl: string;

  personajeId: string | number | null;
  universoId: string | number | null;
  proveedorId: string | number | null;

  tagLabel?: string | null;
  date?: string | null;
};

export type ShopPageDataD1 = {
  products: ProductLiteD1[];
  genders: D1SelectItem[];
  categories: D1SelectItem[];
  brands: D1SelectItem[];
  initialPersonajeId?: string | null;
};

export type ProductEditionImageD1 = {
  url: string;
};

export type ProductEditionD1 = {
  id_edicion: string | number;
  nombre_edicion: string;
  img: string | null;
  images: ProductEditionImageD1[];
};

export type ProductScaleD1 = {
  id_escala: string | number;
  nombre_escala: string;
  descripcion: string;
  disponible: boolean;
};

export type ProductDetailMetaD1 = {
  id_producto: string | number;
  title: string;
  slug: string;
  model_id: string;
  subtitle?: string;
  price: number | null;
  priceMode?: PriceModeD1 | null;
  descuento?: number | null;
  descripcion?: string;
  description?: string;
  disclaimer?: string;
  aspectos_variables?: string;
  tipo_cosplay?: string;
  personajeId?: string | number | null;
  universoId?: string | number | null;
  proveedorId?: string | number | null;
  cover?: { url: string } | null;
  editions: ProductEditionD1[];
  scales: ProductScaleD1[];
};

export type ProductDetailPageDataD1 = {
  meta: ProductDetailMetaD1;
  otherProducts: ProductLiteD1[];
};