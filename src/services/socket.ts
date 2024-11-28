import { io } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const socket = io(BACKEND_URL, {
    transports: ['websocket'],
    autoConnect: true
});

// Debug için event listener'lar
socket.on('connect', () => {
    console.log('🔌 Socket.IO bağlantısı kuruldu');
});

socket.on('disconnect', () => {
    console.log('🔌 Socket.IO bağlantısı kesildi');
});

socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO bağlantı hatası:', error);
});

// Yardımcı fonksiyonlar
export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};