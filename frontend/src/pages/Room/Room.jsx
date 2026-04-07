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

import styles from './Room.module.css';

const Room = () => {
  const user = useSelector((state) => state.auth.user);
  const { id: roomId } = useParams();
  const [room, setRoom] = useState(null);

  const { clients, provideRef, handleMute } = useWebRTC(roomId, user);

  const navigate = useNavigate();

  const [isMuted, setMuted] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      const { data } = await getRoom(roomId);
      setRoom(data);
    };

    fetchRoom();
  }, [roomId]);

  // useEffect(() => {
  //   handleMute(isMuted, user.id);
  // }, [isMuted, user.id]);

  const handManualLeave = () => {
    navigate('/rooms');
  };

  const handleMuteClick = (clientId) => {
    if (clientId !== user.id) return;

    const newMuted = !isMuted;
    setMuted(newMuted);

    handleMute(newMuted, user.id); // ✅ direct control
  };

  return (
    <div>
      <div className="container">
        <button onClick={handManualLeave} className={styles.goBack}>
          <img src="/images/arrow-left.png" alt="arrow-left" />
          <span>All voice rooms</span>
        </button>
      </div>

      <div className={styles.clientsWrap}>
        <div className={styles.header}>
          {room && <h2 className={styles.topic}>{room.topic}</h2>}
          <div className={styles.actions}>
            <button className={styles.actionBtn}>
              <img src="/images/palm.png" alt="palm-icon" />
            </button>
            <button
              onClick={handManualLeave}
              className={styles.actionBtn}
            >
              <img src="/images/win.png" alt="win-icon" />
              <span>Leave quietly</span>
            </button>
          </div>
        </div>

        <div className={styles.clientsList}>
          {clients.map((client, index) => {
            return (
              // ✅ FIXED KEY (NO DUPLICATE ERROR)
              <div className={styles.client} key={`${client.id}-${index}`}>
                <div className={styles.userHead}>
                  <img
                    className={styles.userAvatar}
                    src={client.avatar}
                    alt=""
                  />

                  <audio
                    autoPlay
                    ref={(instance) => {
                      provideRef(instance, client.id);
                    }}
                  />

                  <button
                    onClick={() =>
                      handleMuteClick(client.id)
                    }
                    className={styles.micBtn}
                  >
                    {client.muted ? (
                      <img
                        className={styles.mic}
                        src="/images/mic-mute.png"
                        alt="mic"
                      />
                    ) : (
                      <img
                        className={styles.micImg}
                        src="/images/mic.png"
                        alt="mic"
                      />
                    )}
                  </button>
                </div>
                <h4>{client.name}</h4>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Room;