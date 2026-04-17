import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAuth } from '../store/authSlice';

export function useLoadingWithRefresh() {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        (async () => {
            try {
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_URL}/refresh`,
                    {
                        withCredentials: true,
                    }
                );

                dispatch(setAuth(data)); // always works now
            } catch (err) {
                console.error(err); // optional
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return { loading };
}
