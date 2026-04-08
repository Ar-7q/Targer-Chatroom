import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuth: false,
    user: null,
    otp: {
        phone: '',
        email: '',   // ✅ added
        hash: '',
    },
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action) => {
            const { user } = action.payload;

            state.user = user;
            state.isAuth = !!user;
        },

        setOtp: (state, action) => {
            const { phone, email, hash } = action.payload;

            state.otp.phone = phone || '';
            state.otp.email = email || '';  // ✅ added
            state.otp.hash = hash;
        },
    },
});

export const { setAuth, setOtp } = authSlice.actions;
export default authSlice.reducer;