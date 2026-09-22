import gql from 'graphql-tag';

export const typeDefs = `#graphql
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key"])

  type Product @key(fields: "id") {
    id: ID!
    name: String!
    price: Float!
    stock: Int!
    leaseRemainQty: Int!
  }

  type ProductPage {
    items: [Product!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type Query {
    getProduct(id: ID!): Product
    listProducts(limit: Int = 10, offset: Int = 0): ProductPage!
  }

type Mutation {
    decreaseProductStock(id: ID!, quantity: Int!, transactionId: ID): Product
    resetProduct: Boolean
  }
`;