import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io, Socket } from "socket.io-client";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useNotificationsSocket } from "./hooks/useNotificationsSocket";
import { Router } from "./routers/Router";

const COOLDOWN_TIME = 3 * 60 * 1000;

export const App = () => {
  const { t } = useTranslation("common");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toastTheme, setToastTheme] = useState<"colored" | "dark">("colored");

  const lastErrorTime = useRef(0);
  const wasError = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      const isDark =
        savedTheme === "dark" || (!savedTheme && mediaQuery.matches);

      if (isDark) {
        document.documentElement.classList.add("dark");
        setToastTheme("dark");
      } else {
        document.documentElement.classList.remove("dark");
        setToastTheme("colored");
      }
    };

    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setToastTheme(isDark ? "dark" : "colored");
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let currentSocket: Socket | null = null;

    const unsubscribeAuth = onIdTokenChanged(auth, async (user) => {
      if (currentSocket) {
        currentSocket.disconnect();
        setSocket(null);
      }

      if (user) {
        const token = await user.getIdToken();
        currentSocket = io(import.meta.env.VITE_SOCKETIO_SERVER_URL, {
          auth: { token },
          reconnectionDelay: 5000,
        });

        currentSocket.on("connect_error", () => {
          const now = Date.now();

          if (
            now - lastErrorTime.current > COOLDOWN_TIME ||
            !wasError.current
          ) {
            toast.error(
              <div>
                <div className="font-bold mb-1">
                  {t("errors.socket")}
                </div>
                <div className="text-[13px] opacity-90 leading-tight">
                  Сповіщення тимчасово не працюють
                </div>
              </div>,
              { toastId: "socket-error" },
            );

            lastErrorTime.current = now;
            wasError.current = true;
          }
        });

        currentSocket.on("connect", () => {
          toast.dismiss("socket-error");

          if (wasError.current) {
            toast.success("Зв'язок відновлено!", { toastId: "socket-success" });
            wasError.current = false;
            lastErrorTime.current = 0;
          }
        });

        setSocket(currentSocket);
      }
    });

    return () => {
      unsubscribeAuth();
      if (currentSocket) currentSocket.disconnect();
    };
  }, [t]);

  useNotificationsSocket(socket);

  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={toastTheme}
      />

      <Router />
    </>
  );
};
