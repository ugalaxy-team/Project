import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addNotification } from "../slices/notifications";
import type { Socket } from "socket.io-client";


export const useNotificationsSocket = (socket: Socket | null) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleNewNotification = (data: { body: string }) => {
      dispatch(
        addNotification({
          id: crypto.randomUUID(),
          body: data.body,
        })
      );
    };
    if (!socket) return;

    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [dispatch, socket]);
};