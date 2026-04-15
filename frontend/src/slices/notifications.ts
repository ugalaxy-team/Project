import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { setUser } from "./user";

export interface AppNotification {
  id: string; 
  body: string;
  isRead?: boolean;
}

interface NotificationsState {
  items: AppNotification[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      if (!state.items.find(n => n.id === action.payload.id)) {
        state.items.unshift(action.payload);
      }
    },
    clearNotifications: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setUser, (state, action) => {
      if (action.payload && action.payload.notifications) {
        state.items = action.payload.notifications;
      }
    });
  },
});

export const { addNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;