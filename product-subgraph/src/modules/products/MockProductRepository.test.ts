import {
  MockProductRepository,
  leaseInventoryTransaction,
  leasingQtyData,
  saleInventoryTransaction,
  saleQtyData
} from './MockProductRepository';

describe('MockProductRepository', () => {
  let repository: MockProductRepository;

  beforeEach(async () => {
    repository = new MockProductRepository();
    await repository.resetProduct();
    saleInventoryTransaction.length = 0;
    leaseInventoryTransaction.length = 0;
  });

  it('stores product quantity in saleQtyData instead of inline product stock', async () => {
    const product = await repository.findById('1');

    expect(product?.stock).toBe(101);
    expect(saleQtyData.find((item) => item.productId === '1')?.stockQty).toBe(101);
    expect(leasingQtyData.find((item) => item.productId === '1')).toEqual(
      expect.objectContaining({
        leaseRemainQty: 0,
        leaseLeasedQty: 0,
        defectQty: 0
      })
    );
  });

  it('decreaseStock updates saleQtyData and returns mapped stock', async () => {
    const updated = await repository.decreaseStock('2', 10);

    expect(updated?.id).toBe('2');
    expect(updated?.name).toBe('Tesco Bananas 5 Pack');
    expect(updated?.price).toBe(0.75);
    expect(updated?.stock).toBe(92);
    expect(saleQtyData.find((item) => item.productId === '2')?.stockQty).toBe(92);
  });

  it('decreaseStock throws when product does not exist', async () => {
    await expect(repository.decreaseStock('999', 1)).rejects.toThrow('Product not found');
  });

  it('decreaseStock throws when stock is insufficient', async () => {
    await expect(repository.decreaseStock('1', 999)).rejects.toThrow('Insufficient stock');
  });

  it('resetProduct restores seeded inventory state', async () => {
    await repository.decreaseStock('1', 1);
    const leasingRow = leasingQtyData.find((item) => item.productId === '1');
    if (leasingRow) {
      leasingRow.leaseRemainQty = 5;
      leasingRow.leaseLeasedQty = 3;
      leasingRow.defectQty = 1;
    }
    saleInventoryTransaction.push({
      id: 'txn-sale-1',
      transactionId: 'order-1',
      status: 'SUCCESS',
      quantityChange: -1
    });
    leaseInventoryTransaction.push({
      id: 'txn-lease-1',
      transactionId: 'lease-1',
      status: 'SUCCESS',
      quantityChange: 1
    });

    await repository.resetProduct();

    expect(saleQtyData.find((item) => item.productId === '1')?.stockQty).toBe(101);
    expect(leasingQtyData.find((item) => item.productId === '1')).toEqual(
      expect.objectContaining({
        leaseRemainQty: 0,
        leaseLeasedQty: 0,
        defectQty: 0
      })
    );
    expect(saleInventoryTransaction).toHaveLength(0);
    expect(leaseInventoryTransaction).toHaveLength(0);
  });

  it('initializes sale and lease transaction stores as arrays', () => {
    expect(Array.isArray(saleInventoryTransaction)).toBe(true);
    expect(Array.isArray(leaseInventoryTransaction)).toBe(true);
    expect(saleInventoryTransaction).toHaveLength(0);
    expect(leaseInventoryTransaction).toHaveLength(0);
  });
});
