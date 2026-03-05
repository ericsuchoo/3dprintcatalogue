export type D1SelectItem = {
  title: string;
  slug: string;
};

export type ProductLiteD1 = {
  id: string | number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  discount: number;
  units: number | null;
  coverUrl: string;

  personajeId: string | number | null;
  universoId: string | number | null;
  proveedorId: string | number | null;
};

export type ShopPageDataD1 = {
  products: ProductLiteD1[];
  genders: D1SelectItem[];
  categories: D1SelectItem[];
  brands: D1SelectItem[];
  initialPersonajeId?: string | null;
};