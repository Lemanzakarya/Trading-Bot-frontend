interface Kline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class BinanceService {
  private baseUrl = 'https://api.binance.com/api/v3';
  private testnetUrl = 'https://testnet.binance.vision/api/v3';
  private testnetWsUrl = 'wss://testnet.binance.vision/ws';

  // Candlestick verilerini getir
  async getKlines(symbol: string, interval: string): Promise<Kline[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=1000`
      );
      const data = await response.json();
      
      return data.map((d: any) => ({
        time: d[0] / 1000,
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5])
      }));
    } catch (error) {
      console.error('Error fetching klines:', error);
      throw error;
    }
  }

  // Anlık fiyat bilgisini getir
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/ticker/price?symbol=${symbol}`
      );
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }

  // 24 saatlik istatistikleri getir
  async get24hStats(symbol: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/ticker/24hr?symbol=${symbol}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching 24h stats:', error);
      throw error;
    }
  }

  // WebSocket bağlantısı kur
  subscribeToKlines(symbol: string, interval: string, callback: (data: Kline) => void) {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const k = data.k;
      
      const kline: Kline = {
        time: k.t / 1000,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v)
      };
      
      callback(kline);
    };

    return ws;
  }

  subscribeToTrades(symbol: string, callback: (trade: any) => void) {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`);
    
    ws.onmessage = (event) => {
      const trade = JSON.parse(event.data);
      callback(trade);
    };

    return ws;
  }

  // Test ağı için candlestick verilerini getir
  async getKlinesTestnet(symbol: string, interval: string): Promise<Kline[]> {
    try {
      const response = await fetch(
        `${this.testnetUrl}/klines?symbol=${symbol}&interval=${interval}&limit=1000`
      );
      const data = await response.json();
      
      return data.map((d: any) => ({
        time: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5])
      }));
    } catch (error) {
      console.error('Error fetching testnet klines:', error);
      throw error;
    }
  }

  // Test ağı WebSocket bağlantısı
  subscribeToKlinesTestnet(symbol: string, interval: string, callback: (data: Kline) => void) {
    const ws = new WebSocket(`${this.testnetWsUrl}/${symbol.toLowerCase()}@kline_${interval}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const k = data.k;
      
      const kline: Kline = {
        time: k.t,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v)
      };
      
      callback(kline);
    };

    return ws;
  }

  // Test ağında işlem yap
  async createOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number) {
    try {
      const response = await fetch(`${this.testnetUrl}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // API anahtarlarını ekle
          'X-MBX-APIKEY': process.env.BINANCE_TEST_API_KEY || ''
        },
        body: JSON.stringify({
          symbol,
          side,
          type: 'MARKET',
          quantity
        })
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
}

export const binanceService = new BinanceService(); 