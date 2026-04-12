import { Link } from 'react-router-dom';
import styles from './Navigation.module.css'; // ✅ kept (you already use it)

import { useDispatch, useSelector } from 'react-redux'; // ✅ ADDED
import { logout } from '../../../http/index'; // ⚠️ adjust path if needed
import { setAuth } from '../../../store/authSlice'; // ⚠️ adjust path if needed

const Navigation = () => {

    // ✅ ADDED (auth state)
    const { isAuth, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    console.log('USER DATA:', user);
    console.log('AVATAR:', user?.avatar);

    // ✅ ADDED (logout function)
    async function logoutUser() {
        try {
            await logout();
            dispatch(setAuth({ user: null })); // ✅ FIXED
        } catch (err) {
            console.log(err);
        }
    }

    return (
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

                    {/* Username */}
                    <h3 className="text-white text-sm font-medium">
                        {user?.name}
                    </h3>

                    {/* Avatar */}
                    <Link to="/">
                        <img
                            className="w-10 h-10 rounded-full border border-gray-700 object-cover"
                            src={
                                user?.avatar
                                    ? user.avatar
                                    : '/images/monkey-avatar.png'

                            }
                            alt="avatar"
                        />
                    </Link>

                    {/* Logout button */}
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
    );
};

export default Navigation;