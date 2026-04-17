import React, { useState } from 'react';
import Card from '../../../../components/shared/Card/Card';
import Button from '../../../../components/shared/Button/Button';
import styles from '../StepPhoneEmail.module.css';
import { sendOtp } from '../../../../http/index';
import { useDispatch } from 'react-redux';
import { setOtp } from '../../../../store/authSlice';


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

        const digits = phone.replace(/\D/g, '');

        //check Indian 10-digit number

        if (!(digits.startsWith('91') && digits.length === 12)) {
            toast.error('Enter valid 10 digit phone number ❌');
            return;
        }

        try {
            const { data } = await sendOtp({ phone }); // already includes +91
            toast.success('OTP sent on the Number..📩')
            console.log(data);

            dispatch(setOtp({ phone: data.phone, hash: data.hash }));
            onNext();
        }
        catch (err) {
            toast.error('Failed to send OTP ❌')
            console.error(err);

        }
    }

    return (
        <Card title="Enter your phone number" icon="phone">

            <div className="w-full flex flex-col items-center">

                {/* Phone Input Wrapper */}
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
                    <PhoneInput
                        className={`${styles.phoneInput} w-full`}
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={setPhone}
                        defaultCountry="IN"
                    />
                </div>

                {/* Button + Text */}
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mt-4">

                    <div className={styles.actionButtonWrap}>
                        <Button
                            text="Next"
                            onClick={submit}
                            disabled={!phone || phone.replace(/\D/g, '').length !== 12}
                        />
                    </div>

                    <p className={`${styles.bottomParagraph} text-center text-xs sm:text-sm px-2`}>
                        By entering your number, you’re agreeing to our Terms of
                        Service and Privacy Policy. Thanks!
                    </p>

                </div>

            </div>

        </Card>
    );

};

export default Phone;