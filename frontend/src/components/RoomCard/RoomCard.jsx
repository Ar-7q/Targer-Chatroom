import React from 'react';
import styles from './RoomCard.module.css';

// ❌ import { useHistory } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // ✅ FIXED

const RoomCard = ({ room }) => {
    // ❌ const history = useHistory();
    const navigate = useNavigate(); // ✅ FIXED

    return (
        <div
            onClick={() => {
                // ❌ history.push(...)
                navigate(`/room/${room.id}`); // ✅ FIXED
            }}
            className={styles.card}
        >
            <h3 className={styles.topic}>{room.topic}</h3>

            <div
                className={`${styles.speakers} ${room.speakers.length === 1 ? styles.singleSpeaker : ''
                    }`}
            >
                <div className={styles.avatars}>
                    {room.speakers.map((speaker) => (
                        <img
                            key={speaker._id}
                            src={speaker.avatar} // ✅ FIX
                            alt="speaker-avatar"
                        />
                    ))}
                </div>

                <div className={styles.names}>
                    {room.speakers.map((speaker) => (
                        <div key={speaker._id} className={styles.nameWrapper}>
                            <span>{speaker.name}</span>
                            <img
                                src="/images/chat-bubble.png"
                                alt="chat-bubble"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.peopleCount}>
                <span>{room.totalPeople}</span>
                <img src="/images/user-icon.png" alt="user-icon" />
            </div>
        </div>
    );
};

export default RoomCard;