import { UserRole, Product, Module } from "@/app/types";

export const getProductPrice = (product: Product, role: UserRole): number => {
  switch (role) {
    case "wholesale":
      return product.wholeSalePrice;
    case "distributor":
      return product.distributorPrice;
    default:
      return product.basePrice;
  }
};

export const getModulePrice = (module: Module, role: UserRole): number => {
  switch (role) {
    case "wholesale":
      return module.wholeSalePrice;
    case "distributor":
      return module.distributorPrice;
    default:
      return module.basePrice;
  }
};

export const formatPrice = (price: number): string => {
  return `R ${price.toLocaleString()}`;
};

export const getRoleBadgeLabel = (role: UserRole): string => {
  switch (role) {
    case "wholesale":
      return "Wholesale";
    case "distributor":
      return "Distributor";
    default:
      return "Retail";
  }
};

export const calculateShipping = (total: number): number => {
  if (total > 20000) return 0;
  if (total > 10000) return 500;
  return 850;
};
