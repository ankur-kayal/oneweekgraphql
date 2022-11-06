import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useMemo } from 'react';

const protocol = `${
  process.env.NODE_ENV === 'development' ? 'http' : 'https'
}://`;

const host =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000'
    : window.location.host;

export const origin = `${protocol}${host}`;

export const useClient = () => {
  const client = useMemo(
    () =>
      new ApolloClient({
        uri: `${origin}/api/graphql`,
        cache: new InMemoryCache(),
      }),
    []
  );
  return client;
};
