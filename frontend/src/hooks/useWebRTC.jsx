// import { useRef, useEffect, useCallback } from "react";
// import { useStateWithCallback } from "./useStateWithCallback";
// import socketInit from "../socket";
// import { ACTIONS } from "../actions";
// import freeice from 'freeice'

// export const useWebRTC = (roomId, user) => {

//     const [clients, setClients] = useStateWithCallback([]);
//     const audioElements = useRef({});
//     const connections = useRef({});
//     const localMediaStream = useRef(null);

//     const socket = useRef(null)

//     useEffect(() => {
//         socket.current = socketInit()
//     }, [])

//     // ✅ FIXED NAME
//     const addNewClient = useCallback((newClient, cb) => {

//         setClients((existingClients) => {

//             const lookingFor = existingClients.find(
//                 (client) => client.id === newClient.id
//             );

//             if (lookingFor === undefined) {
//                 return [...existingClients, newClient];
//             }

//             return existingClients;
//         }, cb);

//     }, [setClients]);

//     useEffect(() => {
//         const startCapture = async () => {
//             localMediaStream.current = await navigator.mediaDevices.getUserMedia({
//                 audio: true,
//             });
//         };

//         startCapture().then(() => {

//             // ✅ FIXED (added muted)
//             addNewClient({ ...user, muted: true }, () => {
//                 const localElement = audioElements.current[user.id];
//                 if (localElement) {
//                     localElement.volume = 0;
//                     localElement.muted = true;
//                     localElement.srcObject = localMediaStream.current;
//                 }

//                 socket.current.emit(ACTIONS.JOIN, { roomId, user })
//             });
//         });

//         return () => {

//             localMediaStream.current?.getTracks()
//                 .forEach((track) => track.stop())

//             socket.current.emit(ACTIONS.LEAVE, { roomId })
//         }

//     }, []);

//     useEffect(() => {
//         if (!socket.current) return;

//         const handleNewPeer = async ({ peerId, createOffer, user: remoteUser }) => {
//             if (peerId in connections.current) {
//                 return console.warn(`You are already connected ${peerId} (${user.name})`);
//             }

//             connections.current[peerId] = new RTCPeerConnection({
//                 iceServers: freeice()
//             })

//             connections.current[peerId].onicecandidate = (event) => {
//                 socket.current.emit(ACTIONS.RELAY_ICE, {
//                     peerId,
//                     icecandidate: event.candidate
//                 })
//             }

//             connections.current[peerId].ontrack = ({
//                 streams: [remoteStream]
//             }) => {

//                 // ✅ FIXED (added muted)
//                 addNewClient({ ...remoteUser, muted: true }, () => {
//                     if (audioElements.current[remoteUser.id]) {

//                         audioElements.current[remoteUser.id].srcObject = remoteStream
//                     } else {
//                         let settled = false
//                         const interval = setInterval(() => {

//                             if (audioElements.current[remoteUser.id]) {
//                                 audioElements.current[remoteUser.id].srcObject = remoteStream
//                                 settled = true
//                             }
//                             if (settled) {
//                                 clearInterval(interval)
//                             }
//                         }, 1000)
//                     }
//                 })
//             }

//             localMediaStream.current.getTracks().forEach(track => {
//                 connections.current[peerId].addTrack(
//                     track,
//                     localMediaStream.current
//                 )
//             })

//             if (createOffer) {
//                 const offer = await connections.current[peerId].createOffer()

//                 await connections.current[peerId].setLocalDescription(offer)
//                 socket.current.emit(ACTIONS.RELAY_SDP, {
//                     peerId,
//                     sessionDescription: offer
//                 })
//             }
//         }

//         socket.current.on(ACTIONS.ADD_PEER, handleNewPeer)
//         return () => {
//             socket.current.off(ACTIONS.ADD_PEER)
//         }

//     }, [])

//     useEffect(() => {
//         if (!socket.current) return;

//         socket.current.on(ACTIONS.ICE_CANDIDATE, ({ peerId, icecandidate }) => {

//             if (icecandidate) {
//                 // ✅ FIXED (safe optional chaining)
//                 connections.current[peerId]?.addIceCandidate(icecandidate)
//             }
//         })

//         return () => {
//             socket.current.off(ACTIONS.ICE_CANDIDATE)
//         }

//     }, [])

//     useEffect(() => {
//         if (!socket.current) return;

