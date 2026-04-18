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
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
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
      <div className="container px-4 sm:px-6 py-4">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          {/* LEFT */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            <span className="text-white text-lg md:text-xl font-semibold">
              All voice rooms
            </span>

            {/* SEARCH */}
            <div className="flex items-center bg-[#1c1c1c] px-3 py-2 rounded-lg w-full sm:w-auto">
              <img src="/images/search-icon.png" alt="search" className="w-4 h-4 opacity-70" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search rooms..."
                className="bg-transparent outline-none text-sm text-white ml-2 w-full sm:w-[180px]"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex justify-end">
            <button
              onClick={openModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm whitespace-nowrap"
            >
              <img src="/images/add-room-icon.png" alt="add-room" className="w-4 h-4" />
              <span className="hidden sm:inline">Start a room</span>
            </button>
          </div>
        </div>

        {/* TABS (SCROLLABLE ON MOBILE) */}
        <div className="flex gap-3 mt-4 bg-[#1c1c1c] p-2 rounded-xl shadow-md overflow-x-auto">

          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-1.5 rounded-lg text-sm whitespace-nowrap ${activeTab === 'public'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            🌍 Public ({openRooms.length})
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-1.5 rounded-lg text-sm whitespace-nowrap ${activeTab === 'social'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            👥 Social ({socialRooms.length})
          </button>

          <button
            onClick={() => setActiveTab('private')}
            className={`px-4 py-1.5 rounded-lg text-sm whitespace-nowrap ${activeTab === 'private'
              ? 'bg-yellow-600 text-white'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <div className="relative flex items-center gap-2 pr-3">
              <span>🔒 Private</span>

              {privateRooms.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-[2px] rounded-full font-bold">
                  {privateRooms.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* ROOMS */}
        <div className="mt-8">

          {/* PUBLIC */}
          {activeTab === 'public' && (
            openRooms.length > 0 ? (
              <>
                <h2 className="text-white text-lg md:text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                  🌍 Public Rooms ({openRooms.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                  {openRooms.map((room, index) => (
                    <RoomCard key={room._id || index} room={room} currentUser={user} />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center mt-10">
                😕 Oops! No rooms found
              </p>
            )
          )}

          {/* SOCIAL */}
          {activeTab === 'social' && (
            socialRooms.length > 0 ? (
              <>
                <h2 className="text-white text-lg md:text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                  👥 Social Rooms ({socialRooms.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                  {socialRooms.map((room, index) => (
                    <RoomCard key={room._id || index} room={room} currentUser={user} />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center mt-10">
                😕 Oops! No rooms found
              </p>
            )
          )}

          {/* PRIVATE */}
          {activeTab === 'private' && (
            privateRooms.length > 0 ? (
              <>
                <h2 className="text-white text-lg md:text-xl font-semibold mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                  🔒 Private Rooms ({privateRooms.length})
                  <span className={styles.activeBlink}>ACTIVE</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                  {privateRooms.map((room, index) => (
                    <RoomCard key={room._id || index} room={room} currentUser={user} />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center mt-10">
                🔒 No private rooms found
              </p>
            )
          )}
        </div>
      </div>

      {showModal && <AddRoomModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Rooms;