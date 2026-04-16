import { configureStore } from '@reduxjs/toolkit'
import { userSlice } from './slices/user';
import notificationsReducer from './slices/notifications'; 

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        notifications: notificationsReducer, 
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;