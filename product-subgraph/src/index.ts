import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { gql } from 'graphql-tag';
import Redis from 'ioredis';

import { typeDefs as productTypeDefs } from './modules/products/typeDefs';
import { buildResolvers as buildProductResolvers } from './modules/products/resolvers';
import { ProductService } from './modules/products/ProductService';
import { MockProductRepository } from './modules/products/MockProductRepository';

async function startServer() {
  const app = express();
  
  const redis = new Redis();

  const repository = new MockProductRepository();
  const productService = new ProductService(repository, redis);

  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs: gql(productTypeDefs),
      resolvers: buildProductResolvers(productService),
    }),
  });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        return {
          productService, // 將 Service 放入 Context，方便第時升級用
          userId: req.headers['x-user-id']
        };
      },
    })
  );

  const PORT = 4001;
  app.listen(PORT, () => {
    console.log(`Product Subgraph ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});