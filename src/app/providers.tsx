"use client";

import { persistor, store } from "@/lib/features/store";
import { Provider } from "react-redux";
import { SocketProvider } from "@/contexts/SocketContext";
import { PersistGate } from "redux-persist/integration/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketProvider>{children}</SocketProvider>
      </PersistGate>
    </Provider>
  );
}
