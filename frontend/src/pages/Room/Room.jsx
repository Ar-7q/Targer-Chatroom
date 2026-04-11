
// // FULL CODE OF ROOM.JSX

// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useWebRTC } from '../../hooks/useWebRTC';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getRoom, leaveRoom, removeUser, inviteUser } from '../../http';
// import { searchUsers } from '../../http'; // ⭐ ADDED
// import { toast } from 'sonner';

// const Room = () => {
//   const user = useSelector((state) => state.auth.user);
//   const { id: roomId } = useParams();
//   const [room, setRoom] = useState(null);

//   const { clients, provideRef, handleMute } = useWebRTC(roomId, user);

//   const navigate = useNavigate();

//   const [isMuted, setMuted] = useState(true);
//   const [inviteId, setInviteId] = useState('');

//   // ⭐ ADDED (search state)
//   const [query, setQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);

//   // ✅ FETCH ROOM
//   useEffect(() => {
//     let isActive = true;

//     const fetchRoom = async () => {
//       try {
//         const { data } = await getRoom(roomId);

//         if (!isActive) return;
//         setRoom(data);

//       } catch (e) {
//         if (e.response && e.response.status === 403) {
//           isActive = false;
//           navigate('/rooms');
//           return; // 🔥 STOP
//         }
//       }
//     };

//     fetchRoom();

//     return () => {
//       isActive = false;
//     };
//   }, [roomId]);

//   useEffect(() => {
//     let interval;
//     let isActive = true;

//     const startPolling = () => {
//       interval = setInterval(async () => {
//         try {
//           if (!isActive) return;

//           const { data } = await getRoom(roomId);

//           if (!isActive) return;
//           setRoom(data);

//         } catch (e) {
//           if (e.response && e.response.status === 403) {
//             clearInterval(interval);
//             isActive = false;

//             toast.error("You were removed from the room");
//             navigate('/rooms');
//             return;
//           }
//         }
//       }, 2000);
//     };

//     startPolling();

//     return () => {
//       isActive = false;
//       clearInterval(interval);
//     };
//   }, [roomId]);

//   useEffect(() => {
//     if (!room || !user) return;

//     // check if current user still exists in allowedUsers
//     if (room.roomType === 'private') {
//       const stillAllowed = room.allowedUsers?.some(
//         (u) => u._id === user.id
//       );

//       // if removed → redirect
//       if (!stillAllowed && room.ownerId._id !== user.id) {
//         toast.error("You were removed from the room");
//         navigate('/rooms');
//       }
//     }
//   }, [room, user]);

//   useEffect(() => {
//     if (!user) return;
//     handleMute(isMuted, user.id);
//   }, [isMuted, user]);

