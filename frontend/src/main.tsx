import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ui } from './firebase';
import { App } from "./App";
import { FirebaseUIProvider } from "@firebase-oss/ui-react";
import { Provider } from "react-redux";
import { store } from "./store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FirebaseUIProvider ui={ui}>
      <Provider store={store}>
        <App />
      </Provider>
    </FirebaseUIProvider>
  </StrictMode>,
);
