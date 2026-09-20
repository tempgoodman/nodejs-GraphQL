import { Product } from './types.js';
import { Product as ProductDTO, ProductPage as ProductPageDTO } from '../../generated/graphql.js';

export interface ProductPage {
  items: Product[];
  totalCount: number;
  hasMore: boolean;
}

export class ProductMapper {
  static toGraphQL(product: Product | null): ProductDTO | null {
    if (!product) return null;
    return {
      __typename: 'Product',
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock
    };
  }

  static toGraphQLList(products: (Product | null)[]): (ProductDTO | null)[] {
    return products.map((product) => ProductMapper.toGraphQL(product));
  }

  static toGraphQLPage(page: ProductPage): ProductPageDTO {
    return {
      __typename: 'ProductPage',
      items: page.items.map((product) => ProductMapper.toGraphQL(product)!),
      totalCount: page.totalCount,
      hasMore: page.hasMore
    };
  }
}
