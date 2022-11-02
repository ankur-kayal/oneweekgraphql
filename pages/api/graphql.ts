import { createServer } from '@graphql-yoga/node';
import { readFileSync } from 'fs';
import { join } from 'path';
import currencyFormatter from 'currency-formatter';

import type { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

import { Resolvers } from '../../graphql/types';
import prisma from '../../lib/prisma';

export type GraphQLContext = {
  prisma: PrismaClient;
};

const currencyCode = 'USD';

const typeDefs = readFileSync(
  join(process.cwd(), 'graphql', 'schema.graphql'),
  {
    encoding: 'utf-8',
  }
);

const resolvers: Resolvers = {
  Query: {
    cart: async (_, { id }, { prisma }) => {
      let cart = await prisma.cart.findUnique({
        where: {
          id,
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: {
            id,
          },
        });
      }
      return cart;
    },
  },
  Cart: {
    items: async ({ id }, _, { prisma }) => {
      const items =
        (await prisma.cart
          .findUnique({
            where: {
              id,
            },
          })
          .items()) ?? [];

      return items;
    },
    totalItems: async ({ id }, _, { prisma }) => {
      const items =
        (await prisma.cart
          .findUnique({
            where: {
              id,
            },
          })
          .items()) ?? [];

      return items.reduce((total, item) => total + item.quantity || 1, 0);
    },
    subTotal: async ({ id }, _, { prisma }) => {
      const items =
        (await prisma.cart
          .findUnique({
            where: {
              id,
            },
          })
          .items()) ?? [];

      const amount = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      return {
        amount,
        formatted: currencyFormatter.format(amount / 100, {
          code: currencyCode,
        }),
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
