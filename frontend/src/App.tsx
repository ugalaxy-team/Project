import { Toaster } from "sonner";
import { useNotificationsSocket } from "./hooks/useNotificationsSocket";
import { io, Socket } from "socket.io-client";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Router } from "./routers/Router";

export const App = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let currentSocket: Socket | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        currentSocket = io(import.meta.env.VITE_SOCKETIO_SERVER_URL, {
          auth: { token },
          reconnectionDelay: 5000,
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
      <Toaster position="top-center" richColors expand={false} closeButton />
      <Router />
    </>
  );
};