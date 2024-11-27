'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, UTCTimestamp } from 'lightweight-charts';
import { binanceService } from '@/services/binance';

const TRADING_PAIRS = [
  'ETHUSDT',
  'BTCUSDT', 
  'AVAXUSDT',
  'SOLUSDT',
  'RENDERUSDT',
  'FETUSDT'
];


interface TradeChartProps {
  selectedPair: string;
  onPriceUpdate: (price: number) => void;
}

export function TradeChart({ selectedPair}: TradeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Son 30 gün
    endDate: new Date()
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');

  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' }
  ];

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = chart.addCandlestickSeries();

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  const loadHistoricalData = async () => {
    try {
      const startTimestamp = Math.floor(dateRange.startDate.getTime());
      const endTimestamp = Math.floor(dateRange.endDate.getTime());

      console.log('Fetching data for range:', {
        start: new Date(startTimestamp).toISOString(),
        end: new Date(endTimestamp).toISOString(),
        pair: selectedPair,
        timeframe: selectedTimeframe
      });

      const klines = await binanceService.getHistoricalKlines(
        selectedPair,
        selectedTimeframe,
        startTimestamp,
        endTimestamp
      );

      if (klines && klines.length > 0) {
        const formattedKlines = klines.map((kline: { time: number }) => ({
          ...kline,
          time: kline.time / 1000 as UTCTimestamp
        }));

        console.log(`Loaded ${formattedKlines.length} candles`);
        
        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(formattedKlines);
        }
      } else {
        console.warn('No data received from Binance API');
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };

  useEffect(() => {
    loadHistoricalData();
  }, [selectedPair, dateRange, selectedTimeframe]);

  return (
    <div className="p-2 pt-1 bg-gray-800 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-300">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              startDate: new Date(e.target.value)
            }))}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md px-2 text-xs text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
        
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-300">End Date</label>
          <input
            type="date"
            value={dateRange.endDate.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              endDate: new Date(e.target.value)
            }))}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md px-2 text-xs text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-300">Timeframe</label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md px-2 text-xs text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-300">Action</label>
          <button
            onClick={loadHistoricalData}
            className="w-full h-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-medium rounded-md shadow-lg transition-all duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 active:scale-[0.98]"
          >
            <div className="flex items-center justify-center space-x-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Load Data</span>
            </div>
          </button>
        </div>
      </div>

      <div 
        ref={chartContainerRef} 
        className="w-full h-[500px] bg-gray-900 rounded-lg border border-gray-700"
      />
    </div>
  );
} 