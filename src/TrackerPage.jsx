import React, { useEffect, useState } from "react";
import {
  Twitter,
  MessageCircle,
  Send,
  Wallet,
  Mail,
  Globe,
  Github,
  Eye,
  EyeOff,
  LogOut,
  ArrowUpDown,
  CheckSquare,
  Square,
  ExternalLink,
  Tag,
  StickyNote,
  Filter,
  X,
  Trash2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ethers } from "ethers";
import NeonParticles from "./NeonParticles";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import GasTracker from "./components/GasTracker";
import ROICalculator from "./components/ROICalculator";
import NewsAggregator from "./components/NewsAggregator";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

const DEX_LIST = [
  { name: "Uniswap", logo: "/dex/uniswap.png", link: "https://app.uniswap.org" },
  { name: "PancakeSwap", logo: "/dex/pancakeswap.png", link: "https://pancakeswap.finance" },
  { name: "Raydium", logo: "/dex/raydium.png", link: "https://raydium.io" },
  { name: "SushiSwap", logo: "/dex/sushiswap.png", link: "https://www.sushi.com" },
  { name: "QuickSwap", logo: "/dex/quickswap.png", link: "https://quickswap.exchange" },
];

const NETWORKS = {
  Ethereum: { rpc: "https://eth.llamarpc.com" },
  Polygon: { rpc: "https://polygon-rpc.com" },
  BSC: { rpc: "https://bsc-dataseed.binance.org" },
  Arbitrum: { rpc: "https://arb1.arbitrum.io/rpc" },
  Base: { rpc: "https://mainnet.base.org" },
};

// Predefined Tags/Categories
const AVAILABLE_TAGS = [
  { id: "defi", label: "DeFi", color: "bg-blue-500" },
  { id: "gamefi", label: "GameFi", color: "bg-purple-500" },
  { id: "layer2", label: "Layer2", color: "bg-green-500" },
  { id: "nft", label: "NFT", color: "bg-pink-500" },
  { id: "meme", label: "Meme", color: "bg-yellow-500" },
  { id: "infra", label: "Infrastructure", color: "bg-cyan-500" },
  { id: "social", label: "SocialFi", color: "bg-orange-500" },
  { id: "bridge", label: "Bridge", color: "bg-indigo-500" },
  { id: "dex", label: "DEX", color: "bg-red-500" },
  { id: "lending", label: "Lending", color: "bg-teal-500" },
];

