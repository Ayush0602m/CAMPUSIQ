import React from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootLayout from './layouts/RootLayout';

export async function render(_url: string) {
  const helmetContext: Record<string, unknown> = {};
  const queryClient = new QueryClient();

  const html = renderToString(
    <React.StrictMode>
      <HelmetProvider context={helmetContext}>
        <QueryClientProvider client={queryClient}>
          <RootLayout>
            <div id="ssr-placeholder" />
          </RootLayout>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );

  const helmet = (helmetContext as any).helmet;
  const head = helmet
    ? [
        helmet.title?.toString() ?? '',
        helmet.meta?.toString() ?? '',
        helmet.link?.toString() ?? '',
        helmet.script?.toString() ?? '',
      ].join('\n')
    : '';

  return { html, head, status: 200 };
}
