import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ui } from "./firebase";
import { App } from "./App";
import { FirebaseUIProvider } from "@firebase-oss/ui-react";
import { Provider } from "react-redux";
import { store } from "./store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FirebaseUIProvider ui={ui}>
        <Provider store={store}>
          <App />
        </Provider>
      </FirebaseUIProvider>
    </QueryClientProvider>
  </StrictMode>,
);
