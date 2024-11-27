'use client';
import { useState } from 'react';
import { TradeChart } from '@/components/TradeChart';
import { TradeTable } from '@/components/TradeTable';

const TRADING_PAIRS = [
  'ETHUSDT',
  'BTCUSDT', 
  'AVAXUSDT',
  'SOLUSDT',
  'RENDERUSDT',
  'FETUSDT'
];

export default function Home() {
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-6 py-6 max-w-[1920px]">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold mb-2">Crypto Trading Bot </h1>
          <p className="text-gray-300">Live Trading Signals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Price Chart</h2>
                <div className="flex items-center gap-4">
                  <select 
                    className="bg-gray-700 rounded px-3 py-1"
                    value={selectedPair}
                    onChange={(e) => setSelectedPair(e.target.value)}
                  >
                    {TRADING_PAIRS.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </select>
                  {currentPrice && (
                    <span className="text-xl font-bold">
                      ${currentPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <TradeChart 
                selectedPair={selectedPair}
                onPriceUpdate={setCurrentPrice}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <TradeTable selectedPair={selectedPair} />
          </div>
        </div>
      </main>
    </div>
  );
}