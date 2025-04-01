import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { Timeline } from './src/components/timeline';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Timeline />
    </QueryClientProvider>
  );
}

export default App;