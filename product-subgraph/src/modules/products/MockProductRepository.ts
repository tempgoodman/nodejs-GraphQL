import { IProductRepository } from './IProductRepository.js';
import { Product } from './types.js';

const productsData: Product[] = [
  { id: '1', name: 'Tesco Organic Milk 2L', price: 1.80, stock: 101 },
  { id: '2', name: 'Tesco Bananas 5 Pack', price: 0.75, stock: 102 },
  { id: '3', name: 'Tesco Free Range Eggs 6pk', price: 1.50, stock: 103 },
  { id: '4', name: 'Tesco Sliced White Bread', price: 0.85, stock: 104 },
];

export class MockProductRepository implements IProductRepository {
  async findById(id: string, fields?: string[]): Promise<Product | null> {
    const sqlSelect = fields && fields.length > 0 ? fields.join(', ') : '*';
    
    console.log(`Show the SQL statement`);
    console.log(`SELECT ${sqlSelect} FROM products WHERE id = '${id}';`);

    return productsData.find(p => p.id === id) || null;
  }

  async findAll(): Promise<Product[]> {
    return productsData;
  }

  async findByIds(ids: string[]): Promise<(Product | null)[]> {
    return ids.map(id => {
      const found = productsData.find(p => p.id === id);
      return found || null;
    });
  }

  async findAndCount(limit: number, offset: number): Promise<{ items: Product[]; totalCount: number }> {
    const totalCount = productsData.length;
    const items = productsData.slice(offset, offset + limit);
    return { items, totalCount };
  }

  async decreaseStock(id: string, quantity: number): Promise<Product | null> {
    const product = productsData.find(p => p.id === id);
    if (product && product.stock >= quantity) {
      product.stock -= quantity; 
      return product;
    }
    throw new Error('Stock not sufficient or product not found');
  }
  async resetProduct(): Promise<boolean> {
    for (const product of productsData) {
      product.stock = 100; 
    }
    return true;
  }

}