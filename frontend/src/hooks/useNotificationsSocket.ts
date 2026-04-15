import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addNotification } from "../slices/notifications";
import type { Socket } from "socket.io-client";

export const useNotificationsSocket = (socket: Socket | null) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: { body: string; id?: string }) => {
      dispatch(
        addNotification({
          id: data.id || crypto.randomUUID(),
          body: data.body,
          isRead: false
        })
      );
    };

    socket.on("notification", handleNewNotification);
    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [dispatch, socket]);
};