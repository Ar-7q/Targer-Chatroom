import { useRef, useEffect, useCallback } from "react";
import { useStateWithCallback } from "./useStateWithCallback";
import socketInit from "../socket";
import { ACTIONS } from "../actions";

export const useWebRTC = (roomId, user) => {

    const [clients, setClients] = useStateWithCallback([]);
    const audioElements = useRef({});
    const connections = useRef({});
    const localMediaStream = useRef(null);

    const socket=useRef(null)

    useEffect(()=>{
        socket.current=socketInit()

    },[])

    const addNewClients = useCallback((newClient, cb) => {

        setClients((existingClients) => {

            const lookingFor = existingClients.find(
                (client) => client.id === newClient.id
            );

            if (lookingFor === undefined) {
                return [...existingClients, newClient];
            }

            return existingClients;
        }, cb);

    }, [setClients]);

    useEffect(() => {
        const startCapture = async () => {
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
        };

        startCapture().then(() => {
            addNewClients(user, () => {
                const localElement = audioElements.current[user.id];
                if (localElement) {
                    localElement.volume = 0;
                    localElement.muted = true;   //self
                    // localElement.volume = 1;
                    localElement.srcObject = localMediaStream.current;
                }

                socket.current.emit(ACTIONS.JOIN, {roomId, user})
            });
        });
    }, []);

    const provideRef = (instance, userId) => {
        audioElements.current[userId] = instance;
    };

    return { clients, provideRef };
};