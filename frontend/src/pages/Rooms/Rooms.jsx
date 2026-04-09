import React, { useState, useEffect } from 'react';
import AddRoomModal from '../../components/AddRoomModal/AddRoomModal';
import RoomCard from '../../components/RoomCard/RoomCard';
import styles from './Rooms.module.css';
import { getAllRooms } from '../../http/index';

const Rooms = () => {
  const [showModal, setShowModal] = useState(false);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await getAllRooms();
      setRooms(data);
    };
    fetchRooms();
  }, []);

  function openModal() {
    setShowModal(true);
  }

  // ✅ SPLIT ROOMS
  const openRooms = rooms.filter((room) => room.roomType === 'open');
  const socialRooms = rooms.filter((room) => room.roomType === 'social');
  const privateRooms = rooms.filter((room) => room.roomType === 'private');

  return (
    <>
      <div className="container">
        {/* HEADER */}
        <div className={styles.roomsHeader}>
          <div className={styles.left}>
            <span className={styles.heading}>All voice rooms</span>

            <div className={styles.searchBox}>
              <img src="/images/search-icon.png" alt="search" />
              <input type="text" className={styles.searchInput} />
            </div>
          </div>

          <div className={styles.right}>
            <button
              onClick={openModal}
              className={styles.startRoomButton}
            >
              <img src="/images/add-room-icon.png" alt="add-room" />
              <span>Start a room</span>
            </button>
          </div>
        </div>

        {/* 🌍 PUBLIC ROOMS */}
        {openRooms.length > 0 && (
          <>
            <h2 className="text-white text-xl font-bold mt-8 mb-2 flex items-center gap-2">
              🌍 Public Rooms
            </h2>

            <div className={styles.roomList}>
              {openRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </>
        )}

        {/* 👥 SOCIAL ROOMS */}
        {socialRooms.length > 0 && (
          <>
            <h2 className="text-white text-xl font-bold mt-10 mb-2 flex items-center gap-2">
              👥 Your Social Rooms
            </h2>

            <div className={styles.roomList}>
              {socialRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </>
        )}

        {/* 🔒 PRIVATE ROOMS */}
        {privateRooms.length > 0 && (
          <>
            <h2 className="text-white text-xl font-bold mt-10 mb-2 flex items-center gap-2">
              🔒 Private Rooms
            </h2>

            <div className={styles.roomList}>
              {privateRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </>
        )}
      </div>

      {showModal && <AddRoomModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Rooms;