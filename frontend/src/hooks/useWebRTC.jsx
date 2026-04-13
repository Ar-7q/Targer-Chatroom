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

            
            localMediaStream.current =
                await navigator.mediaDevices.getUserMedia({ audio: true });

            const track = localMediaStream.current.getTracks()[0];

            
            track.enabled = false;

            addNewClient({ ...user, muted: true, handRaised: false }, () => { 
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
                setTimeout(() => {
                    window.location.href = "/rooms";
                }, 1500);
            });

            socket.current.on(ACTIONS.ROOM_CLOSED, () => {
                toast.error("Host left the room");
                setTimeout(() => {
                    window.location.href = "/rooms";
                }, 1500);
            });

            socket.current.on(ACTIONS.USER_JOINED, ({ name }) => {
                toast.success(`${name} joined the room`);
            });

            socket.current.on(ACTIONS.USER_INVITED, () => {
            alert("You have been invited to a private room");
            });

            
            socket.current.on(ACTIONS.RAISE_HAND, ({ userId }) => {
                setClients((clients) =>
                    clients.map((c) =>
                        c.id === userId ? { ...c, handRaised: true } : c
                    )
                );
            });

            
            socket.current.on(ACTIONS.LOWER_HAND, ({ userId }) => {
                setClients((clients) =>
                    clients.map((c) =>
                        c.id === userId ? { ...c, handRaised: false } : c
                    )
                );
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
                addNewClient({ ...remoteUser, muted: true, handRaised: false }, () => {
                    const audio = audioElements.current[remoteUser.id];

                    if (audio) {
                        audio.srcObject = remoteStream;

                        
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
                delete audioElements.current[peerId]; 
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

            
            stream.getAudioTracks().forEach((track) => {
                track.enabled = !isMute;
            });

            
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

            
            socket.current.emit(
                isMute ? ACTIONS.MUTE : ACTIONS.UNMUTE,
                {
                    roomId,
                    userId: user.id,
                }
            );
        }
    };



    const toggleHand = () => {
        const current = clientsRef.current.find(c => c.id === user.id)?.handRaised;

        socket.current.emit(
            current ? ACTIONS.LOWER_HAND : ACTIONS.RAISE_HAND,
            { roomId }
        );
    };

    return { clients, setClients,provideRef, handleMute, toggleHand };
};