//   const handManualLeave = async () => {
//     try {
//       await leaveRoom(roomId);
//       navigate('/rooms');
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const handleRemoveUser = async (userIdToRemove) => {
//     try {
//       await removeUser(roomId, { userIdToRemove });

//       const { data } = await getRoom(roomId);
//       setRoom(data);
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   //  ADDED (search function)
//   const handleSearch = async (value) => {
//     setQuery(value);
//     setInviteId(value); // keep compatibility with existing logic

//     if (!value.trim()) {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       const { data } = await searchUsers(value);
//       // ✅ FILTER YOURSELF OUT
//       const filtered = data.filter((u) => u._id !== user.id);

//       setSearchResults(filtered);
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const handleInvite = async () => {
//     try {
//       if (!inviteId.trim()) {
//         toast.error('Please enter username..')
//         return;
//       }

//       const isObjectId = /^[0-9a-fA-F]{24}$/.test(inviteId);

//       if (isObjectId) {
//         toast.error('Please enter username, not user ID');
//         return;
//       }

//       await inviteUser(roomId, { userIdToAdd: inviteId });

//       toast.success('User invited successfully'); // ✅ ADDED

//       const { data } = await getRoom(roomId);
//       setRoom(data);
//       setInviteId('');
//       setQuery('');
//       setSearchResults([]);
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   const handleMuteClick = (clientId) => {
//     if (clientId !== user.id) return;

//     const newMuted = !isMuted;
//     setMuted(newMuted);
//     handleMute(newMuted, user.id);
//   };

//   if (!user) return null;

//   return (
//     <div>
//       <div className="container">
//         <button
//           onClick={handManualLeave}
//           className="flex items-center mt-8 bg-transparent outline-none cursor-pointer"
//         >
//           <img src="/images/arrow-left.png" alt="arrow-left" />
//           <span className="ml-4 font-bold text-white text-base relative after:content-[''] after:absolute after:bottom-[-16px] after:left-0 after:w-[60%] after:h-[4px] after:bg-blue-500 after:rounded-lg">
//             All voice rooms
//           </span>
//         </button>
//       </div>

//       <div className="bg-[#1d1d1d] mt-16 rounded-tl-2xl rounded-tr-2xl min-h-[calc(100vh-205px)] p-8">

//         <div className="flex items-center justify-between border-b border-[#2f2f2f] pb-4">
//           {room && (
//             <h2 className="text-2xl font-extrabold text-white tracking-wide bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
//               {room.topic}
//             </h2>
//           )}

//           <div className="flex items-center">
//             <button className="bg-[#262626] ml-8 flex items-center px-4 py-2 rounded-2xl text-white hover:bg-[#333333]">
//               <img src="/images/palm.png" alt="palm-icon" />
//             </button>

//             <button
//               onClick={handManualLeave}
//               className="bg-[#262626] ml-8 flex items-center px-4 py-2 rounded-2xl text-white hover:bg-[#333333]"
//             >
//               <img src="/images/win.png" alt="win-icon" />
//               <span className="font-bold ml-4">Leave quietly</span>
//             </button>
//           </div>
//         </div>

//         {/* INVITED USERS */}
//         {room?.roomType === 'private' && room?.allowedUsers && (
//           <div className="mt-6">
//             <h3 className="text-white font-bold mb-2">Invited Users</h3>

//             {room.allowedUsers
//               .filter((userItem) => userItem._id !== room.ownerId._id)
//               .map((userItem) => (
//                 <div key={userItem._id} className="flex justify-between mb-2">
//                   <span>{userItem.name}</span>

//                   {room.ownerId._id === user.id && userItem._id !== user.id && (
//                     <button
//                       onClick={() => handleRemoveUser(userItem._id)}
//                       className="bg-red-500 px-2 py-1 rounded"
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               ))}
//           </div>
//         )}

//         {/* INVITE INPUT */}
//         {room?.roomType === 'private' &&
//           room?.ownerId._id === user.id && (
//             <div className="mt-4 flex items-center gap-3 relative">
//               <input
//                 type="text"
//                 placeholder="Search username"
//                 value={query}
//                 onChange={(e) => handleSearch(e.target.value)}
//                 className="px-3 py-2 rounded bg-[#262626] text-white placeholder-gray-400 outline-none border border-gray-600 w-[250px]"
//               />

//               <button
//                 onClick={handleInvite}
//                 className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
//               >
//                 Invite
//               </button>

//               {/* ⭐ DROPDOWN */}
//               {searchResults.length > 0 && (
//                 <div className="absolute top-[50px] left-0 bg-[#1f1f1f] w-[250px] rounded border border-gray-700 z-10">
//                   {searchResults.map((u) => (
//                     <div
//                       key={u._id}
//                       onClick={() => {
//                         setInviteId(u.name);
//                         setQuery(u.name);
//                         setSearchResults([]);
//                       }}
//                       className="flex items-center gap-2 p-2 cursor-pointer hover:bg-[#333]"
//                     >
//                       <img
//                         src={u.avatar}
//                         className="w-6 h-6 rounded-full"
//                         alt=""
//                       />
//                       <span className="text-white">{u.name}</span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//         {/* Clients */}
//         <div className="mt-8 flex items-center flex-wrap gap-[30px]">
//           {clients.map((client) => {
//             return (
//               <div className="flex flex-col items-center" key={client.id}>
//                 <div
//                   className={`w-[90px] h-[90px] rounded-full border-[3px] relative ${(room?.ownerId?._id || room?.ownerId) === client.id
//                     ? 'border-violet-500 shadow-[0_0_20px_#8b5cf6] animate-pulse'
//                     : 'border-[#5453e0]'
//                     }`}
//                 >
//                   <img
//                     className="w-full h-full rounded-full object-cover"
//                     src={client.avatar}
//                     alt=""
//                   />

//                   {(room?.ownerId?._id || room?.ownerId) === client.id && (
//                     <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[10px] px-2 py-[2px] rounded-full shadow-md">
//                       HOST
//                     </span>
//                   )}

