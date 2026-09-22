import { IProductRepository } from './IProductRepository.js';
import { Product } from './types.js';
import { Redis } from 'ioredis';
import DataLoader from 'dataloader';

export class ProductService {
  public productLoader: DataLoader<string, Product | null>;

  constructor(
    private repository: IProductRepository,
    private redis: Redis
  ) {
    this.productLoader = new DataLoader(async (ids: readonly string[]) => {
      return this.repository.findByIds(ids as string[]);
    });
  }
  async getProductBatch(id: string): Promise<Product | null>;
  async getProductBatch(ids: string[]): Promise<(Product | null)[]>;
  async getProductBatch(
    ids: string | string[]
  ): Promise<Product | null | (Product | null)[]> {
    if (typeof ids === 'string') {
      return this.getProduct(ids);
    }
    const products = await this.productLoader.loadMany(ids);
    return products as (Product | null)[];
  }
  
  async getProduct(id: string, fields?: string[]): Promise<Product | null> {
    try {
      const cached = await this.redis.get(`product:${id}`);
      if (cached) {
        console.log(`⚡ [Redis] Cache Hit`);
        return JSON.parse(cached);
      }
      const product = await this.repository.findById(id, fields);
      if (product) {
        await this.redis.set(`product:${id}`, JSON.stringify(product), 'EX', 60);
      }
      return product;
    } catch (error) {
      return this.repository.findById(id, fields);
    }
  }

  async listProducts(limit: number, offset: number) {
    const cacheKey = `products:limit:${limit}:offset:${offset}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const { items, totalCount } = await this.repository.findAndCount(limit, offset);
      const result = {
        items,
        totalCount,
        hasMore: offset + items.length < totalCount
      };
      await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 30);
      return result;
    } catch (error) {
      const { items, totalCount } = await this.repository.findAndCount(limit, offset);
      return { items, totalCount, hasMore: offset + items.length < totalCount };
    }
  }

  async decreaseProductStock(id: string, quantity: number, transactionId?: string): Promise<Product | null> {
    try {
      const updatedProduct = await this.repository.decreaseStock(id, quantity, transactionId);
      if (updatedProduct) {
        await this.redis.del(`product:${id}`);
        const keys = await this.redis.keys('products:limit:*');
        if (keys.length > 0) {
          await this.redis.del(keys); 
        }
        console.log(`Stock decreased, Redis cache cleared`);
      }
      return updatedProduct;
    } catch (error: any) {
      console.error(`Failed to decrease stock:`, error.message);
      throw error;
    }
  }
  async resetProduct() {
    try {
      const resetProduct = await this.repository.resetProduct();
        await this.redis.del(`product:*`);
        const productKeys = await this.redis.keys('product:*');
        for (const key of productKeys) {
          await this.redis.del(key);
        }
        const keys = await this.redis.keys('products:limit:*');
        for (const key of keys) {
          await this.redis.del(key);
        }
        console.log(`Stock reset, Redis cache cleared`);
      return true;
    } catch (error) {
      console.error(`Stock reset failed:`, error);
      throw error;
    }
  }
}