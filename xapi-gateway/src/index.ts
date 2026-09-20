import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
import { readFileSync } from 'fs';
import { verifyToken } from './auth/verifyToken';

async function startGateway() {
  const supergraphSdl = readFileSync('./supergraph.graphql', 'utf8');

  const gateway = new ApolloGateway({
    supergraphSdl, 
    buildService({ name, url }) {
      return new RemoteGraphQLDataSource({
        url,
        willSendRequest({ request, context }) {
          if (context.userId) {
            request.http?.headers.set('x-user-id', context.userId);
          }
        }
      });
    }
  });

  const server = new ApolloServer({ gateway });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
      const authHeader = req.headers.authorization;
      const userId = verifyToken(authHeader);
      return { userId };
    },
  });

  console.log(`Static Supergraph Gateway ready at ${url}`);
}

startGateway().catch(console.error);