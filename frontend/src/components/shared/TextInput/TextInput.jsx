import React from 'react';
import styles from './TextInput.module.css';

const TextInput = ({ fullwidth, ...props }) => {
    return (
        <div className={fullwidth ? styles.fullWidth : ''}>
            <input className={styles.input} type="text" {...props} />
        </div>
    );
};

export default TextInput;