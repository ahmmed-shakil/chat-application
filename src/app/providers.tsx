'use client';

import { store } from '@/lib/features/store';
import { Provider } from 'react-redux';
import { SocketProvider } from '@/contexts/SocketContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SocketProvider>{children}</SocketProvider>
    </Provider>
  );
}
