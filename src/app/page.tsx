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

export default function Home() {
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-6 py-6 max-w-[1920px]">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">Trading View</h1>
              <p className="text-gray-300">Live Market Data</p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/market" 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Market Overview
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