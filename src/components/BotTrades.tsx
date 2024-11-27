'use client';
import { useState, useEffect } from 'react';

interface Trade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  total: number;
  timestamp: number;
  signal: string;
}

interface BotTradesProps {
  selectedPair: string;
  currentPrice: number;
}

export function BotTrades({ selectedPair, currentPrice }: BotTradesProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [balance, setBalance] = useState(10000);
  const [position, setPosition] = useState(0);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [indicators, setIndicators] = useState({
    rsi: { period: 14, overbought: 70, oversold: 30 },
    sma: { period: 20 },
    ema: { period: 20 },
    macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }
  });

  const executeTrade = (type: 'BUY' | 'SELL', signal: string) => {
    if (!currentPrice) {
      console.error('Current price is not available');
      return;
    }

    const amount = type === 'BUY' ? 100 / currentPrice : position;
    const total = amount * currentPrice;

    if (type === 'BUY' && balance < total) {
      console.error('Insufficient balance for buying');
      return;
    }

    const newTrade: Trade = {
      id: Date.now().toString(),
      pair: selectedPair,
      type,
      price: currentPrice,
      amount,
      total,
      timestamp: Date.now(),
      signal
    };

    setTrades(prev => [newTrade, ...prev].slice(0, 5));
    setBalance(prev => type === 'BUY' ? prev - total : prev + total);
    setPosition(prev => type === 'BUY' ? prev + amount : 0);

    console.log(`Executed ${type} trade:`, newTrade);
  };

  const handleIndicatorChange = (indicator: string, field: string, value: number) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: {
        ...prev[indicator as keyof typeof indicators],
        [field]: value
      }
    }));
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isBotRunning) {
      interval = setInterval(() => {
        const randomSignal = Math.random() > 0.5 ? 'BUY' : 'SELL';
        executeTrade(randomSignal, 'Auto');
      }, 60000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isBotRunning, selectedPair, currentPrice]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bot Trades</h2>
        <div className="text-lg font-bold">
          Balance: ${balance.toFixed(2)} USDT
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">RSI Period</label>
          <input
            type="number"
            value={indicators.rsi.period}
            onChange={(e) => handleIndicatorChange('rsi', 'period', parseInt(e.target.value))}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md px-2 text-sm text-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">SMA Period</label>
          <input
            type="number"
            value={indicators.sma.period}
            onChange={(e) => handleIndicatorChange('sma', 'period', parseInt(e.target.value))}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md px-2 text-sm text-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">EMA Period</label>
          <input
            type="number"
            value={indicators.ema.period}
            onChange={(e) => handleIndicatorChange('ema', 'period', parseInt(e.target.value))}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md px-2 text-sm text-gray-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">MACD Fast Period</label>
          <input
            type="number"
            value={indicators.macd.fastPeriod}
            onChange={(e) => handleIndicatorChange('macd', 'fastPeriod', parseInt(e.target.value))}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md px-2 text-sm text-gray-200"
          />
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setIsBotRunning(!isBotRunning)}
          className={`w-full font-bold py-2 px-4 rounded ${
            isBotRunning 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors duration-200`}
        >
          {isBotRunning ? 'Stop Bot' : 'Start Bot'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400">
              <th className="text-left py-2">Type</th>
              <th className="text-right">Price</th>
              <th className="text-right">Amount</th>
              <th className="text-right">Total</th>
              <th className="text-right">Signal</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-t border-gray-700">
                <td className={`py-2 ${trade.type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                  {trade.type}
                </td>
                <td className="text-right">${trade.price.toFixed(2)}</td>
                <td className="text-right">{trade.amount.toFixed(6)}</td>
                <td className="text-right">${trade.total.toFixed(2)}</td>
                <td className="text-right">{trade.signal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}