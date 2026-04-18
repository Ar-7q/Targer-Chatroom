import React, { useState, useEffect } from 'react';
import { sendUpdateOtp, updateProfile, verifyUpdateOtp } from '../../http/index';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from '../../store/authSlice';
import { toast } from 'sonner';
import socketInit from '../../socket';
import { ACTIONS } from '../../actions';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const socket = socketInit();

    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState('');
    const [preview, setPreview] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);

    const [otp, setOtp] = useState('');
    const [hash, setHash] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verified, setVerified] = useState(false);

    const [editingName, setEditingName] = useState(false);

    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [editingType, setEditingType] = useState(null);

    const originalName = user?.name || '';

    const isChanged = (editingName && name !== originalName) || avatar !== '';

    useEffect(() => {
        setOtpSent(false);
        setOtp('');
        setVerified(false);
    }, []);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
            setAvatar(reader.result);
            setPreview(reader.result);
        };
    };

    const handleSubmit = async () => {
        if (!name.trim()) return toast.error('Username required');

        setLoading(true);

        try {
            const payload = { name };
            if (avatar) payload.avatar = avatar;

            const { data } = await updateProfile(payload);
            dispatch(setAuth(data));

            socket.emit(ACTIONS.USER_UPDATED, {
                user: data.user
            });

            toast.success('Profile updated 😊');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        const currentValue = editingType === 'email' ? email : phone;
        const cleanContact = currentValue.trim();

        if (!cleanContact) return toast.error('Enter value');

        if (editingType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(cleanContact)) {
                return toast.error('Enter valid email');
            }
        }

        if (editingType === 'phone') {
            const digits = cleanContact.replace(/\D/g, '');
            if (digits.length !== 10) {
                return toast.error('Enter valid 10 digit phone number');
            }
        }

        setOtpLoading(true);

        try {
            const payload =
                editingType === 'email'
                    ? { email: cleanContact }
                    : { phone: cleanContact };

            const { data } = await sendUpdateOtp(payload);
            setHash(data.hash);
            setOtpSent(true);

            toast.success('OTP sent 📲');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) return toast.error('Enter OTP');

        try {
            const currentValue = editingType === 'email' ? email : phone;
            const cleanContact = currentValue.trim();

            const payload =
                editingType === 'email'
                    ? { email: cleanContact, otp, hash }
                    : { phone: cleanContact, otp, hash };

            const { data } = await verifyUpdateOtp(payload);

            dispatch(setAuth(data));
            toast.success('Updated successfully ❤️');

            setOtpSent(false);
            setOtp('');
            setVerified(true);
            setEditingType(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'OTP failed');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-[#1e1f22] text-white rounded-2xl shadow-xl overflow-hidden">

            {/* HEADER */}
            <div className="h-16 md:h-20 bg-gradient-to-r from-purple-500 to-indigo-500" />

            {/* AVATAR */}
            <div className="flex flex-col items-center -mt-10 px-4 md:px-6">
                <label className="cursor-pointer relative group">
                    <img
                        src={preview || '/images/monkey-avatar.png'}
                        alt="avatar"
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-[#1e1f22] object-cover"
                    />

                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-xs">Change</span>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImage}
                        className="hidden"
                    />
                </label>

                <p className="text-xs text-gray-400 mt-2">
                    Tap avatar to change
                </p>
            </div>

            {/* FORM */}
            <div className="px-4 md:px-6 py-5 flex flex-col gap-4">

                {/* USERNAME */}
                <div>
                    <p className="text-xs text-gray-400 mb-1">USERNAME</p>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            disabled={!editingName}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full text-sm md:text-base border rounded px-3 py-2 outline-none ${editingName
                                    ? 'bg-[#2b2d31] border-gray-700'
                                    : 'bg-gray-800 cursor-not-allowed border-gray-800'
                                }`}
                        />

                        <button
                            onClick={() => {
                                if (editingName) setName(originalName);
                                setEditingName(!editingName);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-700 px-2 py-1 rounded"
                        >
                            {editingName ? 'Cancel' : 'Edit'}
                        </button>
                    </div>
                </div>

                {/* EMAIL */}
                <div>
                    <p className="text-xs text-gray-400 mb-1">EMAIL</p>
                    <input
                        type="text"
                        value={email}
                        disabled={editingType !== 'email'}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-sm md:text-base border rounded px-3 py-2 outline-none bg-[#2b2d31]"
                    />

                    <button
                        onClick={() => setEditingType('email')}
                        className="mt-2 w-full py-2 bg-yellow-600 rounded text-sm"
                    >
                        Update Email
                    </button>
                </div>

                {/* PHONE */}
                <div>
                    <p className="text-xs text-gray-400 mb-1">PHONE</p>
                    <input
                        type="text"
                        value={phone}
                        disabled={editingType !== 'phone'}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-sm md:text-base border rounded px-3 py-2 outline-none bg-[#2b2d31]"
                    />

                    <button
                        onClick={() => setEditingType('phone')}
                        className="mt-2 w-full py-2 bg-yellow-600 rounded text-sm"
                    >
                        Update Phone
                    </button>
                </div>

                {/* SAVE */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !isChanged}
                    className={`w-full py-2 rounded text-sm md:text-base ${loading || !isChanged
                            ? 'bg-gray-600'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                >
                    {loading ? 'Updating...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default Profile;