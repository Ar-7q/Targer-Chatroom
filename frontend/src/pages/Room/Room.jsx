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
import { getRoom } from '../../http';

const Room = () => {
  const user = useSelector((state) => state.auth.user);
  const { id: roomId } = useParams();
  const [room, setRoom] = useState(null);

  const { clients, provideRef, handleMute } = useWebRTC(roomId, user);

  const navigate = useNavigate();

  const [isMuted, setMuted] = useState(true);

  // ✅ FETCH ROOM (added error handling)
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

  // ✅ FIX: sync mute state (with guard)
  useEffect(() => {
    if (!user) return;
    handleMute(isMuted, user.id);
  }, [isMuted, user]);

  const handManualLeave = () => {
    navigate('/rooms');
  };

  const handleMuteClick = (clientId) => {
    if (clientId !== user.id) return;

    const newMuted = !isMuted;
    setMuted(newMuted);

    // ✅ still keeping direct call (safe)
    handleMute(newMuted, user.id);
  };

  // ✅ FIX: prevent crash if user not ready
  if (!user) return null;

  return (
    <div>
      {/* Top Bar */}
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

      {/* Main Wrapper */}
      <div className="bg-[#1d1d1d] mt-16 rounded-tl-2xl rounded-tr-2xl min-h-[calc(100vh-205px)] p-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          {room && (
            <h2 className="text-lg font-bold">
              {room.topic}
            </h2>
          )}

          <div className="flex items-center">
            <button className="bg-[#262626] ml-8 flex items-center px-4 py-2 rounded-2xl text-white transition-all duration-300 hover:bg-[#333333]">
              <img src="/images/palm.png" alt="palm-icon" />
            </button>

            <button
              onClick={handManualLeave}
              className="bg-[#262626] ml-8 flex items-center px-4 py-2 rounded-2xl text-white transition-all duration-300 hover:bg-[#333333]"
            >
              <img src="/images/win.png" alt="win-icon" />
              <span className="font-bold ml-4">Leave quietly</span>
            </button>
          </div>
        </div>

        {/* Clients List */}
        <div className="mt-8 flex items-center flex-wrap gap-[30px]">
          {clients.map((client) => {
            return (
              <div
                className="flex flex-col items-center"
                key={client.id} // ✅ FIXED (removed index)
              >
                {/* Avatar */}
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

                  {/* Mic Button */}
                  <button
                    onClick={() => handleMuteClick(client.id)}
                    className="bg-[#212121] absolute bottom-0 right-0 w-[30px] h-[30px] rounded-full p-[5px] shadow-md cursor-pointer"
                  >
                    {client.muted ? (
                      <img
                        className="w-full h-full"
                        src="/images/mic-mute.png"
                        alt="mic"
                      />
                    ) : (
                      <img
                        className="w-full h-full"
                        src="/images/mic.png"
                        alt="mic"
                      />
                    )}
                  </button>
                </div>

                {/* Name */}
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