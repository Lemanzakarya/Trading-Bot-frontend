'use client';
import { useState } from 'react';
import { TradeChart } from '@/components/TradeChart';
import { TradeTable } from '@/components/TradeTable';
import Link from 'next/link';

const TRADING_PAIRS = [
  'ETHUSDT',
  'BTCUSDT', 
  'AVAXUSDT',
  'SOLUSDT',
  'RENDERUSDT',
  'FETUSDT'
];

export default function MarketPage() {
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-6 py-6 max-w-[1920px]">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Market Trading</h1>
              <p className="text-gray-300">Live Market Data</p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Switch to Bot Trading
              </Link>
              <select 
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TradeChart 
              selectedPair={selectedPair}
              onPriceUpdate={setCurrentPrice}
            />
          </div>
          <div className="lg:col-span-1">
            <TradeTable selectedPair={selectedPair} />
          </div>
        </div>
      </main>
    </div>
  );
} 