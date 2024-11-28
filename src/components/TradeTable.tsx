"use client";
import { useEffect, useState } from "react";
import { socket } from "@/services/socket";

interface Trade {
  action: string;
  symbol: string;
  price: number;
  balance: number;
  position: string | null;
  pnl: number;
  timestamp: number;
}

interface TradeTableProps {
  selectedPair: string;
}

export function TradeTable({ selectedPair }: TradeTableProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isTrading, setIsTrading] = useState(false);

  // Coin seçimi değiştiğinde
  useEffect(() => {
    if (selectedPair) {
      console.log("🎯 Selected pair changed:", selectedPair);
      // Coin seçimini backend'e bildir
      socket.emit('select_coin', { symbol: selectedPair });
    }
  }, [selectedPair]);

  // Start trading fonksiyonu
  const handleStartTrading = () => {
    if (!selectedPair) {
      console.error("❌ No pair selected");
      return;
    }

    const symbol = selectedPair.replace("USDT", "");
    console.log("🚀 Starting trading for:", symbol);

    const tradingParams = {
      symbol: symbol,
      indicators: {
        rsi: {
          enabled: true,
          period: 14,
        },
        bollinger: {
          enabled: true,
          period: 20,
          deviation: 2.0,
        },
        macd: {
          enabled: true,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
        },
      },
    };

    console.log("📤 Sending trading params:", JSON.stringify(tradingParams));
    socket.emit("start_trading", tradingParams);
    setIsTrading(true);
  };

  // Stop trading fonksiyonu
  const handleStopTrading = () => {
    console.log("🛑 Stopping trading");
    socket.emit("stop_trading");
    setIsTrading(false);
  };

  useEffect(() => {
    console.log("🔄 TradeTable mounted, listening for trade updates...");

    // Trade güncellemelerini dinle
    const handleTradeUpdate = (trade: Trade) => {
      console.log("📊 Received trade update:", trade);
      setTrades((prevTrades) => {
        const newTrades = [trade, ...prevTrades].slice(0, 20);
        console.log("📈 Updated trades list:", newTrades);
        return newTrades;
      });
    };

    socket.on("trade_update", handleTradeUpdate);

    // Debug için bağlantı durumunu kontrol et
    console.log("🔌 Socket connected:", socket.connected);

    // Test için manuel trade ekle
    if (process.env.NODE_ENV === "development") {
      const testTrade: Trade = {
        action: "BUY",
        symbol: selectedPair,
        price: 50000,
        balance: 10000,
        position: "buy",
        pnl: 0,
        timestamp: Date.now(),
      };
      handleTradeUpdate(testTrade);
    }

    // Trading durumu dinleyicisi
    socket.on("trading_status", (status) => {
      console.log("📊 Trading status update:", status);
      if (status.status === "TRADING_STOPPED") {
        setIsTrading(false);
      }
    });

    return () => {
      console.log("🔄 TradeTable unmounting, removing listeners...");
      socket.off("trade_update", handleTradeUpdate);
      socket.off("trading_status");
    };
  }, [selectedPair]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Trade History</h2>
        <button
          onClick={isTrading ? handleStopTrading : handleStartTrading}
          className={`px-4 py-2 rounded-lg font-bold ${
            isTrading
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isTrading ? "Stop Trading" : "Start Trading"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400">
              <th className="text-left py-2">Action</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Balance</th>
              <th className="text-right py-2">PNL</th>
              <th className="text-right py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td
                  className={`py-2 ${
                    trade.action === "BUY"
                      ? "text-green-500"
                      : trade.action === "SELL"
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {trade.action}
                </td>
                <td className="text-right py-2">${trade.price.toFixed(2)}</td>
                <td className="text-right py-2">${trade.balance.toFixed(2)}</td>
                <td
                  className={`text-right py-2 ${
                    (trade.pnl || 0) > 0
                      ? "text-green-500"
                      : (trade.pnl || 0) < 0
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  ${(trade.pnl || 0).toFixed(2)}
                </td>
                <td className="text-right py-2">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
