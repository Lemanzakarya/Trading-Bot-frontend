'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, UTCTimestamp } from 'lightweight-charts';
import { binanceService } from '@/services/binance';

interface TradeChartProps {
  selectedPair: string;
  onPriceUpdate: (price: number) => void;
}

export function TradeChart({ selectedPair, onPriceUpdate }: TradeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Last 4 days
    endDate: new Date()
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState('4h');
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [lastLoadedTimeframe, setLastLoadedTimeframe] = useState('4h');

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

    loadHistoricalData();

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    loadHistoricalData();
  }, [selectedPair, selectedTimeframe, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (isBotRunning) {
      const ws = binanceService.subscribeToKlines(selectedPair, '1m', (kline) => {
        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.update(kline);
        }
        onPriceUpdate(kline.close);
        checkForTradingSignals(kline);
      });

      return () => ws.close();
    }
  }, [isBotRunning, selectedPair]);

  const loadHistoricalData = async () => {
    try {
      const startTimestamp = dateRange.startDate.getTime();
      const endTimestamp = dateRange.endDate.getTime();

      const klines = await binanceService.getHistoricalKlines(
        selectedPair,
        selectedTimeframe,
        startTimestamp,
        endTimestamp
      );

      if (klines && klines.length > 0) {
        const formattedKlines = klines.map((kline: { time: number, close: number }) => ({
          ...kline,
          time: kline.time / 1000 as UTCTimestamp
        }));

        console.log(`Loaded ${formattedKlines.length} candles from ${new Date(startTimestamp).toLocaleDateString()} to ${new Date(endTimestamp).toLocaleDateString()}`);
        
        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(formattedKlines);
        }

        if (chartRef.current) {
          const timeScale = chartRef.current.timeScale();
          timeScale.setVisibleRange({
            from: (startTimestamp / 1000) as UTCTimestamp,
            to: (endTimestamp / 1000) as UTCTimestamp
          });
        }

        setLastLoadedTimeframe(selectedTimeframe);

        const latestKline = formattedKlines[formattedKlines.length - 1];
        onPriceUpdate(latestKline.close);
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };

  const toggleBot = () => {
    setIsBotRunning(!isBotRunning);
  };

  const checkForTradingSignals = (kline: any) => {
    // Implement your trading strategy here
    // This is a placeholder for demonstration
    const randomSignal = Math.random() > 0.5 ? 'BUY' : 'SELL';
    if (randomSignal === 'BUY') {
      console.log(`BUY signal at ${kline.close}`);
      // Call your buy function here
    } else {
      console.log(`SELL signal at ${kline.close}`);
      // Call your sell function here
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-300">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({
              ...prev,
              startDate: new Date(e.target.value)
            }))}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md px-2 text-xs text-gray-200"
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
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md px-2 text-xs text-gray-200"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-300">Timeframe</label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="w-full h-8 bg-gray-700 border border-gray-600 rounded-md px-2 text-xs text-gray-200"
          >
            {timeframes.map(tf => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div 
        ref={chartContainerRef} 
        className="w-full h-[500px] bg-gray-900 rounded-lg border border-gray-700"
      />
    </div>
  );
} 