//         const handleRemoteSdp = async ({ peerId, sessionDescription: remoteSessionDescription }) => {

//             // ✅ FIXED (safe optional chaining)
//             await connections.current[peerId]?.setRemoteDescription(
//                 new RTCSessionDescription(remoteSessionDescription)
//             )

//             if (remoteSessionDescription.type === 'offer') {
//                 const connection = connections.current[peerId]
//                 const answer = await connection.createAnswer()

//                 connection.setLocalDescription(answer)

//                 socket.current.emit(ACTIONS.RELAY_SDP, {
//                     peerId,
//                     sessionDescription: answer
//                 })
//             }
//         }

//         socket.current.on(ACTIONS.SESSION_DESCRIPTION, handleRemoteSdp)

//         return () => {
//             socket.current.off(ACTIONS.SESSION_DESCRIPTION)
//         }

//     }, [])

//     useEffect(() => {
//         if (!socket.current) return;

//         const handleRemovePeer = async ({ peerId, userId }) => {

//             if (connections.current[peerId]) {
//                 connections.current[peerId].close()
//             }

//             delete connections.current[peerId]

//             // ✅ FIXED (use userId instead of peerId)
//             delete audioElements.current[userId]

//             setClients(list => list.filter((client) => client.id !== userId))
//         }

//         socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer)

//         return () => {
//             socket.current.off(ACTIONS.REMOVE_PEER)
//         }
//     }, [])

//     const provideRef = (instance, userId) => {
//         audioElements.current[userId] = instance;
//     };

//     return { clients, provideRef };
// };






// FINAL CODE 

import { useEffect, useRef, useCallback } from 'react';
import { ACTIONS } from '../actions';
import socketInit from '../socket';
import { useStateWithCallback } from './useStateWithCallback';
import { toast } from 'sonner';

