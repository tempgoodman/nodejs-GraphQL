import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSubgraphSchema } from '@apollo/subgraph';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { gql } from 'graphql-tag';
import Redis from 'ioredis';
import amqp from 'amqplib'; 
import { typeDefs } from './modules/orders/typeDefs';
import { buildResolvers } from './modules/orders/resolvers';
import { OrderService } from './modules/orders/OrderService';

async function startServer() {
  const app = express();
  const redis = new Redis();
  
  const mqConnection = await amqp.connect('amqp://localhost');
  const mqChannel = await mqConnection.createChannel();
  
  const QUEUE_NAME = 'order_created_events';
  await mqChannel.assertQueue(QUEUE_NAME, { durable: true });
  console.log(`RabbitMQ Connected. Queue ready: ${QUEUE_NAME}`);

  const orderService = new OrderService(redis, mqChannel);

  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs: gql(typeDefs),
      resolvers: buildResolvers(orderService),
    }),
  });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const userId = req.headers['x-user-id'];
        return {
          userId: typeof userId === 'string' ? userId : null,
        };
      },
    }),
  );

  const PORT = 4002;
  app.listen(PORT, () => {
    console.log(`Order Subgraph ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);