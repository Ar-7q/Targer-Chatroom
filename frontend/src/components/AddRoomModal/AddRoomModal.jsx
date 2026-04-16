import React, { useState } from 'react';
import styles from './AddRoomModal.module.css';
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
        <div className={styles.modalMask}>
            <div className={styles.modalBody}>
                <button onClick={onClose} className={styles.closeButton}>
                    <img src="/images/close.png" alt="close" className='h-10 w-10 cursor-pointer' />
                </button>

                <div className={styles.modalHeader}>
                    <h3 className={styles.heading}>
                        Enter the topic to be discussed
                    </h3>

                    <TextInput
                        fullwidth
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />

                    <h2 className={styles.subHeading}>Room types</h2>

                    <div className={styles.roomTypes}>
                        <div
                            onClick={() => setRoomType('open')}
                            className={`${styles.typeBox} ${roomType === 'open' ? styles.active : ''
                                }`}
                        >
                            <img src="/images/globe.png" alt="globe" />
                            <span>Open</span>
                        </div>

                        <div
                            onClick={() => setRoomType('social')}
                            className={`${styles.typeBox} ${roomType === 'social' ? styles.active : ''
                                }`}
                        >
                            <img src="/images/social.png" alt="social" />
                            <span>Social</span>
                        </div>

                        <div
                            onClick={() => setRoomType('private')}
                            className={`${styles.typeBox} ${roomType === 'private' ? styles.active : ''
                                }`}
                        >
                            <img src="/images/lock.png" alt="lock" />
                            <span>Private</span>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <h2>Start a room, open to everyone</h2>

                    <button
                        onClick={createRoom}
                        className={styles.footerButton}
                    >
                        <img src="/images/celebration.png" alt="celebration" />
                        <span>Let's go</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddRoomModal;