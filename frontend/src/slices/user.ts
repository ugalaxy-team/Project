import { createSlice } from "@reduxjs/toolkit";
import type { User } from "firebase/auth";

interface UserState {
    user: User | null;
};

const initialUserState: UserState = {
    user: null,
}

export const userSlice = createSlice({
    name: 'user',
    initialState: initialUserState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },

    }
})

export const { setUser } = userSlice.actions;