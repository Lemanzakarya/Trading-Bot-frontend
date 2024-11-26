'use client';
import { useState } from 'react';
import { TradeChart } from '@/components/TradeChart';
import { TradeTable } from '@/components/TradeTable';

export default function Home() {
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Crypto Trading Bot</h1>
          <p className="text-gray-300">Live Trading Data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Price Chart</h2>
                <div className="flex items-center gap-4">
                  <select 
                    className="bg-gray-700 rounded px-3 py-1"
                    value={selectedPair}
                    onChange={(e) => setSelectedPair(e.target.value)}
                  >
                    <option value="BTCUSDT">BTC/USDT</option>
                    <option value="ETHUSDT">ETH/USDT</option>
                    <option value="BNBUSDT">BNB/USDT</option>
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

          {/* Trade Table Section */}
          <div className="lg:col-span-1">
            <TradeTable selectedPair={selectedPair} />
          </div>
        </div>
      </main>
    </div>
  );
}