function TrackerPage({ onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hideData, setHideData] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [coins, setCoins] = useState([]);
  const [timer, setTimer] = useState(60);
  const [progress, setProgress] = useState(100);
  const [showDexList, setShowDexList] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");
  const [addresses, setAddresses] = useState("");
  const [balances, setBalances] = useState([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [filterTag, setFilterTag] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    wallet: "",
    email: "",
    github: "",
    website: "",
    notes: "",
    tags: [],
  });

  // === FETCH PROJECTS ===
  const fetchProjects = async () => {
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL + "?action=read");
      const data = await res.json();
      console.log("Raw data from Google Sheets:", data);
      
      if (Array.isArray(data)) {
        // Parse tags from JSON string back to array with better error handling
        const parsedData = data.map(project => {
          let parsedTags = [];
          
          // Handle tags parsing
          if (project.tags) {
            if (typeof project.tags === 'string') {
              const trimmed = project.tags.trim();
              if (trimmed) {
                try {
                  // Try to parse as JSON
                  parsedTags = JSON.parse(trimmed);
                  // Ensure it's an array
                  if (!Array.isArray(parsedTags)) {
                    parsedTags = [parsedTags];
                  }
                } catch (e) {
                  console.error("Failed to parse tags for project:", project.name, "tags value:", project.tags);
                  // If parsing fails, treat as empty array
                  parsedTags = [];
                }
              }
            } else if (Array.isArray(project.tags)) {
              parsedTags = project.tags;
            }
          }
          
          return {
            ...project,
            tags: parsedTags,
            notes: project.notes || ""
          };
        });
        
        console.log("Parsed data with tags:", parsedData);
        setProjects(parsedData);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("⚠️ Gagal memuat data dari Google Sheets");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // === TAMBAH PROJECT ===
  const addProject = async () => {
    if (!formData.name) return alert("Nama project wajib diisi!");
    try {
      setLoading(true);
      // Convert tags array to JSON string for Google Sheets
      const dataToSend = {
        ...formData,
        tags: JSON.stringify(formData.tags || [])
      };
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(dataToSend),
      });
      const text = await res.text();
      if (text.toLowerCase().includes("ok")) {
        fetchProjects();
        setFormData({
          name: "",
          twitter: "",
          discord: "",
          telegram: "",
          wallet: "",
          email: "",
          github: "",
          website: "",
          notes: "",
          tags: [],
        });
        setSelectedTags([]);
      }
    } catch {
      alert("❌ Gagal kirim data ke Google Script!");
    } finally {
      setLoading(false);
    }
  };

  // === DAILY CHECK TOGGLE ===
  const toggleDaily = async (name, current) => {
    const next = current === "CHECKED" ? "UNCHECKED" : "CHECKED";
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "updateDaily",
          name,
          value: next,
        }),
      });
      fetchProjects();
    } catch (err) {
      console.error("Gagal update daily:", err);
    }
  };

  // === DELETE PROJECT ===
  const deleteProject = async (name) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus project "${name}"?`);
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "delete",
          name: name,
        }),
      });
      const text = await res.text();
      if (text.toLowerCase().includes("ok") || text.toLowerCase().includes("deleted")) {
        alert("✅ Project berhasil dihapus!");
        fetchProjects();
      } else {
        alert("⚠️ Gagal menghapus project!");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("❌ Gagal menghapus project!");
    } finally {
      setLoading(false);
    }
  };

  // === FETCH COIN MARKET ===
  const fetchMarket = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=6&page=1&sparkline=true"
      );
      const data = await res.json();
      setCoins(data);
    } catch {
      setCoins([]);
    }
  };

  // === AUTO REFRESH TIMER + PROGRESS BAR ===
  useEffect(() => {
    fetchMarket();
    const refreshInterval = setInterval(() => {
      fetchMarket();
      setTimer(60);
      setProgress(100);
    }, 60000);

    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 60));
      setProgress((prev) => (prev > 0 ? prev - 100 / 60 : 100));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdown);
    };
  }, []);

  const progressColor =
    timer > 40 ? "#22c55e" : timer > 20 ? "#facc15" : "#ef4444";

  // Filter projects by search term and tags
  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch = (p.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      // Debug logging for tag filtering
      const hasTags = p.tags && Array.isArray(p.tags);
      const matchesTags =
        filterTag === "all" ||
        (hasTags && p.tags.includes(filterTag));
      
      // Log when filtering by specific tag
      if (filterTag !== "all") {
        console.log(`Project: ${p.name}, Tags: ${JSON.stringify(p.tags)}, FilterTag: ${filterTag}, Matches: ${matchesTags}`);
      }
      
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      const A = (a.name || "").toLowerCase();
      const B = (b.name || "").toLowerCase();
      return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });

  const displayedProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, 3);

  // Toggle tag selection in form
  const toggleTag = (tagId) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId];
      
      // Update formData with the new tags
      setFormData((prevForm) => ({
        ...prevForm,
        tags: newTags,
      }));
      
      return newTags;
    });
  };

  // === BULK BALANCE CHECK ===
  const checkBalances = async () => {
    const list = addresses.split(/[\n,\s]+/).filter(Boolean);
    if (list.length === 0) return alert("Masukkan address wallet!");
    
    setBalanceLoading(true);
    setBalances([]);
    const result = [];
    
    try {
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);
      
      for (const addr of list) {
        try {
          // Validate and normalize address
          if (!ethers.isAddress(addr)) {
            result.push({ 
              address: addr, 
              balance: "❌ Invalid Address" 
            });
            continue;
          }
          
          const checksumAddr = ethers.getAddress(addr);
          const bal = await provider.getBalance(checksumAddr);
          const formattedBalance = parseFloat(ethers.formatEther(bal)).toFixed(6);
          
          result.push({ 
            address: checksumAddr, 
            balance: formattedBalance 
          });
        } catch (err) {
          console.error(`Error checking ${addr}:`, err);
          result.push({ 
            address: addr, 
            balance: "❌ Error" 
          });
        }
      }
    } catch (err) {
      console.error("Provider error:", err);
      alert(`⚠️ Gagal terhubung ke ${selectedNetwork} network. Coba lagi!`);
    } finally {
      setBalances(result);
      setBalanceLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 animate-gradient">
      <NeonParticles />

      {/* HEADER */}
      <div className="relative z-50 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="flex items-center gap-2 text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          🚀 Airdrop Tracker
        </h1>

        <div className="flex flex-wrap justify-center md:justify-end items-center gap-3 relative z-50">
          {/* TAG FILTER */}
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
            >
              <Filter size={16} />
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer"
              >
                <option value="all">All Tags</option>
                {AVAILABLE_TAGS.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.label}
                  </option>
                ))}
              </select>
            </button>
          </div>

          {/* DEX BUTTON */}
          <div className="relative z-50">
            <button
              onClick={() => setShowDexList(!showDexList)}
              className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-semibold transition"
            >
              List DEX
            </button>

            {showDexList && (
              <div className="absolute top-12 left-0 bg-gray-900 border border-gray-700 rounded-xl shadow-lg w-56 p-2 transition-all duration-300 ease-in-out z-[9999]">
                {DEX_LIST.map((dex, i) => (
                  <a
                    key={i}
                    href={dex.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition"
                  >
                    <img
                      src={dex.logo}
                      alt={dex.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <span>{dex.name}</span>
                    <ExternalLink size={14} className="ml-auto text-gray-400" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="🔍 Cari project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 w-48 sm:w-60"
          />
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
          >
            <ArrowUpDown size={16} />
            {sortOrder === "asc" ? "A-Z" : "Z-A"}
          </button>
          <button
            onClick={() => setHideData(!hideData)}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {hideData ? <Eye size={18} /> : <EyeOff size={18} />}
            {hideData ? "Show" : "Hide"}
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* ===== ANALYTICS DASHBOARD ===== */}
      <div className="px-6">
        <AnalyticsDashboard 
          projects={projects} 
          balances={balances}
          selectedNetwork={selectedNetwork}
        />
      </div>

      {/* ===== GAS TRACKER ===== */}
      <div className="px-6">
        <GasTracker />
      </div>

      {/* ===== ROI CALCULATOR ===== */}
      <div className="px-6">
        <ROICalculator />
      </div>

      {/* ===== NEWS AGGREGATOR ===== */}
      <div className="px-6">
        <NewsAggregator />
      </div>
      
      {/* FORM INPUT */}
      <div className="relative z-10 bg-gray-900/60 p-6 rounded-2xl max-w-5xl mx-auto mb-8 shadow-lg w-[90%] md:w-auto">
        <h2 className="text-xl font-semibold mb-4 text-cyan-300 text-center md:text-left">
          ➕ Tambah Project Baru
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {["name", "twitter", "discord", "telegram", "wallet", "email", "github", "website"].map(
            (field) => (
              <input
                key={field}
                type="text"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                className="p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white w-full"
              />
            )
          )}
        </div>

        {/* Notes Field */}
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <StickyNote size={16} />
            Notes (Status, ROI estimate, dll)
          </label>
          <textarea
            placeholder="Add notes about this project..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-cyan-400 text-white resize-none"
            rows="2"
          ></textarea>
        </div>

        {/* Tags Selection */}
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Tag size={16} />
            Select Tags/Categories
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  selectedTags.includes(tag.id) || (formData.tags && formData.tags.includes(tag.id))
                    ? `${tag.color} text-white`
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={addProject}
          disabled={loading}
          className={`mt-4 px-6 py-2 rounded-lg shadow-md transition-all ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Loading..." : "+ Tambah Project"}
        </button>
      </div>

      {/* PROJECT LIST */}
      <div className="relative z-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-6">
        {displayedProjects.map((p, i) => (
          <div
            key={i}
            className="relative card p-5 fade-in"
          >
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => toggleDaily(p.name, p.daily)}
                className="text-cyan-400 hover:scale-110 transition"
                title="Toggle Daily Check"
              >
                {p.daily === "CHECKED" ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              <button
                onClick={() => deleteProject(p.name)}
                className="text-red-400 hover:text-red-500 hover:scale-110 transition"
                title="Hapus Project"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <h3 className="text-lg font-bold text-cyan-400 mb-3 mt-4">{p.name}</h3>

            {/* Tags Display */}
            {p.tags && Array.isArray(p.tags) && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {p.tags.map((tagId) => {
                  const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
                  return tag ? (
                    <span
                      key={tagId}
                      className={`${tag.color} text-white text-xs px-2 py-0.5 rounded-full font-semibold`}
                    >
                      {tag.label}
                    </span>
                  ) : null;
                })}
              </div>
            )}

            {/* Notes Display */}
            {p.notes && (
              <div className="mb-3 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="flex items-start gap-2 text-sm text-gray-300">
                  <StickyNote size={14} className="mt-0.5 text-yellow-400 flex-shrink-0" />
                  <span className="italic">{p.notes}</span>
                </p>
              </div>
            )}

            {p.twitter && <p className="flex items-center gap-2 text-blue-400"><Twitter size={18}/><span>{hideData?"••••":p.twitter}</span></p>}
            {p.discord && <p className="flex items-center gap-2 text-indigo-400"><MessageCircle size={18}/><span>{hideData?"••••":p.discord}</span></p>}
            {p.telegram && <p className="flex items-center gap-2 text-sky-400"><Send size={18}/><span>{hideData?"••••":p.telegram}</span></p>}
            {p.wallet && <p className="flex items-center gap-2 text-yellow-400 break-all"><Wallet size={18}/><span>{hideData?"••••":p.wallet}</span></p>}
            {p.email && <p className="flex items-center gap-2 text-pink-400"><Mail size={18}/><span>{hideData?"••••":p.email}</span></p>}
            {p.github && <p className="flex items-center gap-2 text-gray-300"><Github size={18}/><span>{hideData?"••••":p.github}</span></p>}
            {p.website && (
              <p className="flex items-center gap-2 text-blue-400">
                <Globe size={18}/>
                <a href={p.website} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300 break-all">
                  {p.website}
                </a>
              </p>
            )}
            {p.lastupdate && (
              <p className="text-xs text-gray-400 mt-2 italic">
                Last update: {new Date(p.lastupdate).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* READ MORE */}
      {filteredProjects.length > 3 && (
        <div className="text-center mt-8 mb-12">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            {showAll ? "⬆️ Read Less" : "⬇️ Read More"}
          </button>
        </div>
      )}

      {/* LIVE MARKET + TIMER */}
      <div className="relative z-10 mt-16 px-6 pb-10">
        <h2 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          📈 Live Crypto Market
        </h2>

        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm mb-2">
            ⏱️ Auto-refresh in <span className="text-cyan-400 font-semibold">{timer}s</span>
          </p>
          <div className="w-64 mx-auto h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%`, backgroundColor: progressColor }}
            ></div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coins.map((coin) => (
            <div key={coin.id} className="bg-gray-900/70 p-4 rounded-xl border border-gray-700 hover:border-cyan-400/60 shadow-lg transition-transform hover:scale-105 fade-in">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                  <span className="font-semibold">{coin.name}</span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
              <p className="text-gray-300 mb-2 text-sm">
                ${coin.current_price.toLocaleString()}
              </p>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={coin.sparkline_in_7d.price.map((p, i) => ({ i, p }))}>
                  <Line
                    type="monotone"
                    dataKey="p"
                    stroke={
                      coin.price_change_percentage_24h >= 0
                        ? "#22c55e"
                        : "#ef4444"
                    }
                    dot={false}
                    strokeWidth={2}
                  />
                  <XAxis hide />
                  <YAxis hide domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      background: "#111",
                      border: "none",
                      color: "#fff",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>

      {/* 💰 BULK WALLET BALANCE CHECKER */}
      <div className="relative z-10 mt-16 px-6 pb-10 fade-in">
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          💰 Bulk Wallet Balance Checker
        </h2>

        <div className="bg-gray-900/60 p-6 rounded-2xl shadow-lg border border-gray-700 max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {Object.keys(NETWORKS).map((net) => (
              <button
                key={net}
                onClick={() => setSelectedNetwork(net)}
                className={`px-4 py-2 rounded-lg ${
                  selectedNetwork === net
                    ? "bg-cyan-600"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {net}
              </button>
            ))}
          </div>

          <textarea
            className="w-full bg-gray-800 p-3 rounded-lg border border-gray-700 text-white resize-none focus:border-cyan-400 focus:outline-none"
            placeholder="Tempelkan wallet address (satu baris satu address)&#10;Contoh:&#10;0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&#10;0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045&#10;0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE"
            rows="6"
            value={addresses}
            onChange={(e) => setAddresses(e.target.value)}
          ></textarea>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={checkBalances}
              disabled={balanceLoading}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                balanceLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {balanceLoading ? "⏳ Checking..." : "✅ Cek Saldo"}
            </button>
            {balances.length > 0 && (
              <span className="text-sm text-gray-400">
                Total: {balances.length} address(es) checked
              </span>
            )}
          </div>

          {balances.length > 0 && (
            <div className="mt-6 bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-cyan-400 font-semibold">Results - {selectedNetwork}</h3>
                <button
                  onClick={() => setBalances([])}
                  className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                >
                  Clear
                </button>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-cyan-400 border-b border-gray-700">
                    <th className="p-2">#</th>
                    <th className="p-2">Address</th>
                    <th className="p-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((b, i) => (
                    <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="p-2 text-gray-400">{i + 1}</td>
                      <td className="p-2 break-all font-mono text-xs">{b.address}</td>
                      <td className={`p-2 text-right font-semibold ${
                        b.balance.includes('Error') || b.balance.includes('Invalid') 
                          ? 'text-red-400' 
                          : parseFloat(b.balance) > 0 
                          ? 'text-green-400' 
                          : 'text-gray-400'
                      }`}>
                        {b.balance.includes('Error') || b.balance.includes('Invalid') 
                          ? b.balance 
                          : `${b.balance} ${selectedNetwork === 'BSC' ? 'BNB' : selectedNetwork === 'Polygon' ? 'MATIC' : 'ETH'}`
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-xs text-gray-400 text-right">
                Total Balance: {balances
                  .filter(b => !b.balance.includes('Error') && !b.balance.includes('Invalid'))
                  .reduce((sum, b) => sum + parseFloat(b.balance), 0)
                  .toFixed(6)} {selectedNetwork === 'BSC' ? 'BNB' : selectedNetwork === 'Polygon' ? 'MATIC' : 'ETH'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackerPage;
