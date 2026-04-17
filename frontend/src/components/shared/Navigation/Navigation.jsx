import { Link } from 'react-router-dom';
import styles from './Navigation.module.css';
import { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../http/index';
import { setAuth } from '../../../store/authSlice';
import Profile from '../../../pages/Profile/Profile';
import { useEffect } from 'react';

const Navigation = () => {


    const { isAuth, user } = useSelector((state) => state.auth);
    const [showProfile, setShowProfile] = useState(false);
    const dispatch = useDispatch();

    // console.log('USER DATA:', user);
    // console.log('AVATAR:', user?.avatar);


    useEffect(() => {
        if (showProfile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [showProfile]);


    async function logoutUser() {
        try {
            await logout();
            dispatch(setAuth({ user: null }));
        } catch (err) {
            console.log(err);
        }
    }

    const avatarUrl = user?.avatar
        ? new URL(user.avatar.replace(/\s/g, ''), "http://localhost:5000").href
        : "/images/monkey-avatar.png";

    console.log("FINAL AVATAR URL:", avatarUrl);

    return (
        <>
            <nav className={`${styles.navbar} container flex items-center justify-between`}>

                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center text-white font-bold text-[22px] no-underline"
                >
                    <img
                        src="/images/logo.png"
                        alt="logo"
                        className="h-8 w-8 object-contain"
                    />
                    <span className="ml-2"> TarGerian </span>
                </Link>


                {isAuth && (
                    <div className="flex items-center gap-4">


                        <h3 className="text-white text-sm font-medium">
                            {user?.name ? `Hello 😀.. ${user.name}` : 'Hello 😀..'}
                        </h3>

                        <img
                            onClick={() => setShowProfile(true)}
                            className="w-10 h-10 rounded-full border border-gray-700 object-cover cursor-pointer"
                            src={avatarUrl}
                            alt="avatar"
                        />




                        <button
                            onClick={logoutUser}
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
                        >
                            <span>
                                <img
                                    src="/images/logout.png"
                                    alt="logout"
                                    className="w-5 h-5 cursor-pointer"
                                />


                            </span>
                        </button>
                    </div>
                )}
            </nav>

            {
                showProfile && (
                    <div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowProfile(false)} // click outside close
                    >
                        <div
                            className="bg-gray-900 text-white p-6 rounded-lg relative w-[350px]"
                            onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
                        >
                            <button
                                onClick={() => setShowProfile(false)}
                                className="absolute top-2 right-2 text-black"
                            >
                                <img src='/images/close.png' className="w-10 h-10 cursor-pointer rounded-full  hover:bg-black/80 transition" />
                            </button>

                            <Profile />
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default Navigation;