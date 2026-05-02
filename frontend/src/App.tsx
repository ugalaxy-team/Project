import { Toaster, toast } from 'sonner';
import { useNotificationsSocket } from "./hooks/useNotificationsSocket";
import { io, Socket } from 'socket.io-client';
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth"; 
import { useEffect, useState, useRef } from "react";
import { Router } from "./routers/Router";

const COOLDOWN_TIME = 3 * 60 * 1000; 
export const App = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const lastErrorTime = useRef<number>(0);
  const wasError = useRef<boolean>(false);

  useEffect(() => {
    let currentSocket: Socket | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        currentSocket = io(import.meta.env.VITE_SOCKETIO_SERVER_URL, {
          auth: { token },
          reconnectionDelay: 5000,
        });

        currentSocket.on("connect_error", () => {
          const now = Date.now();

          if (now - lastErrorTime.current > COOLDOWN_TIME || !wasError.current) {
            toast.error("Проблеми з сервером :(", {
              id: "socket-error",
              description: "Сповіщення тимчасово не працюють",
              duration: 5000, 
            });
            
            lastErrorTime.current = now;
            wasError.current = true;
          }
        });

        currentSocket.on("connect", () => {
          if (wasError.current) {
            toast.success("Зв'язок відновлено!", { id: "socket-error" });
            wasError.current = false;
            lastErrorTime.current = 0;
          }
        });

        setSocket(currentSocket);
      } else {
        if (currentSocket) {
          currentSocket.disconnect();
          setSocket(null);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (currentSocket) currentSocket.disconnect();
    };
  }, []);

  useNotificationsSocket(socket);

  return (
    <>
      <Toaster position="top-center" richColors expand={false} />
      <Router />
    </>
  );
};