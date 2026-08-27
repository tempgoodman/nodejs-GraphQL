import { ProductService } from './ProductService';
import graphqlFields from 'graphql-fields';

export const buildResolvers = (productService: ProductService) => ({
  Product: {
    __resolveReference(productReference: { id: string }) {
      return productService.getProductBatch(productReference.id);
    }
  },
  Query: {
    getProduct: (_: any, { id }: { id: string }, context: any, info: any) => {
      const requestedFields = Object.keys(graphqlFields(info));
      return productService.getProduct(id, requestedFields);
    },
    listProducts: (_: any, { limit, offset }: { limit: number, offset: number }) => 
      productService.listProducts(limit, offset),
  },
  Mutation: {
    decreaseProductStock: (_: any, { id, quantity }: { id: string, quantity: number }) => 
      productService.decreaseProductStock(id, quantity),
    resetProduct: () => productService.resetProduct(),
  }
});