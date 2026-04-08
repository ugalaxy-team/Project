import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { addNotification } from "../slices/notifications";


export const useNotificationsSocket = (socket: any) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (data: { body: string }) => {
      dispatch(
        addNotification({
          id: crypto.randomUUID(),
          body: data.body,
        })
      );
    };

    socket.on("on_notification", handleNewNotification);

    return () => {
      socket.off("on_notification", handleNewNotification);
    };
  }, [dispatch, socket]);
};