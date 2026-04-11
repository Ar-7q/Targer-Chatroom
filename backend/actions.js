const ACTIONS = {
    JOIN: 'join',
    LEAVE: 'leave',
    ADD_PEER: 'add-peer',
    REMOVE_PEER: 'remove-peer',
    RELAY_ICE: 'relay-ice',
    RELAY_SDP: 'relay-sdp',
    SESSION_DESCRIPTION: 'session-description',
    ICE_CANDIDATE: 'ice-candidate',
    MUTE: 'mute',
    UNMUTE: 'unmute',
    MUTE_INFO: 'mute-info',
    USER_KICKED: 'user-kicked',
    USER_JOINED: 'user-joined',
    USER_INVITED: 'user-invited',
    ROOM_CLOSED: 'room-closed',
    ROOM_UPDATED: 'room-updated',
};

module.exports = ACTIONS;