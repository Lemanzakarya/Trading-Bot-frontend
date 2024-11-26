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

  useEffect(() => {
    if (!chartContainerRef.current || chartRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
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
    const loadData = async () => {
      try {
        const klines = await binanceService.getKlines(selectedPair, '1m');
        const formattedKlines = klines.map(kline => ({
          ...kline,
          time: kline.time / 1000 as UTCTimestamp
        }));
        
        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(formattedKlines);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadData();

    const ws = binanceService.subscribeToKlines(selectedPair, '1m', (kline) => {
      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.update({
          ...kline,
          time: kline.time / 1000 as UTCTimestamp
        });
      }
      onPriceUpdate(kline.close);
    });

    return () => ws.close();
  }, [selectedPair, onPriceUpdate]);

  return (
    <div ref={chartContainerRef} className="w-full h-[400px]" />
  );
} 