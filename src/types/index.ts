export interface Category {
  id: string;
  name: string;
}

export interface Variant {
  name: string;
  values: string[];
}

export interface Combination {
  name: string;  
  sku: string;
  quantity: number | null;
  inStock: boolean ;
}

export type Combinations = Record<string, Combination>;

export interface Discount {
  method: "pct" | "flat";
  value: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  image: string;

  variants: Variant[];
  combinations: Combinations;

  priceInr: number;
  discount: Discount;
}

export type ProductDraft = Partial<Product> & { id?: string };


