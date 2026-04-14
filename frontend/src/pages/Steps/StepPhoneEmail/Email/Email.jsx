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

    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    async function submit() {
        if (disabled) return; // prevent spam clicks

        if (!email) {
            toast.error('Email is Required ❌');
            return;
        }

        if (!emailRegex.test(email)) {
            toast.error('Enter a valid email ❌');
            return;
        }

        setLoading(true);
        setDisabled(true); //disable button

        try {
            const { data } = await sendOtp({ email });
            toast.success('OTP sent on Email 📩');

            console.log('Sending OTP to-> ', email);
            console.log(data);

            dispatch(setOtp({ email: data.email, hash: data.hash }));
            onNext();
        } catch (err) {
            toast.error('Failed to send OTP ❌');
            console.error(err);
        }

        setLoading(false);

        // ⏳ enable button after 30 sec
        setTimeout(() => setDisabled(false), 30000);
    }

    return (
        <Card title="Enter your email id" icon="email-emoji">
            <TextInput
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <div>
                <div className={styles.actionButtonWrap}>
                    <Button
                        text={disabled ? "Wait 30s..." : loading ? "Sending..." : "Next"}
                        onClick={submit}
                        disabled={disabled || !emailRegex.test(email)}
                    />
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