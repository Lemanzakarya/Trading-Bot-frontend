import { io, Socket } from 'socket.io-client';

export interface Kline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  id: string | number;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

class TradingService {
  private socket: Socket | null = null;
  private baseUrl = 'http://localhost:5000';
  private connectionPromise: Promise<Socket> | null = null;

  async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      console.log('Connecting to socket server...');
      
      this.socket = io(this.baseUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully:', this.socket?.id);
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      this.socket.on('historical_data', (data) => {
        console.log('Received historical data:', data?.length);
      });

      // 20 saniye timeout
      setTimeout(() => {
        if (!this.socket?.connected) {
          console.error('Connection timeout');
          this.socket?.close();
          this.socket = null;
          this.connectionPromise = null;
          reject(new Error('Connection timeout'));
        }
      }, 20000);
    });

    return this.connectionPromise;
  }

  async selectSymbol(symbol: string) {
    try {
      const socket = await this.connect();
      console.log('Selecting symbol:', symbol);
      socket.emit('select_coin', { symbol });
    } catch (error) {
      console.error('Error selecting symbol:', error);
    }
  }

  async getKlines(symbol: string, interval: string, startTime: number, endTime: number): Promise<Kline[]> {
    try {
      if (!this.socket?.connected) {
        console.warn('Socket not connected, attempting to connect...');
        await this.connect();
      }

      return new Promise((resolve, reject) => {
        if (!this.socket?.connected) {
          return reject(new Error('Socket not connected'));
        }

        console.log(`Requesting klines for ${symbol} from ${new Date(startTime)} to ${new Date(endTime)}`);
        
        // Event listener'ları temizlemek için bir fonksiyon
        const cleanup = () => {
          this.socket?.off('historical_data');
          this.socket?.off('error');
        };

        // Timeout handler - 30 saniyeye çıkardık
        const timeoutId = setTimeout(() => {
          console.warn('Historical data request timed out');
          cleanup();
          reject(new Error('Historical data request timed out'));
        }, 30000);

        // Historical data event handler
        this.socket.once('historical_data', (data: Kline[]) => {
          console.log(`Received ${data?.length || 0} klines for ${symbol}`);
          clearTimeout(timeoutId);
          cleanup();
          
          if (!data || data.length === 0) {
            reject(new Error('No historical data received'));
            return;
          }
          
          resolve(data);
        });

        // Error event handler
        this.socket.once('error', (error) => {
          console.error('Historical data error:', error);
          clearTimeout(timeoutId);
          cleanup();
          reject(error);
        });

        // Request'i gönder
        this.socket.emit('get_historical_data', {
          symbol,
          interval,
          startTime,
          endTime
        });

        console.log('Historical data request sent');
      });
    } catch (error) {
      console.error('Error in getKlines:', error);
      throw error;
    }
  }

  async subscribeToTrades(symbol: string, callback: (trade: Trade) => void) {
    try {
      const socket = await this.connect();
      socket.on('trade_update', callback);
    } catch (error) {
      console.error('Error subscribing to trades:', error);
    }
  }

  async unsubscribeFromTrades() {
    if (this.socket) {
      this.socket.off('trade_update');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionPromise = null;
    }
  }
}

export const tradingService = new TradingService(); 