import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import activate from './activateSlice'; // ✅ ADD THIS

export const store = configureStore({
    reducer: {
        auth,
        activate, // ✅ ADD THIS
    },
});