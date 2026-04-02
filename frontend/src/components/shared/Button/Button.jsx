import React from 'react';
import styles from './Button.module.css';
const Button = ({ text, onClick }) => {
    return (
        <button onClick={onClick} className={styles.button}>
            <span>{text}</span>
            <img
                // className={styles.arrow}
                src="/images/arrow-forward.png"
                  className="h-8 w-8 object-contain"
                alt="arrow"
            />
        </button>
    );
};
export default Button; 