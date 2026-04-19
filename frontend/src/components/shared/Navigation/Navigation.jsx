import { Link } from 'react-router-dom';
import styles from './Navigation.module.css';
import { useState, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../http/index';
import { setAuth } from '../../../store/authSlice';
import Profile from '../../../pages/Profile/Profile';

const Navigation = () => {

    const { isAuth, user } = useSelector((state) => state.auth);
    const [showProfile, setShowProfile] = useState(false);
    const dispatch = useDispatch();

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
    const avatarUrl = user?.avatar?.trim()
        ? user.avatar.trim()
        : "/images/monkey-avatar.png";

    return (
        <>
            {/* Navbar */}
            <nav className={`${styles.navbar} container px-4 md:px-0 flex items-center justify-between`}>

                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center text-white font-bold text-[18px] md:text-[22px] no-underline"
                >
                    <img
                        src="/images/logo.png"
                        alt="logo"
                        className="h-7 w-7 md:h-8 md:w-8 object-contain"
                    />
                    <span className="ml-2 text-base md:text-lg"> TarGerian </span>
                </Link>

                {/* Right Section */}
                {isAuth && (
                    <div className="flex items-center gap-2 md:gap-4">

                        {/* Username (hidden on very small screens) */}
                        <h3 className="hidden sm:block text-white text-sm font-medium">
                            {user?.name ? `Hello 😀.. ${user.name}` : 'Hello 😀..'}
                        </h3>

                        {/* Avatar */}
                        <img
                            onClick={() => setShowProfile(true)}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-700 object-cover cursor-pointer"
                            src={avatarUrl}
                            alt="avatar"
                        />

                        {/* Logout */}
                        <button
                            onClick={logoutUser}
                            className="p-1.5 md:p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
                        >
                            <img
                                src="/images/logout.png"
                                alt="logout"
                                className="w-4 h-4 md:w-5 md:h-5 cursor-pointer"
                            />
                        </button>
                    </div>
                )}
            </nav>

            {/* Profile Modal */}
            {showProfile && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setShowProfile(false)}
                >
                    <div
                        className="bg-gray-900 text-white p-4 md:p-6 rounded-lg relative w-[90%] max-w-[350px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowProfile(false)}
                            className="absolute top-2 right-2"
                        >
                            <img
                                src="/images/close.png"
                                className="w-8 h-8 md:w-10 md:h-10 cursor-pointer rounded-full hover:bg-black/80 transition"
                                alt="close"
                            />
                        </button>

                        <Profile />
                    </div>
                </div>
            )}
        </>
    );
};

export default Navigation;