
import { atom } from "jotai";
import { Category, Product, ProductDraft } from "@/types";

// Categories
const mockCategories: Category[] = [
  { id: "shoes", name: "Shoes" },
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing" },
];

// Products
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Nike Air Jordan Shoes",
    category: "shoes",
    brand: "Nike",
    image: "/src/assets/nike-air-jordan.jpg",

    variants: [
      { name: "Size", values: ["M", "L"] },
      { name: "Color", values: ["Black", "Red"] },
    ],

    combinations: {
      a: { name: "M/Black", sku: "ABC12", quantity: 4, inStock: false },
      b: { name: "L/Red", sku: "ABC13", quantity: 10, inStock: true },
    },

    priceInr: 500,
    discount: { method: "pct", value: 12 },
  },
  {
    id: "2",
    name: "Nike Kork Low Shoes",
    category: "shoes",
    brand: "Nike",
    image: "/src/assets/nike-air-jordan.jpg",

    variants: [
      { name: "Size", values: ["M", "L"] },
      { name: "Color", values: ["Black", "Red"] },
    ],

    combinations: {
      a: { name: "M/Black", sku: "XYZ12", quantity: 3, inStock: true },
      b: { name: "L/Red", sku: "XYZ13", quantity: 8, inStock: true },
    },

    priceInr: 400,
    discount: { method: "flat", value: 12 },
  },
];

// Atoms
export const categoriesAtom = atom<Category[]>(mockCategories);
export const productsAtom = atom<Product[]>(mockProducts);
export const currentDraftAtom = atom<ProductDraft | null>(null);
export const activeCategoryAtom = atom<string>('all');
