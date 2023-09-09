import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
    },
    reducers: {
        login: (state) => {
            state.user = { loggedIn: true };
        },
        logout: (state) => {
            state.user = null;
        },
    },
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;
