import { ProductService } from './ProductService.js';
import { ProductMapper } from './ProductMapper.js';
import graphqlFields from 'graphql-fields';

export const buildResolvers = (productService: ProductService) => ({
  Product: {
    async __resolveReference(productReference: { id: string }) {
      const product = await productService.getProductBatch(productReference.id);
      return ProductMapper.toGraphQL(product);
    }
  },
  Query: {
    getProduct: async (_: any, { id }: { id: string }, context: any, info: any) => {
      const requestedFields = Object.keys(graphqlFields(info));
      const product = await productService.getProduct(id, requestedFields);
      return ProductMapper.toGraphQL(product);
    },
    listProducts: async (_: any, { limit, offset }: { limit: number, offset: number }) => {
      const page = await productService.listProducts(limit, offset);
      return ProductMapper.toGraphQLPage(page);
    },
  },
  Mutation: {
    decreaseProductStock: async (_: any, { id, quantity }: { id: string, quantity: number }) => {
      const product = await productService.decreaseProductStock(id, quantity);
      return ProductMapper.toGraphQL(product);
    },
    resetProduct: () => productService.resetProduct(),
  }
});