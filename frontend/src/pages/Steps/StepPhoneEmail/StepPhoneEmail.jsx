import React, { useState } from 'react';
import Phone from './Phone/Phone';
import Email from './Email/Email';

const phoneEmailMap = {
    phone: Phone,
    email: Email,
};

const StepPhoneEmail = ({ onNext }) => {
    const [type, setType] = useState('email');
    const Component = phoneEmailMap[type];

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">

            <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-5 sm:p-6 md:p-8">

                    {/* Tabs */}
                    <div className="flex justify-center gap-3 sm:gap-4 mb-6">

                        {/* Phone Button */}
                        <button
                            onClick={() => setType('phone')}
                            className={`p-2 sm:p-3 rounded-lg transition ${
                                type === 'phone'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-700'
                            }`}
                        >
                            <img
                                src="/images/phone-white.png"
                                alt="phone"
                                className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain"
                            />
                        </button>

                        {/* Email Button */}
                        <button
                            onClick={() => setType('email')}
                            className={`p-2 sm:p-3 rounded-lg transition ${
                                type === 'email'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-700'
                            }`}
                        >
                            <img
                                src="/images/mail-white.png"
                                alt="email"
                                className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 object-contain"
                            />
                        </button>

                    </div>

                    {/* Dynamic Component */}
                    <div className="w-full">
                        <Component onNext={onNext} />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StepPhoneEmail;