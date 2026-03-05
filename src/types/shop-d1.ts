export type D1SelectItem = {
  title: string;
  slug: string; // en tu caso es ID string (personajeId, universoId, proveedorId)
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
  genders: D1SelectItem[];     // personajes
  categories: D1SelectItem[];  // universos
  brands: D1SelectItem[];      // proveedores
  initialPersonajeId?: string | null;
};