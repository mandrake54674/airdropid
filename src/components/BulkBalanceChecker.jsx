import React, { useState } from 'react';
import { ethers } from 'ethers';

// ✅ FIXED: Updated RPC endpoints - menggunakan public RPC yang tidak perlu API key
const NETWORKS = {
  Ethereum: { rpc: \"https://eth.llamarpc.com\", symbol: \"ETH\" },
  Polygon: { rpc: \"https://polygon-rpc.com\", symbol: \"MATIC\" },
  BSC: { rpc: \"https://bsc-dataseed.binance.org\", symbol: \"BNB\" },
  Arbitrum: { rpc: \"https://arb1.arbitrum.io/rpc\", symbol: \"ETH\" },
  Base: { rpc: \"https://mainnet.base.org\", symbol: \"ETH\" },
};

// Helper function untuk test RPC connection
async function testRpc(url) {
  try {
    const r = await fetch(url, {
      method: \"POST\",
      headers: { \"Content-Type\": \"application/json\" },
      body: JSON.stringify({ 
        jsonrpc: \"2.0\", 
        id: 1, 
        method: \"eth_blockNumber\", 
        params: [] 
      }),
    });
    if (!r.ok) throw new Error(\"HTTP \" + r.status);
    const j = await r.json();
    if (j.error) throw new Error(\"RPC error: \" + JSON.stringify(j.error));
    console.log(\"✅ RPC OK:\", url, j);
    return true;
  } catch (err) {
    console.error(\"❌ RPC test failed:\", url, err);
    return false;
  }
}

// Helper function untuk chunking array
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

// ✅ FIXED: Main function dengan improved validation dan error handling
export const checkBalances = async (
  addressesText, 
  selectedNetwork = \"Ethereum\",
  setBalanceLoading,
  setBalances
) => {
  // Parse addresses - support multiple delimiters
  const list = addressesText
    .split(/[
,\s]+/)
    .map((a) => a.trim())
    .filter(Boolean);

  if (list.length === 0) {
    alert(\"Masukkan minimal satu address!\");
    return;
  }

  // ✅ FIXED: Validasi addresses dengan detail error
  const invalidAddresses = [];
  const validAddresses = [];
  
  list.forEach(addr => {
    if (!ethers.isAddress(addr)) {
      invalidAddresses.push(addr);
    } else {
      // Normalize ke checksum format
      validAddresses.push(ethers.getAddress(addr));
    }
  });

  if (invalidAddresses.length > 0) {
    alert(`⚠️ Ditemukan ${invalidAddresses.length} address tidak valid:
${invalidAddresses.slice(0, 5).join('
')}${invalidAddresses.length > 5 ? '
...' : ''}`);
    return;
  }

  const networkConfig = NETWORKS[selectedNetwork];
  if (!networkConfig) {
    alert(\"Network tidak ditemukan: \" + selectedNetwork);
    return;
  }

  setBalanceLoading(true);
  setBalances([]);

  try {
    // Test RPC connection first
    const rpcOk = await testRpc(networkConfig.rpc);
    if (!rpcOk) {
      alert(`⚠️ Koneksi ke ${selectedNetwork} RPC gagal. Coba network lain.`);
      setBalanceLoading(false);
      return;
    }

    // ✅ FIXED: Create provider dengan error handling
    const provider = new ethers.JsonRpcProvider(networkConfig.rpc);

    // Chunking: 5 address per batch untuk menghindari rate limit
    const batches = chunk(validAddresses, 5);
    const results = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`📦 Processing batch ${i + 1}/${batches.length}...`);

      // Process batch dengan Promise.allSettled
      const settled = await Promise.allSettled(
        batch.map(async (addr) => {
          try {
            const balanceBN = await provider.getBalance(addr);
            const balance = parseFloat(ethers.formatEther(balanceBN)).toFixed(6);
            return { 
              address: addr, 
              balance: balance,
              symbol: networkConfig.symbol 
            };
          } catch (err) {
            console.error(`❌ Error checking ${addr}:`, err.message);
            return { 
              address: addr, 
              balance: \"❌ Error\",
              symbol: networkConfig.symbol 
            };
          }
        })
      );

      // Collect results
      settled.forEach((s) => {
        if (s.status === \"fulfilled\") {
          results.push(s.value);
        } else {
          results.push({ 
            address: \"unknown\", 
            balance: \"❌ Error\",
            symbol: networkConfig.symbol 
          });
        }
      });

      // Delay antar batch untuk rate limiting
      if (i < batches.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    setBalances(results);
    console.log(`✅ Successfully checked ${results.length} addresses`);

  } catch (err) {
    console.error(\"❌ Provider error:\", err);
    alert(`⚠️ Gagal terhubung ke ${selectedNetwork} network: ${err.message}`);
  } finally {
    setBalanceLoading(false);
  }
};

export default { checkBalances, NETWORKS };
