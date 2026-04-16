# Targer Chatroom

Voice chat application with real-time features.

## Overview

Targer Chatroom is a full-stack web application that allows users to create and join real-time audio chat rooms. It supports both public and private rooms for seamless communication. The application uses WebRTC for peer-to-peer audio communication, with a Node.js backend and a React frontend.

### Core Features

- Real-time audio communication using WebRTC
- Public, social, and private rooms
- Secure user authentication with OTP verification
- User profiles with customizable information
- Dockerized environment for easy setup

---

## Architecture

The application follows a classic client-server architecture with multiple layers handling communication, security, and real-time interactions.

<h2 align="center">WebRTC Architecture</h2>

<p align="center">
<sub>React | Node.js | WebRTC | Socket.io | MongoDB | JWT | Arcjet | Twilio</sub>
</p>

```mermaid
flowchart TB

subgraph User
A[Browser]
end

subgraph Frontend
B[React App]
end

subgraph Backend
C[Express API]
D[JWT Auth]
E[Arcjet Security]
F[(MongoDB)]
G[Twilio OTP/Email]
end

subgraph Realtime
H[Socket.io Server]
end

subgraph Media
I[WebRTC P2P]
end

A --> B

B -->|HTTP| C
C --> D
D --> E
C --> F
C --> G

B -->|WebSocket| H
H -->|Signaling| I

B -->|Media| I
I -->|Media| B