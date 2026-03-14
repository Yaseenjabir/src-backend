export const PRODUCT_MODELS = [
  "A_SERIES",
  "K_SERIES",
  "R_SERIES",
  "UNIQUE_SERIES",
] as const;

export type ProductModel = (typeof PRODUCT_MODELS)[number];
