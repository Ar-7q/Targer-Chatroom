require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

const { dbConnect } = require('./database');
const router = require('./routes');

// middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));

app.use('/storage', express.static('storage'));
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
        console.log(`Clients: ${clients}`); // to see the clients in the socket connection
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

    const leaveRoom = () => {
        const rooms = Array.from(socket.rooms);

        rooms.forEach((roomId) => {
            if (roomId === socket.id) return; // ✅ FIXED

            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id, // ✅ FIXED
                    userId: socketUserMap.get(socket.id)?._id, // ✅ KEEP _id HERE
                });
            });

            socket.leave(roomId);
        });

        socketUserMap.delete(socket.id); // ✅ FIXED
    };

    socket.on(ACTIONS.LEAVE, leaveRoom);
    socket.on('disconnecting', leaveRoom);
});

// ================= SOCKET END =================

server.listen(PORT, () => {
    console.log(`🚀 App is running on http://localhost:${PORT}`);
});