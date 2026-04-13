import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, 
    withCredentials: true,
    headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
    },
});

// API CALLS

// auth
export const sendOtp = (data) => api.post('/send-otp', data);
export const verifyOtp = (data) => api.post('/verify-otp', data);
export const activate = (data) => api.post('/activate', data);

export const updateProfile = (data) => api.post('/profile/update', data); 
export const sendUpdateOtp = (data) => api.post('/profile/send-otp', data);
export const verifyUpdateOtp = (data) => api.post('/profile/verify-otp', data);


// with part-5
export const logout = () => api.post('/logout');

// rooms in  part-5
export const createRoom = (data) => api.post('/rooms', data);
export const getAllRooms = () => api.get('/rooms');
export const getRoom = (roomId) => api.get(`/rooms/${roomId}`);
export const inviteUser = (roomId, data) => api.post(`/rooms/${roomId}/invite`, data);

export const removeUser = (roomId, data) => api.post(`/rooms/${roomId}/remove`, data);

export const leaveRoom = (roomId) => api.post(`/rooms/${roomId}/leave`);

export const deleteRoom = (roomId) => api.delete(`/rooms/${roomId}`);

export const searchUsers = (query) => api.get(`/users/search?query=${query}`);





// interceptors (auto refresh token) within the part-5
api.interceptors.response.use(
    (config) => {
        return config;
    },
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._isRetry
        ) {
            originalRequest._isRetry = true; 

            try {
                await axios.get(
                    `${import.meta.env.VITE_API_URL}/refresh`,
                    {
                        withCredentials: true,
                    }
                );

                return api.request(originalRequest);
            } catch (err) {
                console.log(err.message);
            }
        }

        throw error;
    }
);

export default api;