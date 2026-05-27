export const ROLE_OPTIONS = ["ADMIN", "MANAGER", "STAFF"] as const;

export type Role = (typeof ROLE_OPTIONS)[number];

export type SessionUser = {
  id: number;
  username: string;
  fullName: string;
  roles: Role[];
  enabled: boolean;
};

export type AuthResponse = {
  token: string;
  user: SessionUser;
};

export type InventoryItem = {
  id: number;
  sku: string;
  name: string;
  category: string;
  location: string | null;
  supplier: string | null;
  quantity: number;
  reorderLevel: number;
  status: string;
  lowStock: boolean;
  notes: string | null;
  updatedAt: string | null;
};

export type InventorySummary = {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalUnits: number;
};

export type Restaurant = {
  id: number;
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  active: boolean;
};

export type MenuItem = {
  id: number;
  restaurantId: number;
  restaurantName: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  available: boolean;
  prepMinutes: number;
};

export type FoodOrderItem = {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  priceAtOrder: number;
};

export type FoodOrder = {
  id: number;
  restaurantId: number;
  restaurantName: string;
  status: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  createdAt: string;
  totalAmount: number;
  createdBy: string;
  items: FoodOrderItem[];
};
