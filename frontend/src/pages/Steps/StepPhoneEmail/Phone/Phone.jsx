import React, { useState } from 'react';
import Card from '../../../../components/shared/Card/Card';
import Button from '../../../../components/shared/Button/Button';
import styles from '../StepPhoneEmail.module.css';
import { sendOtp } from '../../../../http/index';
import { useDispatch } from 'react-redux';
import { setOtp } from '../../../../store/authSlice';

// ✅ NEW IMPORT
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { toast } from 'sonner';

const Phone = ({ onNext }) => {
    const [phone, setPhone] = useState('');
    const dispatch = useDispatch();

    async function submit() {
        if (!phone) {
            toast.error('Phone Number is Required ❌')
            return;
        }

        try{
        const { data } = await sendOtp({ phone }); // already includes +91
        toast.success('OTP sent on the Number..📩')
        console.log(data);

        dispatch(setOtp({ phone: data.phone, hash: data.hash }));
        onNext();}
        catch(err){
            toast.error('Failed to send OTP ❌')
            console.error(err);
            
        }
    }

    return (
        <Card title="Enter your phone number" icon="phone">
            <PhoneInput
                className={styles.phoneInput}
                placeholder="Enter phone number"
                value={phone}
                onChange={setPhone}
                defaultCountry="IN"
            />

            <div>
                <div className={styles.actionButtonWrap}>
                    <Button text="Next" onClick={submit} />
                </div>

                <p className={styles.bottomParagraph}>
                    By entering your number, you’re agreeing to our Terms of
                    Service and Privacy Policy. Thanks!
                </p>
            </div>
        </Card>
    );
};

export default Phone;