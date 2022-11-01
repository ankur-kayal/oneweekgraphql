import { createServer } from '@graphql-yoga/node';
import { readFileSync } from 'fs';
import { join } from 'path';

import { Resolvers } from '../../graphql/types';

const typeDefs = readFileSync(
  join(process.cwd(), 'graphql', 'schema.graphql'),
  {
    encoding: 'utf-8',
  }
);

const resolvers: Resolvers = {
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
