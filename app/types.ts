export type UserRole = "retail" | "wholesale" | "distributor";

export interface RoleRequirements {
  role: UserRole;
  minimumOrderQuantity: number;
  discount: string;
  description: string;
}

export const ROLE_REQUIREMENTS: Record<UserRole, RoleRequirements> = {
  retail: {
    role: "retail",
    minimumOrderQuantity: 1,
    discount: "Standard pricing",
    description: "Individual purchases for personal use",
  },
  wholesale: {
    role: "wholesale",
    minimumOrderQuantity: 10,
    discount: "Save 20%",
    description: "Small retailers and businesses",
  },
  distributor: {
    role: "distributor",
    minimumOrderQuantity: 50,
    discount: "Save 30%",
    description: "Large distributors and corporate procurement",
  },
};

export interface Module {
  id: string;
  name: string;
  category: "material" | "size" | "addon" | "accessory";
  basePrice: number;
  wholeSalePrice: number;
  distributorPrice: number;
  incompatibleWith?: string[];
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  wholeSalePrice: number;
  distributorPrice: number;
  imageUrl: string;
  availableModules: Module[];
}

export interface ProductConfiguration {
  productId: string;
  selectedModules: string[];
}

export interface CartItem extends ProductConfiguration {
  id: string;
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: Date;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  role: UserRole;
}
