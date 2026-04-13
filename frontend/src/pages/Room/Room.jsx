



// // FULL CODE OF ROOM.JSX

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom, leaveRoom, removeUser, inviteUser } from '../../http';
import { searchUsers } from '../../http';
import { toast } from 'sonner';
import socketInit from '../../socket';
import { ACTIONS } from '../../actions';

const Room = () => {
  const user = useSelector((state) => state.auth.user);
  const { id: roomId } = useParams();
  const [room, setRoom] = useState(null);

  const { clients, setClients, provideRef, handleMute, toggleHand } = useWebRTC(roomId, user);

  const navigate = useNavigate();
  const socket = socketInit();
  const [isMuted, setMuted] = useState(true);
  const [inviteId, setInviteId] = useState('');

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [showInvitedModal, setShowInvitedModal] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchRoom = async () => {
      try {
        const { data } = await getRoom(roomId);
        if (!isActive) return;
        setRoom(data);
      } catch (e) {
        if (e.response && e.response.status === 403) {
          isActive = false;
          navigate('/rooms');
          return;
        }
      }
    };

    fetchRoom();

    return () => {
      isActive = false;
    };
  }, [roomId]);

  //for updating the users profile at realtime
  useEffect(() => {
    socket.on(ACTIONS.USER_UPDATED, ({ user: updatedUser }) => {
      console.log('🔥 USER UPDATED:', updatedUser);

      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === updatedUser.id
            ? { ...client, ...updatedUser } // 🔥 update name/avatar
            : client
        )
      );


    });

    return () => {
      socket.off(ACTIONS.USER_UPDATED);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    handleMute(isMuted, user.id);
  }, [isMuted, user]);

  const handManualLeave = async () => {
    try {
      // ✅ FIX: Only close for private & social
      if (
        room?.ownerId?._id === user.id &&
        (room?.roomType === 'private' || room?.roomType === 'social')
      ) {
        socket.emit(ACTIONS.ROOM_CLOSED, { roomId });
      }
      toast.success('You have exited successfully from the room...')
      await leaveRoom(roomId);
      navigate('/rooms');
    } catch (e) {
      console.log(e);
    }
  };

  const handleRemoveUser = async (userIdToRemove) => {
    try {
      await removeUser(roomId, { userIdToRemove });

      socket.emit(ACTIONS.USER_KICKED, { userIdToRemove });

      const { data } = await getRoom(roomId);
      setRoom(data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSearch = async (value) => {
    setQuery(value);
    setInviteId(value);

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await searchUsers(value);
      const filtered = data.filter((u) => u._id !== user.id);
      setSearchResults(filtered);
    } catch (e) {
      console.log(e);
    }
  };

  const handleInvite = async () => {
    try {
      if (!inviteId.trim()) {
        toast.error('Please enter username..');
        return;
      }

      const isObjectId = /^[0-9a-fA-F]{24}$/.test(inviteId);

      if (isObjectId) {
        toast.error('Please enter username, not user ID');
        return;
      }

      await inviteUser(roomId, { userIdToAdd: inviteId });

      socket.emit(ACTIONS.USER_INVITED, {
        userIdToInvite: inviteId,
        roomId,
      });

      toast.success('User invited successfully');

      const { data } = await getRoom(roomId);
      setRoom(data);
      setInviteId('');
      setQuery('');
      setSearchResults([]);
    } catch (e) {
      console.log(e);
    }
  };

  const handleMuteClick = (clientId) => {
    if (clientId !== user.id) return;

    const newMuted = !isMuted;
    setMuted(newMuted);
    handleMute(newMuted, user.id);
  };

  if (!user) return null;

  return (
    <div>
      <div className="container">
        <button
          onClick={handManualLeave}
          className="flex items-center mt-8 bg-transparent outline-none cursor-pointer"
        >
          <img src="/images/arrow-left.png" alt="arrow-left" />
          <span className="ml-4 font-bold text-white text-base relative after:content-[''] after:absolute after:bottom-[-16px] after:left-0 after:w-[60%] after:h-[4px] after:bg-blue-500 after:rounded-lg">
            All voice rooms
          </span>
        </button>
      </div>

      <div className="bg-[#1d1d1d] mt-16 rounded-tl-2xl rounded-tr-2xl min-h-[calc(100vh-205px)] p-8">

        <div className="flex items-center justify-between border-b border-[#2f2f2f] pb-4">
          {room && (
            <h2 className="text-2xl font-extrabold text-white tracking-wide bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
              {room.topic}
            </h2>
          )}

          <div className="flex items-center">
            <button
              onClick={toggleHand}
              className={`ml-8 flex items-center px-4 py-2 rounded-2xl text-white cursor-pointer
  ${clients.find(c => c.id === user.id)?.handRaised
                  ? 'bg-yellow-500'
                  : 'bg-[#262626] hover:bg-[#333333]'
                }`}
            >
              <img src="/images/palm.png" alt="palm-icon" />
            </button>

            <button
              onClick={handManualLeave}
              className="bg-[#262626] ml-8 flex items-center px-4 py-2 rounded-2xl text-white hover:bg-[#333333] cursor-pointer"
            >
              <img src="/images/win.png" alt="win-icon" />
              📞
              <span className="font-bold ml-4">Leave quietly</span>
            </button>
          </div>
        </div>

        {/* INVITED USERS */}


        {room?.roomType === 'private' && room?.allowedUsers?.length > 1 && (
          <div
            className="mt-4 flex items-center gap-2 cursor-pointer"
            onClick={() => setShowInvitedModal(true)}
          >
            {/* Avatars */}
            <div className="flex -space-x-2">
              {room.allowedUsers
                .filter(u => u._id !== room.ownerId._id)
                .slice(0, 3)
                .map((u) => (
                  <img
                    key={u._id}
                    src={u.avatar}
                    className="w-8 h-8 rounded-full border-2 border-[#1d1d1d]"
                  />
                ))}
            </div>

            {/* Count */}
            {room.allowedUsers.length - 1 > 3 && (
              <span className="text-sm text-gray-400">
                +{room.allowedUsers.length - 4}
              </span>
            )}

            <span className="text-sm text-gray-300 ml-2">
              Invited Users
            </span>
          </div>
        )}




        {/* INVITE INPUT */}
        {room?.roomType === 'private' &&
          room?.ownerId._id === user.id && (
            <div className="mt-4 w-[320px]">

              {/* CHAT STYLE INPUT */}
              <div className="flex items-center bg-[#262626] rounded-full px-3 py-2 relative">

                <input
                  type="text"
                  placeholder="Search or invite..."
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none px-2 text-sm"
                />

                {/* SEND BUTTON */}
                <button
                  onClick={handleInvite}
                  className="bg-green-500 hover:bg-green-600 w-8 h-8 flex items-center justify-center rounded-full text-white cursor-pointer"
                >
                  ➤
                </button>

                {/* DROPDOWN */}
                {searchResults.length > 0 && (
                  <div className="absolute bottom-[45px] left-0 w-full bg-[#1f1f1f] rounded-lg border border-gray-700 z-50 max-h-[150px] overflow-y-auto shadow-lg">
                    {searchResults.map((u) => (
                      <div
                        key={u._id}
                        onClick={() => {
                          setInviteId(u.name);
                          setQuery(u.name);
                          setSearchResults([]);
                        }}
                        className="flex items-center gap-3 p-2 cursor-pointer hover:bg-[#333]"
                      >
                        <img src={u.avatar} className="w-7 h-7 rounded-full" />
                        <span className="text-white text-sm">{u.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        {/* Clients */}
        <div className="mt-8 flex items-center flex-wrap gap-[30px]">
          {clients.map((client) => {
            return (
              <div className="flex flex-col items-center" key={client.id}>
                <div
                  className={`w-[90px] h-[90px] rounded-full border-[3px] relative 
                  ${client.muted
                      ? 'border-[#5453e0]'
                      : 'border-green-400 shadow-[0_0_20px_#22c55e]'
                    }
                  ${room?.roomType !== 'public' &&
                      (room?.ownerId?._id || room?.ownerId) === client.id
                      ? 'border-violet-500 shadow-[0_0_20px_#8b5cf6] animate-pulse'
                      : ''
                    }`}
                >
                  <img
                    className="w-full h-full rounded-full object-cover"
                    src={client.avatar}
                    alt=""
                  />

                  {client.handRaised && (
                    <span className="absolute -top-2 right-0 text-yellow-400 text-xl animate-bounce">
                      ✋
                    </span>
                  )}

                  {/* ✅ FIX: Host only in private/social */}
                  {(room?.roomType === 'private' || room?.roomType === 'social') &&
                    (room?.ownerId?._id || room?.ownerId) === client.id && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] px-2 py-[2px] rounded-full shadow-md">
                        HOST
                      </span>
                    )}

                  <audio
                    autoPlay
                    playsInline
                    ref={(instance) => {
                      provideRef(instance, client.id);
                    }}
                  />

                  <button
                    onClick={() => handleMuteClick(client.id)}
                    className="bg-[#212121] absolute bottom-0 right-0 w-[30px] h-[30px] rounded-full p-[5px] cursor-pointer"
                  >
                    {client.muted ? (
                      <img src="/images/mic-mute.png" alt="mic" />
                    ) : (
                      <img src="/images/mic.png" alt="mic" />
                    )}
                  </button>
                </div>

                <h4 className="font-bold mt-4">{client.name}</h4>
              </div>
            );
          })}
        </div>
      </div>

      {showInvitedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

          <div className="bg-[#1f1f1f] p-5 rounded-xl w-[350px] max-h-[400px] overflow-y-auto relative">

            {/* Close */}
            <button
              onClick={() => setShowInvitedModal(false)}
              className="absolute top-2 right-3 text-white text-lg cursor-pointer"
            >
              ❌
            </button>

            <h3 className="text-white font-bold mb-4">
              Invited Users
            </h3>

            {room.allowedUsers
              .filter(u => u._id !== room.ownerId._id)
              .map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between bg-[#262626] px-3 py-2 rounded-lg mb-2"
                >
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} className="w-8 h-8 rounded-full" />
                    <span className="text-white text-sm">{u.name}</span>
                  </div>

                  {/* Remove */}
                  {room.ownerId._id === user.id && (
                    <button
                      onClick={() => handleRemoveUser(u._id)}
                      className="text-red-400 hover:text-red-600 cursor-pointer"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Room;



