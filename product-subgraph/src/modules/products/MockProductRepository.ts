import { IProductRepository } from './IProductRepository.js';
import { Product } from './types.js';

interface ProductData {
  id: string;
  name: string;
  price: number;
}

interface SaleQty {
  id: string;
  productId: string;
  stockQty: number;
  defectQty: number;
}

interface LeasingQty {
  id: string;
  productId: string;
  leaseRemainQty: number;
  leaseLeasedQty: number;
  defectQty: number;
}

interface InventoryTransaction {
  id: string;
  transactionId: string;
  status: string;
  quantityChange: number;
}

const productsData: ProductData[] = [
  { id: '1', name: 'Tesco Organic Milk 2L', price: 1.80 },
  { id: '2', name: 'Tesco Bananas 5 Pack', price: 0.75 },
  { id: '3', name: 'Tesco Free Range Eggs 6pk', price: 1.50 },
  { id: '4', name: 'Tesco Sliced White Bread', price: 0.85 },
];

const initialSaleQtyData: SaleQty[] = [
  { id: 'sale-1', productId: '1', stockQty: 101, defectQty: 0 },
  { id: 'sale-2', productId: '2', stockQty: 102, defectQty: 0 },
  { id: 'sale-3', productId: '3', stockQty: 103, defectQty: 0 },
  { id: 'sale-4', productId: '4', stockQty: 104, defectQty: 0 },
];

export const saleQtyData: SaleQty[] = initialSaleQtyData.map((item) => ({ ...item }));

const initialLeasingQtyData: LeasingQty[] = [
  { id: 'lease-1', productId: '1', leaseRemainQty: 0, leaseLeasedQty: 0, defectQty: 0 },
  { id: 'lease-2', productId: '2', leaseRemainQty: 0, leaseLeasedQty: 0, defectQty: 0 },
  { id: 'lease-3', productId: '3', leaseRemainQty: 0, leaseLeasedQty: 0, defectQty: 0 },
  { id: 'lease-4', productId: '4', leaseRemainQty: 0, leaseLeasedQty: 0, defectQty: 0 },
];
export const leasingQtyData: LeasingQty[] = initialLeasingQtyData.map((item) => ({ ...item }));

export const saleInventoryTransaction: InventoryTransaction[] = [];
export const leaseInventoryTransaction: InventoryTransaction[] = [];

const toProduct = (product: ProductData): Product => {
  const saleQty = saleQtyData.find((qty) => qty.productId === product.id);
  return {
    ...product,
    stock: saleQty?.stockQty ?? 0
  };
};

export class MockProductRepository implements IProductRepository {
  async findById(id: string, fields?: string[]): Promise<Product | null> {
    const sqlSelect = fields && fields.length > 0 ? fields.join(', ') : '*';
    
    console.log(`Show the SQL statement`);
    console.log(`SELECT ${sqlSelect} FROM products WHERE id = '${id}';`);

    const found = productsData.find(p => p.id === id);
    return found ? toProduct(found) : null;
  }

  async findAll(): Promise<Product[]> {
    return productsData.map(toProduct);
  }

  async findByIds(ids: string[]): Promise<(Product | null)[]> {
    return ids.map(id => {
      const found = productsData.find(p => p.id === id);
      return found ? toProduct(found) : null;
    });
  }

  async findAndCount(limit: number, offset: number): Promise<{ items: Product[]; totalCount: number }> {
    const totalCount = productsData.length;
    const items = productsData.slice(offset, offset + limit).map(toProduct);
    return { items, totalCount };
  }

  async decreaseStock(id: string, quantity: number): Promise<Product> {
    const product = productsData.find(p => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }

    const saleQty = saleQtyData.find((qty) => qty.productId === id);
    if (!saleQty) {
      throw new Error('Sale quantity data not found');
    }

    if (saleQty.stockQty < quantity) {
      throw new Error('Insufficient stock');
    }

    saleQty.stockQty -= quantity;
    return toProduct(product);
  }
  async resetProduct(): Promise<boolean> {
    for (const initialSaleQty of initialSaleQtyData) {
      const saleQty = saleQtyData.find((qty) => qty.productId === initialSaleQty.productId);
      if (saleQty) {
        saleQty.stockQty = initialSaleQty.stockQty;
        saleQty.defectQty = initialSaleQty.defectQty;
      }
    }
    for (const initialLeasingQty of initialLeasingQtyData) {
      const leasingQty = leasingQtyData.find((qty) => qty.productId === initialLeasingQty.productId);
      if (leasingQty) {
        leasingQty.leaseRemainQty = initialLeasingQty.leaseRemainQty;
        leasingQty.leaseLeasedQty = initialLeasingQty.leaseLeasedQty;
        leasingQty.defectQty = initialLeasingQty.defectQty;
      }
    }
    saleInventoryTransaction.length = 0;
    leaseInventoryTransaction.length = 0;
    return true;
  }

}