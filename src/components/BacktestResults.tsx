'use client';
import { useState, useEffect } from 'react';

interface BacktestResult {
  coin: string;
  timeframe: string;
  initialBalance: number;
  finalBalance: number;
  totalTrades: number;
  winRate: number;
  profitLoss: number;
  bestStrategy: {
    indicators: {
      name: string;
      parameters: Record<string, number>;
      performance: number;
    }[];
  };
  timeframePerformance: {
    period: string;
    profit: number;
    trades: number;
  }[];
}

export function BacktestResults() {
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [isLoading, setIsLoading] = useState(true);

  const coins = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT', 'XRPUSDT'];
  const timeframes = ['1d', '4h', '1h', '15m'];

  useEffect(() => {
    const fetchBacktestResults = async () => {
      setIsLoading(true);
      try {
        // 4 aylık veriyi al
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 4);

        const response = await fetch('/api/backtest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coins,
            timeframes,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            initialBalance: 10000
          })
        });

        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Backtest error:', error);
      }
      setIsLoading(false);
    };

    fetchBacktestResults();
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Backtest Results (Last 4 Months)</h2>
      
      <div className="flex gap-4 mb-6">
        <select 
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2"
        >
          {coins.map(coin => (
            <option key={coin} value={coin}>{coin}</option>
          ))}
        </select>

        <select 
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="bg-gray-700 rounded px-3 py-2"
        >
          {timeframes.map(tf => (
            <option key={tf} value={tf}>{tf}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading backtest results...</div>
      ) : (
        <div className="space-y-6">
          {/* Timeframe Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {results
              .find(r => r.coin === selectedCoin)
              ?.timeframePerformance.map(tf => (
                <div key={tf.period} className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">{tf.period}</h3>
                  <p className={`text-lg ${tf.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {tf.profit >= 0 ? '+' : ''}{tf.profit.toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-400">Trades: {tf.trades}</p>
                </div>
              ))}
          </div>

          {/* Best Strategy Details */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Best Performing Strategy</h3>
            {results
              .find(r => r.coin === selectedCoin && r.timeframe === selectedTimeframe)
              ?.bestStrategy.indicators.map((ind, index) => (
                <div key={index} className="mb-4">
                  <p className="font-bold">{ind.name}</p>
                  <p className="text-sm text-gray-400">
                    Parameters: {JSON.stringify(ind.parameters)}
                  </p>
                  <p className="text-green-500">
                    Performance: +{ind.performance.toFixed(2)}%
                  </p>
                </div>
              ))}
          </div>

          {/* Detailed Results Table */}
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="py-2">Coin</th>
                <th>Initial Balance</th>
                <th>Final Balance</th>
                <th>Win Rate</th>
                <th>Total Trades</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className="border-t border-gray-700">
                  <td className="py-2">{result.coin}</td>
                  <td>${result.initialBalance.toLocaleString()}</td>
                  <td className={result.finalBalance >= result.initialBalance ? 'text-green-500' : 'text-red-500'}>
                    ${result.finalBalance.toLocaleString()}
                  </td>
                  <td>{result.winRate}%</td>
                  <td>{result.totalTrades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 