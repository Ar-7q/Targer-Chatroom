
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

const { dbConnect } = require('./database');
const router = require('./routes');

// middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

//for avtar image
const path = require('path');
app.use('/storage', express.static(path.join(__dirname, 'storage')));

app.use(express.json({ limit: '8mb' }));
app.use(cookieParser());

// DB
dbConnect();

const PORT = process.env.PORT || 3000;

app.use('/api/v1', router);

app.get('/', (req, res) => {
    res.send("this is Home Page");
});

// ================= SOCKET =================

const ACTIONS = require('./actions'); // ✅ FIXED FILE NAME

const socketUserMap = new Map();

const handRaiseMap = new Map(); // ⭐ ADD THIS for raise hand feature

io.on('connection', (socket) => {
    console.log('✅ New connection:', socket.id); // ✅ FIXED

    socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
        socketUserMap.set(socket.id, user);


        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
                user,
            });

            socket.emit(ACTIONS.ADD_PEER, {
                peerId: clientId,
                createOffer: true,
                user: socketUserMap.get(clientId),
            });
        });

        socket.join(roomId);

        //added the raise hand feature

        // ⭐ sync raised hands to new user
        clients.forEach((clientId) => {
            if (handRaiseMap.get(clientId)) {
                socket.emit(ACTIONS.RAISE_HAND, {
                    userId: socketUserMap.get(clientId)?.id,
                });
            }
        });

        // 🔥 notify others (owner will also receive)
        // 🔥 NOTIFY OTHERS THAT USER JOINED
        const updatedClients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

        updatedClients.forEach((clientId) => {
            if (clientId !== socket.id) {
                io.to(clientId).emit(ACTIONS.USER_JOINED, {
                    name: user.name,
                });
            }
        });




        console.log(`Clients: ${clients}`); // to see the clients in the socket connection
    });

    socket.on(ACTIONS.USER_UPDATED, ({ user }) => {
        // 🔥 update latest user data in map
        socketUserMap.set(socket.id, user);

        const rooms = Array.from(socket.rooms);

        rooms.forEach((roomId) => {
            if (roomId === socket.id) return;

            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

            clients.forEach((clientId) => {
                if (clientId !== socket.id) { // 🔥 ADD THIS
                    io.to(clientId).emit(ACTIONS.USER_UPDATED, {
                        user,
                    });
                }
            });
        });
    });

    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id, // ✅ FIXED
            icecandidate,
        });
    });

    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id, // ✅ FIXED
            sessionDescription,
        });
    });

    socket.on(ACTIONS.MUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.MUTE, {
                peerId: socket.id, // ✅ FIXED
                userId,
            });
        });
    });

    socket.on(ACTIONS.UNMUTE, ({ roomId, userId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.UNMUTE, {
                peerId: socket.id, // ✅ FIXED
                userId,
            });
        });
    });

    socket.on(ACTIONS.MUTE_INFO, ({ userId, roomId, isMute }) => {


        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach((clientId) => {
            if (clientId !== socket.id) {
                io.to(clientId).emit(ACTIONS.MUTE_INFO, {
                    userId,
                    isMute,
                });
            }
        });
    });

    socket.on(ACTIONS.RAISE_HAND, ({ roomId }) => {
        handRaiseMap.set(socket.id, true);

        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.RAISE_HAND, {
                userId: socketUserMap.get(socket.id)?.id,
            });
        });
    });//raise hand

    socket.on(ACTIONS.LOWER_HAND, ({ roomId }) => {
        handRaiseMap.set(socket.id, false);

        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.LOWER_HAND, {
                userId: socketUserMap.get(socket.id)?.id,
            });
        });
    });//lower hand

    socket.on(ACTIONS.USER_KICKED, ({ userIdToRemove }) => {
        // find socket of that user
        let targetSocketId = null;

        for (let [socketId, user] of socketUserMap.entries()) {
            if (user.id === userIdToRemove) {
                targetSocketId = socketId;
                break; // 🔥 stop early
            }
        }

        // send kick event
        if (targetSocketId) {
            io.to(targetSocketId).emit(ACTIONS.USER_KICKED);
        }
    });

    socket.on(ACTIONS.USER_INVITED, ({ userIdToInvite, roomId }) => {
        let targetSocketId = null;

        for (let [socketId, user] of socketUserMap.entries()) {
            if (user.id === userIdToInvite) {
                targetSocketId = socketId;
                break;
            }
        }

        if (targetSocketId) {
            io.to(targetSocketId).emit(ACTIONS.USER_INVITED, {
                roomId,
            });
        }
    });

    socket.on(ACTIONS.ROOM_CLOSED, ({ roomId }) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

        clients.forEach((clientId) => {
            io.to(clientId).emit(ACTIONS.ROOM_CLOSED);
        });
    });

    const leaveRoom = () => {

        if (!socketUserMap.has(socket.id)) return;

        const rooms = Array.from(socket.rooms);

        rooms.forEach((roomId) => {
            if (roomId === socket.id) return; // ✅ FIXED

            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id, // ✅ FIXED
                    userId: socketUserMap.get(socket.id)?.id,
                });

                // ✅ MINIMAL ADDITION (no structure change)
                socket.emit(ACTIONS.REMOVE_PEER, {
                    peerId: clientId,
                    userId: socketUserMap.get(clientId)?.id,
                });
            });

            socket.leave(roomId);
        });

        socketUserMap.delete(socket.id); // ✅ FIXED
        handRaiseMap.delete(socket.id); // ⭐ ADD THIS
    };

    socket.on(ACTIONS.LEAVE, leaveRoom);
    socket.on('disconnecting', leaveRoom);
});

// ================= SOCKET END =================

server.listen(PORT, () => {
    console.log(`🚀 App is running on http://localhost:${PORT}`);
});