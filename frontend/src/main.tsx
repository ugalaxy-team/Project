import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ui } from './firebase';
import { App } from "./App";
import { FirebaseUIProvider } from "@firebase-oss/ui-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FirebaseUIProvider ui={ui}>
      <App />
    </FirebaseUIProvider>
  </StrictMode>,
);
