import React, { useState } from "react";
import { Alchemy, Network } from "alchemy-sdk";

const AutoWalletScanner = () => {
  const [address, setAddress] = useState("");
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const settings = {
    apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET, // Bisa ganti ke Network.ARBITRUM_MAINNET, dll
  };

  const alchemy = new Alchemy(settings);

  const fetchTokens = async () => {
    if (!address) return setError("Masukkan wallet address terlebih dahulu.");
    setLoading(true);
    setError("");
    setTokens([]);

    try {
      const balances = await alchemy.core.getTokenBalances(address);
      const nonZeroTokens = balances.tokenBalances.filter(
        (t) => t.tokenBalance !== "0"
      );

      const metadataPromises = nonZeroTokens.map(async (token) => {
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        const balance =
          Number(token.tokenBalance) / Math.pow(10, metadata.decimals || 18);

        return {
          name: metadata.name,
          symbol: metadata.symbol,
          logo: metadata.logo,
          balance: balance.toFixed(4),
        };
      });

      const results = await Promise.all(metadataPromises);
      setTokens(results);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data token. Periksa address dan API key kamu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        🪙 Auto Wallet Scanner
      </h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Masukkan wallet address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1 p-2 rounded-md bg-gray-800 border border-gray-700 text-sm"
        />
        <button
          onClick={fetchTokens}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {tokens.length > 0 && (
        <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
          {tokens.map((t, idx) => (
            <div
              key={idx}
              className="flex items-center bg-gray-800 p-2 rounded-lg"
            >
              {t.logo ? (
                <img src={t.logo} alt={t.symbol} className="w-6 h-6 mr-2" />
              ) : (
                <div className="w-6 h-6 mr-2 bg-gray-700 rounded-full" />
              )}
              <span className="flex-1 text-sm">
                {t.name} ({t.symbol})
              </span>
              <span className="text-gray-300 text-sm">{t.balance}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutoWalletScanner;
