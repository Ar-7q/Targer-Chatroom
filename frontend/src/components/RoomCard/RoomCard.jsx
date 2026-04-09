import React from 'react';
import styles from './RoomCard.module.css';
import { useNavigate } from 'react-router-dom';

const RoomCard = ({ room }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/room/${room.id}`)}
            className={`${styles.card} hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
        >
            {/* 🔥 TOP: TOPIC + BADGE */}
            <div className="flex justify-between items-center">
                <h3 className={`${styles.topic} text-white font-bold`}>
                    {room.topic}
                </h3>

                {/* ✅ ROOM TYPE BADGE */}
                <span
                    className={`text-xs px-2 py-1 rounded-md text-white capitalize ${
                        room.roomType === 'open'
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
                className={`${styles.speakers} ${
                    room.speakers.length === 1 ? styles.singleSpeaker : ''
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

            {/* PEOPLE COUNT */}
            <div className={`${styles.peopleCount} text-gray-300`}>
                <span>{room.totalPeople || room.speakers.length}</span>
                <img
                    src="/images/user-icon.png"
                    alt="user-icon"
                    className="inline ml-1"
                />
            </div>
        </div>
    );
};

export default RoomCard;