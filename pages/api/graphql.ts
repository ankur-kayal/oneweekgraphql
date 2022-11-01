import { createServer } from '@graphql-yoga/node';
import { readFileSync } from 'fs';
import { join } from 'path';

const typeDefs = readFileSync(
  join(process.cwd(), 'graphql', 'schema.graphql'),
  {
    encoding: 'utf-8',
  }
);

const resolvers = {
  Query: {
    cart: (_, { id }) => {
      return {
        id,
        totalItems: 0,
      };
    },
  },
};

const server = createServer({
  cors: false,
  endpoint: '/api/graphql',
  schema: {
    typeDefs,
    resolvers,
  },
});

export default server;
