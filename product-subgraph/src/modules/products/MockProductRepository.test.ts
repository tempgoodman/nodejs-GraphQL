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

    expect(product?.stock).toBe(100);
    expect(saleQtyData.find((item) => item.productId === '1')?.stockQty).toBe(100);
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

    expect(updated?.stock).toBe(90);
    expect(saleQtyData.find((item) => item.productId === '2')?.stockQty).toBe(90);
  });

  it('initializes sale and lease transaction stores as arrays', () => {
    expect(Array.isArray(saleInventoryTransaction)).toBe(true);
    expect(Array.isArray(leaseInventoryTransaction)).toBe(true);
    expect(saleInventoryTransaction).toHaveLength(0);
    expect(leaseInventoryTransaction).toHaveLength(0);
  });
});