//                   <audio
//                     autoPlay
//                     playsInline
//                     ref={(instance) => {
//                       provideRef(instance, client.id);
//                     }}
//                   />

//                   <button
//                     onClick={() => handleMuteClick(client.id)}
//                     className="bg-[#212121] absolute bottom-0 right-0 w-[30px] h-[30px] rounded-full p-[5px]"
//                   >
//                     {client.muted ? (
//                       <img src="/images/mic-mute.png" alt="mic" />
//                     ) : (
//                       <img src="/images/mic.png" alt="mic" />
//                     )}
//                   </button>
//                 </div>

//                 <h4 className="font-bold mt-4">{client.name}</h4>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Room;






// // FULL CODE OF ROOM.JSX

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom, leaveRoom, removeUser, inviteUser } from '../../http';
import { searchUsers } from '../../http'; // ⭐ ADDED
import { toast } from 'sonner';
import socketInit from '../../socket';
import { ACTIONS } from '../../actions';



const Room = () => {
  const user = useSelector((state) => state.auth.user);
  const { id: roomId } = useParams();
  const [room, setRoom] = useState(null);

  const { clients, provideRef, handleMute } = useWebRTC(roomId, user);

  const navigate = useNavigate();
  const socket = socketInit();
  const [isMuted, setMuted] = useState(true);
  const [inviteId, setInviteId] = useState('');

  // ⭐ ADDED (search state)
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // ✅ FETCH ROOM
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
          return; // 🔥 STOP
        }
      }
    };

    fetchRoom();

    return () => {
      isActive = false;
    };
  }, [roomId]);

  // useEffect(() => {
  //   let interval;
  //   let isActive = true;

  //   const startPolling = () => {
  //     interval = setInterval(async () => {
  //       try {
  //         if (!isActive) return;

  //         const { data } = await getRoom(roomId);

  //         if (!isActive) return;
  //         setRoom(data);

  //       } catch (e) {
  //         if (e.response && e.response.status === 403) {
  //           clearInterval(interval);
  //           isActive = false;

  //           toast.error("You were removed from the room");
  //           navigate('/rooms');
  //           return;
  //         }
  //       }
  //     }, 2000);
  //   };

  //   startPolling();

  //   return () => {
  //     isActive = false;
  //     clearInterval(interval);
  //   };
  // }, [roomId]);

  //useEffect(() => {
  //   if (!room || !user) return;

  //   // check if current user still exists in allowedUsers
  //   if (room.roomType === 'private') {
  //     const stillAllowed = room.allowedUsers?.some(
  //       (u) => u._id === user.id
  //     );

  //     // if removed → redirect
  //     if (!stillAllowed && room.ownerId._id !== user.id) {
  //       toast.error("You were removed from the room");
  //       navigate('/rooms');
  //     }
  //   }
  // }, [room, user]);

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

      socket.emit(ACTIONS.USER_KICKED, { userIdToRemove });

      const { data } = await getRoom(roomId);
      setRoom(data);
    } catch (e) {
      console.log(e);
    }
  };

  //  ADDED (search function)
  const handleSearch = async (value) => {
    setQuery(value);
    setInviteId(value); // keep compatibility with existing logic

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await searchUsers(value);
      // ✅ FILTER YOURSELF OUT
      const filtered = data.filter((u) => u._id !== user.id);

      setSearchResults(filtered);
    } catch (e) {
      console.log(e);
    }
  };

  const handleInvite = async () => {
    try {
      if (!inviteId.trim()) {
        toast.error('Please enter username..')
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
      }); //SOCKET id added to invite

      toast.success('User invited successfully'); // ✅ ADDED

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

            {room.allowedUsers
              .filter((userItem) => userItem._id !== room.ownerId._id)
              .map((userItem) => (
                <div key={userItem._id} className="flex justify-between mb-2">
                  <span>{userItem.name}</span>

                  {room.ownerId._id === user.id && userItem._id !== user.id && (
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
                         // keep UI same
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
                <div
                  className={`w-[90px] h-[90px] rounded-full border-[3px] relative ${(room?.ownerId?._id || room?.ownerId) === client.id
                    ? 'border-violet-500 shadow-[0_0_20px_#8b5cf6] animate-pulse'
                    : 'border-[#5453e0]'
                    }`}
                >
                  <img
                    className="w-full h-full rounded-full object-cover"
                    src={client.avatar}
                    alt=""
                  />

                  {(room?.ownerId?._id || room?.ownerId) === client.id && (
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




