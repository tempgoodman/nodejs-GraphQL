import { Product } from './types.js';

export interface IProductRepository {
  findById(id: string, fields?: string[]): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findByIds(ids: string[]): Promise<(Product | null)[]>;
  findAndCount(limit: number, offset: number): Promise<{ items: Product[]; totalCount: number }>;
  decreaseStock(id: string, quantity: number): Promise<Product>;
  resetProduct(): Promise<boolean>;
}