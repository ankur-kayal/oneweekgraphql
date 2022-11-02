import { createServer } from '@graphql-yoga/node';
import { readFileSync } from 'fs';
import { join } from 'path';

import type { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

import { Resolvers } from '../../graphql/types';
import prisma from '../../lib/prisma';

export type GraphQLContext = {
  prisma: PrismaClient;
};

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

export async function createContext(): Promise<GraphQLContext> {
  return {
    prisma,
  };
}

const server = createServer<{
  req: NextApiRequest;
  res: NextApiResponse;
}>({
  cors: false,
  endpoint: '/api/graphql',
  schema: {
    typeDefs,
    resolvers,
  },
  context: createContext(),
});

export default server;
