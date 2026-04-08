import React, { useState } from 'react';
import Card from '../../../../components/shared/Card/Card';
import Button from '../../../../components/shared/Button/Button';
import TextInput from '../../../../components/shared/TextInput/TextInput';
import styles from '../StepPhoneEmail.module.css';
import { sendOtp } from '../../../../http/index';
import { useDispatch } from 'react-redux';
import { setOtp } from '../../../../store/authSlice';
import { toast } from 'sonner';

const Email = ({ onNext }) => {
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();

    async function submit() {
        if (!email) {
            toast.error('Email is Required ❌');
            return;
        }

        // simple email validation (minimal, no overengineering)
        if (!email.includes('@')) {
            toast.error('Enter a valid email ❌');
            return;
        }

        try {
            const { data } = await sendOtp({ email }); // 🔥 send email instead of phone
            toast.success('OTP sent on Email 📩');
            console.log('Sending OTP to-> ',email);
            
            console.log(data);

            dispatch(setOtp({ email: data.email, hash: data.hash }));
            onNext();
        } catch (err) {
            toast.error('Failed to send OTP ❌');
            console.error(err);
        }
    }

    return (
        <Card title="Enter your email id" icon="email-emoji">
            <TextInput
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <div>
                <div className={styles.actionButtonWrap}>
                    <Button text="Next" onClick={submit} />
                </div>
                <p className={styles.bottomParagraph}>
                    By entering your email, you’re agreeing to our Terms of
                    Service and Privacy Policy. Thanks!
                </p>
            </div>
        </Card>
    );
};

export default Email;