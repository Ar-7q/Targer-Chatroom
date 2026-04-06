import { useState, useEffect, useRef } from 'react'; // ✅ added useRef
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice';

export function useLoadingWithRefresh() {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const effectRan = useRef(false); // ✅ prevent double call

    useEffect(() => {
        if (effectRan.current) return; // ✅ FIX (React Strict Mode issue)
        effectRan.current = true;

        (async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_URL}/refresh`,
                    {
                        withCredentials: true,
                    }
                );

                dispatch(setAuth(data));
            } catch (err) {
                // ✅ ignore 401 (user not logged in)
                if (err.response?.status !== 401) {
                    console.error(err); // optional: log other errors
                }
            } finally {
                setLoading(false); // ✅ always stop loading
            }
        })();
    }, []);

    return { loading };
}
