import React from 'react';
import styles from './RoomCard.module.css';
import { useNavigate } from 'react-router-dom';

import { deleteRoom } from '../../http';
import { toast } from 'sonner';

const RoomCard = ({ room, currentUser }) => {

    const navigate = useNavigate();

    
    const roomId = room._id || room.id;

    
    const userId = currentUser?.id || currentUser?._id;
    const ownerId = room.ownerId?._id || room.ownerId;

    const isOwner = String(userId) === String(ownerId);

    const handleDelete = async (e) => {
        e.stopPropagation();

        try {
            await deleteRoom(roomId);
            toast.success('Room deleted successfully');

            // (keeping your approach)
            window.location.reload();
        } catch (err) {
            toast.error('Failed to delete room');
        }
    };

    return (
        <div
            onClick={() => navigate(`/room/${roomId}`)}
            className={`${styles.card} relative hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
        >
            
            {room.roomType === 'social' && isOwner && (
                <button
                    onClick={handleDelete}
                    className="
        absolute top-2 right-2
        bg-red-500/20
        text-red-400
        hover:bg-red-500 hover:text-white
        rounded-full
        w-7 h-7
        flex items-center justify-center
        text-xs font-bold
        shadow-md
        hover:shadow-red-500/50
        transition-all duration-200
        z-20
    "
                >
                    ✖
                </button>
            )}

            {/* 🔥 TOP: TOPIC + BADGE */}
            <div className="flex items-start pr-10 gap-2">

                {/* TITLE */}
                <h3
                    className={`${styles.topic} text-white font-bold flex-1 truncate`}
                    title={room.topic}
                >
                    {room.topic}
                </h3>

                {/* BADGE (fixed size, no shrink) */}
                <span
                    className={`text-xs px-2 py-1 rounded-md text-white capitalize flex-shrink-0 ${room.roomType === 'open'
                            ? 'bg-green-500'
                            : room.roomType === 'social'
                                ? 'bg-blue-500'
                                : 'bg-yellow-500'
                        }`}
                >
                    {room.roomType}
                </span>
            </div>

            {/* SPEAKERS */}
            <div
                className={`${styles.speakers} ${room.speakers.length === 1 ? styles.singleSpeaker : ''
                    }`}
            >
                <div className={styles.avatars}>
                    {room.speakers.map((speaker) => (
                        <img
                            key={speaker._id}
                            src={speaker.avatar}
                            alt="speaker-avatar"
                        />
                    ))}
                </div>

                <div className={styles.names}>
                    {room.speakers.map((speaker) => (
                        <div
                            key={speaker._id}
                            className={`${styles.nameWrapper} flex items-center`}
                        >
                            <span className="text-white">
                                {speaker.name}
                            </span>
                            <img
                                src="/images/chat-bubble.png"
                                alt="chat-bubble"
                                className="ml-1"
                            />
                        </div>
                    ))}
                </div>
            </div>

            
        </div>
    );
};

export default RoomCard;