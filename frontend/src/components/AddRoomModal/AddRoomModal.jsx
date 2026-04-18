import React, { useState } from 'react';
import TextInput from '../shared/TextInput/TextInput';
import { createRoom as create } from '../../http';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AddRoomModal = ({ onClose }) => {
    const navigate = useNavigate();

    const [roomType, setRoomType] = useState('open');
    const [topic, setTopic] = useState('');

    async function createRoom() {
        try {
            if (!topic.trim()) {
                toast.error('Topic is required ❌');
                return;
            }

            const normalizedTopic = topic.trim().toLowerCase();

            const { data } = await create({
                topic: normalizedTopic,
                roomType
            });

            navigate(`/room/${data.id}`);
            onClose();

        } catch (err) {
            if (err.response?.data?.message === 'ROOM_ALREADY_EXISTS') {
                toast.error('Room name already exists, kindly choose another name');
            } else {
                toast.error('Room creation failed 🧰');
            }

            console.log(err.message);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
            <div className="bg-[#1d1d1d] w-full max-w-md rounded-2xl p-6 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4"
                >
                    <img
                        src="/images/close.png"
                        alt="close"
                        className="h-8 w-8 cursor-pointer"
                    />
                </button>

                {/* Header */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-white text-lg sm:text-xl font-semibold text-center">
                        Enter the topic to be discussed
                    </h3>

                    <TextInput
                        fullwidth
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />

                    <h2 className="text-gray-300 text-md font-medium">
                        Room types
                    </h2>

                    {/* Room Types */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { type: 'open', img: '/images/globe.png', label: 'Open' },
                            { type: 'social', img: '/images/social.png', label: 'Social' },
                            { type: 'private', img: '/images/lock.png', label: 'Private' },
                        ].map((item) => (
                            <div
                                key={item.type}
                                onClick={() => setRoomType(item.type)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer border transition 
                                ${roomType === item.type
                                        ? 'bg-blue-500/20 border-blue-500'
                                        : 'bg-[#2a2a2a] border-transparent hover:bg-[#333]'
                                    }`}
                            >
                                <img src={item.img} alt={item.label} className="h-8 w-8 mb-1" />
                                <span className="text-sm text-white">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex flex-col gap-4">
                    <h2 className="text-gray-400 text-sm text-center">
                        Start a room, open to everyone
                    </h2>

                    <button
                        onClick={createRoom}
                        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 transition text-white font-medium py-3 rounded-xl w-full"
                    >
                        <img
                            src="/images/celebration.png"
                            alt="celebration"
                            className="h-5 w-5"
                        />
                        <span>Let's go</span>
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddRoomModal;