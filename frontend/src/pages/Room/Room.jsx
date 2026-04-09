// import React from 'react'
// import { useSelector } from 'react-redux'
// import { useParams } from 'react-router-dom'
// import { useWebRTC } from '../../hooks/useWebRTC'

// const Room = () => {

//   const { id: roomId } = useParams()
//   const user = useSelector((state) => state.auth.user)

//   const { clients, provideRef } = useWebRTC(roomId, user)

//   return (
//     <div>
//       <h1>
//         All connected Clients
//       </h1>

//       {clients?.map((client, index) => {
//         return (
//           <div key={`${client.id}-${index}`}>

//             <audio
//               ref={(instance) => provideRef(instance, client.id)}
//               controls autoPlay></audio>
//             <h4>
//               {client.name}
//             </h4>
//           </div>
//         )
//       })}

//     </div>
//   )
// }

// export default Room



// FULL CODE OF ROOM.JSX

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom, leaveRoom, removeUser, inviteUser } from '../../http';
import { searchUsers } from '../../http'; // ⭐ ADDED

const Room = () => {
  const user = useSelector((state) => state.auth.user);
  const { id: roomId } = useParams();
  const [room, setRoom] = useState(null);

  const { clients, provideRef, handleMute } = useWebRTC(roomId, user);

  const navigate = useNavigate();

  const [isMuted, setMuted] = useState(true);
  const [inviteId, setInviteId] = useState('');

  // ⭐ ADDED (search state)
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // ✅ FETCH ROOM
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await getRoom(roomId);
        setRoom(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (!user) return;
    handleMute(isMuted, user.id);
  }, [isMuted, user]);

  const handManualLeave = async () => {
    try {
      await leaveRoom(roomId);
      navigate('/rooms');
    } catch (e) {
      console.log(e);
    }
  };

  const handleRemoveUser = async (userIdToRemove) => {
    try {
      await removeUser(roomId, { userIdToRemove });

      const { data } = await getRoom(roomId);
      setRoom(data);
    } catch (e) {
      console.log(e);
    }
  };

  // ⭐ ADDED (search function)
  const handleSearch = async (value) => {
    setQuery(value);
    setInviteId(value); // keep compatibility with existing logic

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await searchUsers(value);
      setSearchResults(data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleInvite = async () => {
    try {
      if (!inviteId.trim()) return;

      const isObjectId = /^[0-9a-fA-F]{24}$/.test(inviteId);

      if (isObjectId) {
        alert('Please enter username, not user ID');
        return;
      }

      await inviteUser(roomId, { userIdToAdd: inviteId });

      const { data } = await getRoom(roomId);
      setRoom(data);
      setInviteId('');
      setQuery('');          // ⭐ ADDED
      setSearchResults([]);  // ⭐ ADDED
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

        <div className="flex items-center justify-between">
          {room && (
            <h2 className="text-lg font-bold">
              {room.topic}
            </h2>
          )}

          <div className="flex items-center">
            <button className="bg-[#262626] ml-8 flex items-center px-4 py-2 rounded-2xl text-white hover:bg-[#333333]">
              <img src="/images/palm.png" alt="palm-icon" />
            </button>

            <button
              onClick={handManualLeave}
              className="bg-[#262626] ml-8 flex items-center px-4 py-2 rounded-2xl text-white hover:bg-[#333333]"
            >
              <img src="/images/win.png" alt="win-icon" />
              <span className="font-bold ml-4">Leave quietly</span>
            </button>
          </div>
        </div>

        {/* INVITED USERS */}
        {room?.roomType === 'private' && room?.allowedUsers && (
          <div className="mt-6">
            <h3 className="text-white font-bold mb-2">Invited Users</h3>

            {room.allowedUsers.map((userItem) => (
              <div key={userItem._id} className="flex justify-between mb-2">
                <span>{userItem.name}</span>

                {room.ownerId._id === user.id && (
                  <button
                    onClick={() => handleRemoveUser(userItem._id)}
                    className="bg-red-500 px-2 py-1 rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* INVITE INPUT */}
        {room?.roomType === 'private' &&
          room?.ownerId._id === user.id && (
            <div className="mt-4 flex items-center gap-3 relative">
              <input
                type="text"
                placeholder="Search username"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="px-3 py-2 rounded bg-[#262626] text-white placeholder-gray-400 outline-none border border-gray-600 w-[250px]"
              />

              <button
                onClick={handleInvite}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
              >
                Invite
              </button>

              {/* ⭐ DROPDOWN */}
              {searchResults.length > 0 && (
                <div className="absolute top-[50px] left-0 bg-[#1f1f1f] w-[250px] rounded border border-gray-700 z-10">
                  {searchResults.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => {
                        setInviteId(u.name);
                        setQuery(u.name);
                        setSearchResults([]);
                      }}
                      className="flex items-center gap-2 p-2 cursor-pointer hover:bg-[#333]"
                    >
                      <img
                        src={u.avatar}
                        className="w-6 h-6 rounded-full"
                        alt=""
                      />
                      <span className="text-white">{u.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* Clients */}
        <div className="mt-8 flex items-center flex-wrap gap-[30px]">
          {clients.map((client) => {
            return (
              <div className="flex flex-col items-center" key={client.id}>
                <div className="w-[90px] h-[90px] rounded-full border-[3px] border-[#5453e0] relative">
                  <img
                    className="w-full h-full rounded-full object-cover"
                    src={client.avatar}
                    alt=""
                  />

                  <audio
                    autoPlay
                    playsInline
                    ref={(instance) => {
                      provideRef(instance, client.id);
                    }}
                  />

                  <button
                    onClick={() => handleMuteClick(client.id)}
                    className="bg-[#212121] absolute bottom-0 right-0 w-[30px] h-[30px] rounded-full p-[5px]"
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
    </div>
  );
};

export default Room;