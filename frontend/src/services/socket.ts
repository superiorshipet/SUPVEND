import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinAuction(auctionId: string) {
    if (this.socket) {
      this.socket.emit('join-auction', auctionId);
      console.log(`Joined auction: ${auctionId}`);
    }
  }

  leaveAuction(auctionId: string) {
    if (this.socket) {
      this.socket.emit('leave-auction', auctionId);
      console.log(`Left auction: ${auctionId}`);
    }
  }

  placeBid(auctionId: string, amount: number) {
    if (this.socket) {
      this.socket.emit('place-bid', { auctionId, bidAmount: amount });
    }
  }

  onNewBid(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new-bid', callback);
    }
  }

  onAuctionExtended(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('auction-extended', callback);
    }
  }

  onAuctionEnded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('auction-ended', callback);
    }
  }

  onOutbid(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('outbid', callback);
    }
  }

  onNewNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new-notification', callback);
    }
  }

  offEvent(eventName: string) {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }
}

export const socketService = new SocketService();
