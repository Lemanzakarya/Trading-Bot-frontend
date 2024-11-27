'use client';
import { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { tradingService } from '@/services/trading';

interface TradeChartProps {
  selectedPair: string;
  onPriceUpdate: (price: number) => void;
}

export function TradeChart({ selectedPair, onPriceUpdate }: TradeChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);

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

  useEffect(() => {
    let isSubscribed = true;

    const initializeChart = async () => {
      try {
        console.log('Initializing chart for', selectedPair);
        await tradingService.connect();
        
        console.log('Socket connection established');
        
        await tradingService.selectSymbol(selectedPair);
        console.log('Symbol selected:', selectedPair);

        const endTime = Date.now();
        const startTime = endTime - (7 * 24 * 60 * 60 * 1000);
        
        console.log('Requesting historical data...');
        const klines = await tradingService.getKlines(
          selectedPair,
          '1h',
          startTime,
          endTime
        );

        console.log('Received klines:', klines?.length);

        if (isSubscribed && candlestickSeriesRef.current && klines?.length > 0) {
          console.log('Setting chart data with', klines.length, 'candles');
          candlestickSeriesRef.current.setData(klines);
          onPriceUpdate(klines[klines.length - 1].close);
        } else {
          console.warn('Chart not initialized or no data received');
        }
      } catch (error) {
        console.error('Chart initialization error:', error);
      }
    };

    initializeChart();

    return () => {
      isSubscribed = false;
      tradingService.disconnect();
    };
  }, [selectedPair, onPriceUpdate]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div 
        ref={chartContainerRef} 
        className="w-full h-[500px] bg-gray-900 rounded-lg border border-gray-700"
      />
    </div>
  );
} 