export const useWebRTC = (roomId, user) => {
    const [clients, setClients] = useStateWithCallback([]);
    const audioElements = useRef({});
    const connections = useRef({});
    const socket = useRef(null);
    const localMediaStream = useRef(null);
    const clientsRef = useRef([]);

    const addNewClient = useCallback(
        (newClient, cb) => {
            setClients((existingClients) => {
                if (existingClients.some(client => client.id === newClient.id)) {
                    return existingClients;
                }
                return [...existingClients, newClient];
            }, cb);
        },
        [setClients]
    );

    useEffect(() => {
        clientsRef.current = clients;
    }, [clients]);



    useEffect(() => {
        const initChat = async () => {
            socket.current = socketInit();

            // 🎤 GET AUDIO
            localMediaStream.current =
                await navigator.mediaDevices.getUserMedia({ audio: true });

            const track = localMediaStream.current.getTracks()[0];

            // ✅ START UNMUTED (SYNC WITH UI)
            track.enabled = false;

            addNewClient({ ...user, muted: true }, () => { // ✅ FIXED
                const localElement = audioElements.current[user.id];
                if (localElement) {
                    localElement.volume = 0;
                    localElement.muted = true;
                    localElement.srcObject = localMediaStream.current;
                    localElement.play().catch(() => { });
                }
            });

            socket.current.on(ACTIONS.MUTE_INFO, ({ userId, isMute }) => {
                handleSetMute(isMute, userId);
            });

            socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
            socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
            socket.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
            socket.current.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);

            socket.current.on(ACTIONS.MUTE, ({ userId }) => {
                handleSetMute(true, userId);
            });

            socket.current.on(ACTIONS.UNMUTE, ({ userId }) => {
                handleSetMute(false, userId);
            });

            socket.current.on(ACTIONS.USER_KICKED, () => {
                toast.error("You were removed from the room");
                window.location.href = "/rooms";
            });

            socket.current.on(ACTIONS.USER_JOINED, ({ name }) => {
                toast.success(`${name} joined the room`);
            });

            socket.current.on(ACTIONS.USER_INVITED, () => {
                toast.success("You have been invited to a private room");
            });


            socket.current.emit(ACTIONS.JOIN, { roomId, user });
        };

        async function handleNewPeer({ peerId, createOffer, user: remoteUser }) {
            if (peerId in connections.current) return;

            connections.current[peerId] = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    {
                        urls: 'turn:openrelay.metered.ca:80',
                        username: 'openrelayproject',
                        credential: 'openrelayproject',
                    },
                ],
            });

            connections.current[peerId].onicecandidate = (event) => {
                socket.current.emit(ACTIONS.RELAY_ICE, {
                    peerId,
                    icecandidate: event.candidate,
                });
            };

            connections.current[peerId].ontrack = ({ streams: [remoteStream] }) => {
                addNewClient({ ...remoteUser, muted: true }, () => {
                    const audio = audioElements.current[remoteUser.id];

                    if (audio) {
                        audio.srcObject = remoteStream;

                        // ✅ FIX: FORCE PLAY
                        audio.autoplay = true;
                        audio.playsInline = true;
                        audio.muted = false;
                        audio.play().catch(() => { });
                    }
                });
            };

            localMediaStream.current.getTracks().forEach((track) => {
                connections.current[peerId].addTrack(track, localMediaStream.current);
            });

            if (createOffer) {
                const offer = await connections.current[peerId].createOffer();
                await connections.current[peerId].setLocalDescription(offer);

                socket.current.emit(ACTIONS.RELAY_SDP, {
                    peerId,
                    sessionDescription: offer,
                });
            }
        }

        function handleRemovePeer({ peerId, userId }) {
            if (connections.current[peerId]) {
                connections.current[peerId].close();
            }

            delete connections.current[peerId];
            delete audioElements.current[peerId];


            setClients((list) => list.filter((c) => c.id !== userId));
        }

        function handleIceCandidate({ peerId, icecandidate }) {
            if (icecandidate) {
                connections.current[peerId]?.addIceCandidate(icecandidate);
            }
        }

        async function setRemoteMedia({ peerId, sessionDescription }) {
            const connection = connections.current[peerId];
            if (!connection) return;

            if (
                sessionDescription.type === "answer" &&
                connection.currentRemoteDescription
            ) return;

            await connection.setRemoteDescription(
                new RTCSessionDescription(sessionDescription)
            );

            if (
                sessionDescription.type === 'offer' &&
                !connection.currentLocalDescription
            ) {
                const answer = await connection.createAnswer();
                await connection.setLocalDescription(answer);

                socket.current.emit(ACTIONS.RELAY_SDP, {
                    peerId,
                    sessionDescription: answer,
                });
            }
        }

        function handleSetMute(mute, userId) {
            const clientIdx = clientsRef.current
                .map((client) => client.id)
                .indexOf(userId);

            if (clientIdx > -1) {
                const updated = [...clientsRef.current];
                updated[clientIdx].muted = mute;
                setClients(updated);
            }
        }

        initChat();

        return () => {
            localMediaStream.current?.getTracks().forEach((track) => track.stop());

            socket.current?.emit(ACTIONS.LEAVE, { roomId });

            for (let peerId in connections.current) {
                connections.current[peerId].close();
                delete connections.current[peerId];
                delete audioElements.current[peerId]; // ✅ cleanup
            }

            socket.current?.off(ACTIONS.ADD_PEER);
            socket.current?.off(ACTIONS.REMOVE_PEER);
            socket.current?.off(ACTIONS.ICE_CANDIDATE);
            socket.current?.off(ACTIONS.SESSION_DESCRIPTION);
            socket.current?.off(ACTIONS.MUTE);
            socket.current?.off(ACTIONS.UNMUTE);
            socket.current?.off(ACTIONS.MUTE_INFO);
        };
    }, []);

    const provideRef = (instance, userId) => {
        if (instance) {
            audioElements.current[userId] = instance;
        }
    };

    const handleMute = (isMute, userId) => {
        if (userId === user.id && localMediaStream.current) {

            const stream = localMediaStream.current;

            // ✅ toggle mic locally
            stream.getAudioTracks().forEach((track) => {
                track.enabled = !isMute;
            });

            // 🔥 IMPORTANT: update all peer connections
            Object.values(connections.current).forEach((peer) => {
                stream.getAudioTracks().forEach((track) => {
                    const sender = peer.getSenders().find(
                        (s) => s.track && s.track.kind === "audio"
                    );

                    if (sender) {
                        sender.replaceTrack(track);
                    }
                });
            });

            // ✅ notify others
            socket.current.emit(
                isMute ? ACTIONS.MUTE : ACTIONS.UNMUTE,
                {
                    roomId,
                    userId: user.id,
                }
            );
        }
    };

    return { clients, provideRef, handleMute };
};