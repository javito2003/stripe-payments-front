export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderEntity {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  stripePaymentIntentId: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductEntity {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEntity {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthUser = Omit<UserEntity, 'password'>;
