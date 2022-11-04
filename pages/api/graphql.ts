import { createServer } from '@graphql-yoga/node';
import { readFileSync } from 'fs';
import { join } from 'path';
import currencyFormatter from 'currency-formatter';

import type { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

import { Resolvers } from '../../graphql/types';
import prisma from '../../lib/prisma';
import { findOrCreateCart } from '../../lib/cart';

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
      return findOrCreateCart(prisma, id);
    },
  },
  Mutation: {
    addItem: async (_, { input }, { prisma }) => {
      const cart = await findOrCreateCart(prisma, input.cartId);
      await prisma.cartItem.upsert({
        create: {
          cartId: cart.id,
          id: input.id,
          name: input.name,
          description: input.description,
          image: input.image,
          price: input.price,
          quantity: input.quantity || 1,
        },
        where: {
          id_cartId: {
            id: input.id,
            cartId: cart.id,
          },
        },
        update: {
          quantity: {
            increment: input.quantity || 1,
          },
        },
      });
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
  CartItem: {
    unitTotal: (item) => {
      const amount = item.price;
      return {
        amount,
        formatted: currencyFormatter.format(amount / 100, {
          code: currencyCode,
        }),
      };
    },
    lineTotal: (item) => {
      const amount = item.quantity * item.price;
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
