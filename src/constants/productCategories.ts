export const PRODUCT_MODELS = [
  "A_SERIES",
  "K_SERIES",
  "R_SERIES",
  "UNIQUE_SERIES",
] as const;

export type ProductModel = (typeof PRODUCT_MODELS)[number];

export const MODEL_LABELS: Record<ProductModel, string> = {
  A_SERIES: "A Series",
  K_SERIES: "K Series",
  R_SERIES: "R Series",
  UNIQUE_SERIES: "Unique Series",
};
