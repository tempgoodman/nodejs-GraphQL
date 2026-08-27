export const typeDefs = `#graphql
    type OrderItem {
        productId: ID!
        quantity: Int!
        product: Product 
        purchasePrice: Float! 
        }

    extend type Product @key(fields: "id") {
        id: ID! @external
    }

    type Order @key(fields: "id") {
        id: ID!
        userId: String!
        status: String!
        createdAt: String!
        items: [OrderItem!]! 
        totalAmount: Float!
    }

    input OrderItemInput {
        productId: ID!
        quantity: Int!
    }

    type Mutation {
        createOrder(items: [OrderItemInput!]!): Order
        resetOrders: Boolean
    }

    type Query {
        getOrders: [Order!]!
    }
`;