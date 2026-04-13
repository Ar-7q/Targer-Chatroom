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
    const socket = socketInit()

    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState('');
    const [preview, setPreview] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);

    // const [contact, setContact] = useState(user?.email || user?.phone || '');
    const [otp, setOtp] = useState('');
    const [hash, setHash] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    
    const [editingName, setEditingName] = useState(false);

    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [editingType, setEditingType] = useState(null); // 'email' or 'phone'

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
        if (!name.trim()) {
            return toast.error('Username required');
        }

        setLoading(true);

        try {
            const payload = { name };
            if (avatar) payload.avatar = avatar;

            const { data } = await updateProfile(payload);

            dispatch(setAuth(data));

            socket.emit(ACTIONS.USER_UPDATED, {
                user: data.user
            });

            toast.success('Profile updated ✅');

        } catch (err) {
            console.log("UPDATE ERROR:", err);
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        
        const currentValue = editingType === 'email' ? email : phone;

        if (!currentValue) return toast.error('Enter value');


        setOtpLoading(true);

        try {
            
            const currentValue = editingType === 'email' ? email : phone;
            const cleanContact = currentValue.trim();

            const payload = editingType === 'email'
                ? { email: cleanContact }
                : { phone: cleanContact };
            const { data } = await sendUpdateOtp(payload);

            setHash(data.hash);
            setOtpSent(true);

            toast.success('OTP sent ✅');

        } catch (err) {
            console.log("OTP ERROR:", err);
            console.log("RESPONSE:", err.response);

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

            const payload = editingType === 'email'
                ? { email: cleanContact, otp, hash }
                : { phone: cleanContact, otp, hash };

            const { data } = await verifyUpdateOtp(payload);

            dispatch(setAuth(data));
            toast.success('Updated successfully ✅');

            setOtpSent(false);
            setOtp('');
            setVerified(true);
            setEditingType(null); // 🔥 important

        } catch (err) {
            console.log("VERIFY ERROR:", err);
            toast.error(err.response?.data?.message || 'OTP failed');
        }
    };

    return (
        <div className="w-[350px] bg-[#1e1f22] text-white rounded-2xl shadow-xl overflow-hidden">

            {/* Header */}
            <div className="h-20 bg-gradient-to-r from-purple-500 to-indigo-500" />

            {/* Avatar Section */}
            <div className="flex flex-col items-center -mt-10 px-6">

                <label className="cursor-pointer relative group">
                    <img
                        src={preview || '/images/monkey-avatar.png'}
                        alt="avatar"
                        className="w-20 h-20 rounded-full border-4 border-[#1e1f22] object-cover"
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
                    Click avatar to change
                </p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">

                {/* Username */}
                <div>
                    <p className="text-xs text-gray-400 mb-1">USERNAME</p>
                    <div className="relative">
                        <input
                            type="text"
                            value={name}
                            disabled={!editingName}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full border rounded px-3 py-2 outline-none ${editingName
                                ? 'bg-[#2b2d31] border-gray-700 focus:border-indigo-500'
                                : 'bg-gray-800 cursor-not-allowed border-gray-800'
                                }`}
                        />

                        {/* ✏️ Edit Button */}
                        <button
                            type="button"
                            onClick={() => {
                                if (editingName) {
                                    setName(originalName); // revert if cancel
                                }
                                setEditingName(!editingName);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
                        >
                            {editingName ? 'Cancel' : 'Edit'}
                        </button>
                    </div>
                </div>

                {/* Contact Update */}
                <div>

                    {/* EMAIL SECTION */}
                    <p className="text-xs text-gray-400 mb-1">EMAIL</p>

                    <input
                        type="text"
                        value={email}
                        disabled={editingType !== 'email'}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full border rounded px-3 py-2 outline-none ${editingType === 'email'
                            ? 'bg-[#2b2d31] border-gray-700'
                            : 'bg-gray-800 cursor-not-allowed border-gray-800'
                            }`}
                        placeholder="Enter email"
                    />

                    {editingType !== 'email' ? (
                        <button
                            onClick={() => {
                                setEditingType('email');
                                setOtpSent(false);
                                setOtp('');
                                setVerified(false);
                            }}
                            className="mt-2 w-full py-2 bg-yellow-600 rounded"
                        >
                            {email ? 'Update Email' : 'Add Email'}
                        </button>
                    ) : !otpSent ? (
                        <button
                            onClick={handleSendOtp}
                            className="mt-2 w-full py-2 bg-green-600 rounded"
                        >
                            Send OTP
                        </button>
                    ) : (
                        <>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                className="mt-2 w-full bg-[#2b2d31] border rounded px-3 py-2"
                            />

                            <button
                                onClick={handleVerifyOtp}
                                className="mt-2 w-full py-2 bg-indigo-600 rounded"
                            >
                                Verify & Update
                            </button>
                        </>
                    )}

                    {/* PHONE SECTION */}
                    <p className="text-xs text-gray-400 mt-4 mb-1">PHONE</p>

                    <input
                        type="text"
                        value={phone}
                        disabled={editingType !== 'phone'}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full border rounded px-3 py-2 outline-none ${editingType === 'phone'
                            ? 'bg-[#2b2d31] border-gray-700'
                            : 'bg-gray-800 cursor-not-allowed border-gray-800'
                            }`}
                        placeholder="Enter phone"
                    />

                    {editingType !== 'phone' ? (
                        <button
                            onClick={() => {
                                setEditingType('phone');
                                setOtpSent(false);
                                setOtp('');
                                setVerified(false);
                            }}
                            className="mt-2 w-full py-2 bg-yellow-600 rounded"
                        >
                            {phone ? 'Update Phone' : 'Add Phone'}
                        </button>
                    ) : null}

                </div>

                {/* Save Profile */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !isChanged}
                    className={`w-full py-2 rounded font-medium transition ${loading || !isChanged
                        ? 'bg-gray-600 cursor-not-allowed'
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