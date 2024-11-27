'use client';
import { useEffect, useState } from 'react';
import { tradingService, Trade } from '@/services/trading';

interface TradeTableProps {
  selectedPair: string;
}

export function TradeTable({ selectedPair }: TradeTableProps) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    let isSubscribed = true;

    const initializeTradeTable = async () => {
      try {
        await tradingService.connect();
        await tradingService.selectSymbol(selectedPair);
        
        await tradingService.subscribeToTrades(selectedPair, (trade) => {
          if (isSubscribed) {
            setTrades(prevTrades => [trade, ...prevTrades].slice(0, 20));
          }
        });
      } catch (error) {
        console.error('Trade table initialization error:', error);
      }
    };

    initializeTradeTable();

    return () => {
      isSubscribed = false;
      tradingService.unsubscribeFromTrades();
      tradingService.disconnect();
    };
  }, [selectedPair]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Son İşlemler</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400">
              <th className="text-left py-2">Fiyat</th>
              <th className="text-right py-2">Miktar</th>
              <th className="text-right py-2">Toplam</th>
              <th className="text-right py-2">Zaman</th>
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