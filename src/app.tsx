import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { Timeline } from './components/timeline'

const queryClient = new QueryClient()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-svh w-full grid grid-cols-[max(25%,360px)_1fr] overflow-hidden">
        <div className="relative h-full">
          <Timeline />
        </div>

        <div className="flex items-center justify-center border-l">Right panel</div>
      </div>
    </QueryClientProvider>
  )
}
