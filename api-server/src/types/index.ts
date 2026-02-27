type UserType = {
  name: string;
  email: string;
  password: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryType = {
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

type ProductType = {
  name: string;
  description: string;
  price: Number;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
};

type OrderProductType = {
  productId: string;
  quantity: number;
};

type OrderType = {
  userId: string;
  products: OrderProductType[];
  total: number;
  createdAt?: string;
  updatedAt?: string;
};

export type { UserType, CategoryType, ProductType, OrderType };
