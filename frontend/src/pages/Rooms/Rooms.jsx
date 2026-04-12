import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import AddRoomModal from '../../components/AddRoomModal/AddRoomModal';
import RoomCard from '../../components/RoomCard/RoomCard';
import styles from './Rooms.module.css';
import { getAllRooms } from '../../http/index';

const Rooms = () => {
  const [showModal, setShowModal] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('public');
  const [search, setSearch] = useState('');

  const user = useSelector((state) => state.auth.user);
  // console.log("CURRENT USER:", user);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await getAllRooms();
        setRooms(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRooms();

    // 🔥 AUTO REFRESH EVERY 3 SECONDS
    const interval = setInterval(fetchRooms, 1500);

    return () => clearInterval(interval); // cleanup
  }, []);

  function openModal() {
    setShowModal(true);
  }

  const openRooms = rooms.filter((room) => {
    const ownerId = room.ownerId?._id || room.ownerId;
    const userId = user?.id || user?._id;

    const matchesSearch = room.topic
      .toLowerCase()
      .includes(search.toLowerCase());

    return (
      matchesSearch &&
      (room.roomType === 'open' ||
        (room.roomType === 'social' &&
          String(ownerId) !== String(userId)))
    );
  });

  const socialRooms = rooms.filter((room) => {
    const ownerId = room.ownerId?._id || room.ownerId;
    const userId = user?.id || user?._id;

    const matchesSearch = room.topic
      .toLowerCase()
      .includes(search.toLowerCase());

    return (
      matchesSearch &&
      room.roomType === 'social' &&
      String(ownerId) === String(userId)
    );
  });

  const privateRooms = rooms.filter((room) => room.roomType === 'private');

  return (
    <>
      {/* ✅ Added padding for breathing space */}
      <div className="container px-6 py-4">

        {/* HEADER */}
        <div className={`${styles.roomsHeader} mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4`}>
          <div className={styles.left}>
            <span className={styles.heading}>All voice rooms</span>

            <div className={styles.searchBox}>
              <img src="/images/search-icon.png" alt="search" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
                placeholder="Search rooms..."
              />
            </div>
          </div>

          <div className={styles.right}>
            <button
              onClick={openModal}
              className={`${styles.startRoomButton} flex items-center gap-2 whitespace-nowrap`}
            >
              <img src="/images/add-room-icon.png" alt="add-room" />

              {/* Hide text on very small screens */}
              <span className="hidden md:inline">Start a room</span>
            </button>
          </div>
        </div>

        {/* ✅ TABS (better spacing + Discord feel) */}
        <div className="flex gap-3 mt-6 bg-[#1c1c1c] p-2 rounded-xl w-fit shadow-md">
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-1.5 rounded-lg text-sm transition ${activeTab === 'public'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            🌍 Public ({openRooms.length})
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-1.5 rounded-lg text-sm transition ${activeTab === 'social'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            👥 Social ({socialRooms.length})
          </button>

          <button
            onClick={() => setActiveTab('private')}
            className={`px-4 py-1.5 rounded-lg text-sm transition ${activeTab === 'private'
              ? 'bg-yellow-600 text-white'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <div className="relative flex items-center gap-2 pr-3">
              <span>🔒 Private</span>

              {privateRooms.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-[2px] rounded-full font-bold shadow-md">
                  {privateRooms.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* ✅ EXTRA SPACE BETWEEN TABS AND CONTENT */}
        <div className="mt-10"></div>

        {/* PUBLIC */}
        {activeTab === 'public' && (openRooms.length > 0 ? (
          <>
            <h2 className="text-white text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
              🌍 Public Rooms ({openRooms.length})
            </h2>

            <div className={`${styles.roomList} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6`}>
              {openRooms.map((room, index) => (
                <RoomCard key={room._id || index} room={room} currentUser={user} />
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center mt-10">
            😕 Oops! No rooms found
          </p>
        ))}

        {/* SOCIAL */}
        {activeTab === 'social' && (socialRooms.length > 0 ? (
          <>
            <h2 className="text-white text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
              👥 Social Rooms ({socialRooms.length})
            </h2>

            <div className={`${styles.roomList} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6`}>
              {socialRooms.map((room, index) => (
                <RoomCard key={room._id || index} room={room} currentUser={user} />
              ))}
            </div>
          </>
        ) : (<p className="text-gray-400 text-center mt-10">
          😕 Oops! No rooms found
        </p>
        ))}

        {/* PRIVATE */}
        {activeTab === 'private' && (privateRooms.length > 0 ? (
          <>
            <h2 className="text-white text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
              🔒 Private Rooms ({privateRooms.length})
              <span className={styles.activeBlink}>ACTIVE</span>
            </h2>

            <div className={`${styles.roomList} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6`}>
              {privateRooms.map((room, index) => (
                <RoomCard key={room._id || index} room={room} currentUser={user} />
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center mt-10">
            🔒 No private rooms found
          </p>
        ))}
      </div>

      {showModal && <AddRoomModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Rooms;