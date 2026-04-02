import { Link } from 'react-router-dom';
import styles from './Navigation.module.css';

const Navigation = () => {
    return (
        <nav className={`${styles.navbar} container`}>
            <Link
                to="/"
                className="flex items-center text-white font-bold text-[22px] no-underline"
            >
                <img src="/images/logo.png" alt="logo" className="h-8 w-8 object-contain" />
                <span className="ml-2"> TarGerian </span>
            </Link>
        </nav>
    );
}

export default Navigation;