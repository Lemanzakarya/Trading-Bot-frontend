'use client';
import { useEffect, useState } from 'react';
import { binanceService } from '@/services/binance';

interface Trade {
  id: number;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

interface TradeTableProps {
  selectedPair: string;
}

export function TradeTable({ selectedPair }: TradeTableProps) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // WebSocket bağlantısı oluşturuluyor
    const ws = binanceService.subscribeToTrades(selectedPair, (trade) => {
      setTrades((prevTrades) => {
        const newTrade = {
          id: trade.t,
          price: parseFloat(trade.p),
          quantity: parseFloat(trade.q),
          time: trade.T,
          isBuyerMaker: trade.m
        };
        
        return [newTrade, ...prevTrades].slice(0, 20);
      });
    });

    return () => ws.close();
  }, [selectedPair]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-[655px]">
      <h2 className="text-xl font-bold mb-4">Market Trades</h2>
      <div className="overflow-x-auto mx-2 h-[560px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400">
              <th className="text-left py-2">Price</th>
              <th className="text-right py-2">Amount</th>
              <th className="text-right py-2">Total</th>
              <th className="text-right py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-t border-gray-700">
                <td className={`py-2 ${!trade.isBuyerMaker ? 'text-green-500' : 'text-red-500'}`}>
                  ${trade.price.toFixed(2)}
                </td>
                <td className="text-right py-2">{trade.quantity.toFixed(6)}</td>
                <td className="text-right py-2">
                  ${(trade.price * trade.quantity).toFixed(2)}
                </td>
                <td className="text-right py-2">
                  {new Date(trade.time).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 