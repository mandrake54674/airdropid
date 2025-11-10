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
  Menu,
  ChevronLeft,
  Activity,
  Fuel,
  Calculator,
  Newspaper,
  LayoutDashboard,
  Trash2,
  Zap,
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
import MultisendTool from "./components/MultisendTool";

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

const AVAILABLE_TAGS = [
  { id: "defi", label: "DeFi", color: "bg-blue-300" },
  { id: "gamefi", label: "GameFi", color: "bg-purple-300" },
  { id: "layer2", label: "Layer2", color: "bg-green-300" },
  { id: "nft", label: "NFT", color: "bg-pink-300" },
  { id: "meme", label: "Meme", color: "bg-yellow-300" },
  { id: "infra", label: "Infrastructure", color: "bg-cyan-300" },
  { id: "social", label: "SocialFi", color: "bg-orange-300" },
  { id: "bridge", label: "Bridge", color: "bg-indigo-300" },
  { id: "dex", label: "DEX", color: "bg-red-300" },
  { id: "lending", label: "Lending", color: "bg-teal-300" },
];

function TypingTextFixed({ icon, text, speed = 120, pause = 1500 }) {
  const [displayed, setDisplayed] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showCursor, setShowCursor] = React.useState(true);

  React.useEffect(() => {
    setDisplayed("");
    setIndex(0);
    setIsDeleting(false);
  }, [text]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting && index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        setIndex((prev) => prev + 1);
      } else if (isDeleting && index > 0) {
        setDisplayed(text.slice(0, index - 1));
        setIndex((prev) => prev - 1);
      } else if (!isDeleting && index === text.length) {
        setTimeout(() => setIsDeleting(true), pause);
      } else if (isDeleting && index === 0) {
        setIsDeleting(false);
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [index, isDeleting, text, speed, pause]);

  React.useEffect(() => {
    const blink = setInterval(() => setShowCursor((prev) => !prev), 500);
    return () => clearInterval(blink);
  }, []);

  return (
    <span className="inline-flex items-center whitespace-pre">
      <span className="mr-1">{icon}</span>
      {displayed}
      <span
        className="ml-0.5 bg-gray-700"
        style={{
          width: "6px",
          height: "1em",
          opacity: showCursor ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
        }}
      />
    </span>
  );
}




function TrackerPageFullScreen({ onLogout }) {
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

  // State untuk EVM Native & Tokens Balance Checker
  const [evmAddresses, setEvmAddresses] = useState("");
  const [evmBalances, setEvmBalances] = useState([]);
  const [evmBalanceLoading, setEvmBalanceLoading] = useState(false);
  const [customRpcUrl, setCustomRpcUrl] = useState("");
  const [checkType, setCheckType] = useState("native");
  const [tokenContractAddress, setTokenContractAddress] = useState("");

  // State untuk Quick Network Balance Checker
  const [selectedNetwork, setSelectedNetwork] = useState("Ethereum");
  const [quickAddresses, setQuickAddresses] = useState("");
  const [quickBalances, setQuickBalances] = useState([]);
  const [quickBalanceLoading, setQuickBalanceLoading] = useState(false);

  const [selectedTags, setSelectedTags] = useState([]);
  const [filterTag, setFilterTag] = useState("all");
  const [filterDaily, setFilterDaily] = useState("all");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("projects");
  const [isMobile, setIsMobile] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    twitter: "",
    discord: "",
    telegram: "",
    farcaster: "",
    wallet: "",
    email: "",
    github: "",
    website: "",
    notes: "",
    tags: [],
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(GOOGLE_SCRIPT_URL + "?action=read");
      const data = await res.json();
      console.log("Raw data from Google Sheets:", data);

      if (Array.isArray(data)) {
        const parsedData = data.map(project => {
          let parsedTags = [];

          if (project.tags) {
            if (typeof project.tags === 'string') {
              const trimmed = project.tags.trim();
              if (trimmed) {
                try {
                  parsedTags = JSON.parse(trimmed);
                  if (!Array.isArray(parsedTags)) {
                    parsedTags = [parsedTags];
                  }
                } catch (e) {
                  console.error("Failed to parse tags for project:", project.name, "tags value:", project.tags);
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

  const addProject = async () => {
    if (!formData.name) return alert("Nama project wajib diisi!");
    try {
      setLoading(true);
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
          farcaster: "",
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

  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch = (p.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const hasTags = p.tags && Array.isArray(p.tags);
      const matchesTags =
        filterTag === "all" ||
        (hasTags && p.tags.includes(filterTag));

      const matchesDaily =
        filterDaily === "all" ||
        (filterDaily === "checked" && p.daily === "CHECKED") ||
        (filterDaily === "unchecked" && p.daily !== "CHECKED");

      if (filterTag !== "all") {
        console.log(`Project: ${p.name}, Tags: ${JSON.stringify(p.tags)}, FilterTag: ${filterTag}, Matches: ${matchesTags}`);
      }

      return matchesSearch && matchesTags && matchesDaily;
    })
    .sort((a, b) => {
      const A = (a.name || "").toLowerCase();
      const B = (b.name || "").toLowerCase();
      return sortOrder === "asc" ? A.localeCompare(B) : B.localeCompare(A);
    });

  const displayedProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, 3);

  const toggleTag = (tagId) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId];

      setFormData((prevForm) => ({
        ...prevForm,
        tags: newTags,
      }));

      return newTags;
    });
  };

  const checkBalances = async () => {
    const list = quickAddresses.split(/[\n,\s]+/).filter(Boolean);
    if (list.length === 0) return alert("Masukkan address wallet!");

    setQuickBalanceLoading(true);
    setQuickBalances([]);
    const result = [];

    try {
      const provider = new ethers.JsonRpcProvider(NETWORKS[selectedNetwork].rpc);

      for (const addr of list) {
        try {
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
      setQuickBalances(result);
      setQuickBalanceLoading(false);
    }
  };

  const checkEVMBalances = async () => {
    const list = evmAddresses.split(/[\n,\s]+/).filter(Boolean);
    if (list.length === 0) return alert("Masukkan address wallet!");

    if (!customRpcUrl) return alert("Masukkan RPC URL!");

    if (checkType === "token" && !tokenContractAddress) {
      return alert("Masukkan contract address token!");
    }

    setEvmBalanceLoading(true);
    setEvmBalances([]);
    const result = [];

    try {
      const provider = new ethers.JsonRpcProvider(customRpcUrl);

      if (checkType === "native") {
        for (const addr of list) {
          try {
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
      } else if (checkType === "token") {
        if (!ethers.isAddress(tokenContractAddress)) {
          alert("❌ Invalid token contract address!");
          setEvmBalanceLoading(false);
          return;
        }

        const tokenABI = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
          "function symbol() view returns (string)"
        ];

        try {
          const tokenContract = new ethers.Contract(tokenContractAddress, tokenABI, provider);
          const decimals = await tokenContract.decimals();
          const symbol = await tokenContract.symbol();

          for (const addr of list) {
            try {
              if (!ethers.isAddress(addr)) {
                result.push({
                  address: addr,
                  balance: "❌ Invalid Address",
                  symbol: symbol
                });
                continue;
              }

              const checksumAddr = ethers.getAddress(addr);
              const bal = await tokenContract.balanceOf(checksumAddr);
              const formattedBalance = parseFloat(ethers.formatUnits(bal, decimals)).toFixed(6);

              result.push({
                address: checksumAddr,
                balance: formattedBalance,
                symbol: symbol
              });
            } catch (err) {
              console.error(`Error checking ${addr}:`, err);
              result.push({
                address: addr,
                balance: "❌ Error",
                symbol: symbol
              });
            }
          }
        } catch (err) {
          console.error("Token contract error:", err);
          alert("⚠️ Gagal membaca token contract. Pastikan contract address benar!");
          setEvmBalanceLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Provider error:", err);
      alert("⚠️ Gagal terhubung ke RPC URL. Pastikan URL benar dan mendukung jaringan EVM!");
    } finally {
      setEvmBalances(result);
      setEvmBalanceLoading(false);
    }
  };

  const sidebarMenuItems = [
    { id: "projects", label: "Projects", icon: LayoutDashboard, color: "text-blue-600" },
    { id: "trading", label: "Trading", icon: Zap, color: "text-green-600" },
    { id: "analytics", label: "Analytics", icon: Activity, color: "text-purple-600" },
    { id: "gas", label: "Gas Tracker", icon: Fuel, color: "text-orange-600" },
    { id: "roi", label: "ROI Calculator", icon: Calculator, color: "text-teal-600" },
    { id: "news", label: "News Feed", icon: Newspaper, color: "text-yellow-700" },
    { id: "balance", label: "Balance Checker", icon: Wallet, color: "text-indigo-600" },
    { id: "multisend", label: "Multisend", icon: Send, color: "text-pink-600" },
  ];

  return (
    <div className="min-h-screen text-gray-800 relative overflow-hidden bg-[#e0e5ec]">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#e0e5ec] z-50 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0"
        } ${isMobile ? "shadow-[20px_20px_40px_rgba(163,177,198,0.5),-20px_-20px_40px_rgba(255,255,255,0.8)]" : ""}`}
        style={{
          boxShadow: sidebarOpen ? '20px 0 40px rgba(163,177,198,0.3)' : 'none'
        }}
      >
        {sidebarOpen && (
          <div className="h-full flex flex-col">
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                🚀 Airdrop Tracker
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 hover:text-gray-800 transition lg:hidden rounded-lg p-2"
                style={{
                  boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                }}
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {sidebarMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out ${
                      activeView === item.id
                        ? "text-gray-800 font-semibold"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    style={
                      activeView === item.id
                        ? {
                            boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                            background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)'
                          }
                        : {
                            boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
                          }
                    }
                  >
                    <Icon size={20} className={activeView === item.id ? item.color : ""} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition text-red-700 hover:text-red-800"
                style={{
                  boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-3 left-3 z-50 flex items-center justify-center w-10 h-10 rounded-full transition text-gray-700 hover:text-gray-900"
          style={{
            background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
            boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.6)'
          }}
        >
          <Menu size={22} />
        </button>
      )}



      <div
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen && !isMobile ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
<div className="sticky top-0 z-30 bg-[#e0e5ec] px-5 md:px-6 py-3 md:py-4 rounded-b-2xl"
          style={{
            boxShadow: '0 8px 16px rgba(163,177,198,0.4)'
          }}
        >
          <div className="flex flex-wrap justify-between items-center gap-3 md:gap-4">
<h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 min-h-[1.5em] pl-12 sm:pl-0">
  {activeView === "projects" && (
    <TypingTextFixed key="projects" icon="📦" text="My Projects" />
  )}
  {activeView === "trading" && (
    <TypingTextFixed key="trading" icon="⚡" text="DeDoo Trading Platform" />
  )}
  {activeView === "analytics" && (
    <TypingTextFixed key="analytics" icon="📊" text="Analytics Dashboard" />
  )}
  {activeView === "gas" && (
    <TypingTextFixed key="gas" icon="⛽" text="Gas Tracker" />
  )}
  {activeView === "roi" && (
    <TypingTextFixed key="roi" icon="💹" text="ROI Calculator" />
  )}
  {activeView === "news" && (
    <TypingTextFixed key="news" icon="📰" text="News Feed" />
  )}
  {activeView === "balance" && (
    <TypingTextFixed key="balance" icon="💰" text="Balance Checker" />
  )}
  {activeView === "multisend" && (
    <TypingTextFixed key="multisend" icon="🚀" text="Multisend Native & Tokens" />
  )}
</h1>






            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              {activeView === "projects" && (
                <>
                  <div className="relative">
                    <button className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition text-xs md:text-sm text-gray-700"
                      style={{
                        boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                      }}
                    >
                      <Tag size={14} />
                      <select
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        className="bg-transparent text-gray-800 outline-none cursor-pointer border-none appearance-none pr-2 font-medium"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      >
                        <option value="all" className="bg-white text-gray-800">All Tags</option>
                        {AVAILABLE_TAGS.map((tag) => (
                          <option key={tag.id} value={tag.id} className="bg-white text-gray-800">
                            {tag.label}
                          </option>
                        ))}
                      </select>
                    </button>
                  </div>

                  <div className="relative">
                    <button className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-xl transition text-xs md:text-sm text-gray-700"
                      style={{
                        boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                      }}
                    >
                      <CheckSquare size={14} />
                      <select
                        value={filterDaily}
                        onChange={(e) => setFilterDaily(e.target.value)}
                        className="bg-transparent text-gray-800 outline-none cursor-pointer border-none appearance-none pr-2 font-medium"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      >
                        <option value="all" className="bg-white text-gray-800">All Projects</option>
                        <option value="checked" className="bg-white text-gray-800">✅ Daily Checked</option>
                        <option value="unchecked" className="bg-white text-gray-800">⬜ Daily Unchecked</option>
                      </select>
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="🔍 Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-2 md:px-3 py-1.5 md:py-2 rounded-xl bg-[#e0e5ec] text-gray-800 w-28 md:w-48 text-xs md:text-sm"
                    style={{
                      boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                    }}
                  />

                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm text-gray-700"
                    style={{
                      boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                    }}
                  >
                    <ArrowUpDown size={14} />
                    <span className="hidden sm:inline">{sortOrder === "asc" ? "A-Z" : "Z-A"}</span>
                  </button>

                  <button
                    onClick={() => setHideData(!hideData)}
                    className="px-2 md:px-3 py-1.5 md:py-2 rounded-xl flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-700"
                    style={{
                      boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                    }}
                  >
                    {hideData ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {activeView === "trading" && (
            <div className="max-w-full mx-auto space-y-6">
              {/* HEADER BESAR */}
              <div className="text-center py-8 rounded-3xl"
                style={{
                  background: '#e0e5ec',
                  boxShadow: '12px 12px 24px rgba(163,177,198,0.6), -12px -12px 24px rgba(255,255,255,0.5)'
                }}
              >
                <div className="flex items-center justify-center gap-4 mb-3">
                  <Zap className="text-green-600" size={48} />
                  <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600">
                    DeDoo Trading Platform
                  </h2>
                </div>
                <p className="text-gray-700 text-lg">
                  Trade crypto with lightning speed & zero fees
                </p>
              </div>

              {/* 3 FEATURE CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl transition-all"
                  style={{
                    background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
                    boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
                  }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-xl"
                      style={{
                        boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)'
                      }}
                    >
                      <Zap className="text-green-600" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-green-700">Lightning Fast</h3>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed">
                    Execute trades in milliseconds with our optimized engine
                  </p>
                </div>

                <div className="p-6 rounded-2xl transition-all"
                  style={{
                    background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
                    boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
                  }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-xl"
                      style={{
                        boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)'
                      }}
                    >
                      <Wallet className="text-blue-600" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-blue-700">Low Fees</h3>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed">
                    Trade with minimal fees and maximum profit potential
                  </p>
                </div>

                <div className="p-6 rounded-2xl transition-all"
                  style={{
                    background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
                    boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
                  }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 rounded-xl"
                      style={{
                        boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)'
                      }}
                    >
                      <Activity className="text-purple-600" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-purple-700">Real-time Data</h3>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed">
                    Get live market data and advanced trading charts
                  </p>
                </div>
              </div>

              {/* IFRAME CONTAINER */}
              <div className="p-6 rounded-3xl"
                style={{
                  background: '#e0e5ec',
                  boxShadow: '12px 12px 24px rgba(163,177,198,0.6), -12px -12px 24px rgba(255,255,255,0.5)'
                }}
              >
                <div className="relative w-full" style={{ height: 'calc(100vh - 450px)', minHeight: '650px' }}>
                  <div className="absolute inset-0 rounded-2xl overflow-hidden"
                    style={{
                      boxShadow: 'inset 6px 6px 12px rgba(163,177,198,0.4), inset -6px -6px 12px rgba(255,255,255,0.3)'
                    }}
                  >
                    <iframe
                      src="https://trade.dedoo.xyz/"
                      className="w-full h-full"
                      title="DeDoo Trading Platform"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* OPEN IN NEW TAB BUTTON */}
                <div className="mt-6 flex items-center justify-center">
                  <a
                    href="https://trade.dedoo.xyz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-8 py-3 rounded-xl font-semibold text-white transition-all transform hover:scale-105"
                    style={{
                      background: 'linear-gradient(145deg, #3b82f6, #8b5cf6)',
                      boxShadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'
                    }}
                  >
                    <Globe size={20} />
                    <span>Open in New Tab</span>
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeView === "projects" && (
            <div className="space-y-8">
              <div className="p-4 md:p-6 rounded-2xl"
                style={{
                  background: '#e0e5ec',
                  boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
                }}
              >
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-blue-700">
                  ➕ Tambah Project Baru
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {["name", "twitter", "discord", "telegram", "farcaster", "wallet", "email", "github", "website"].map(
                    (field) => (
                      <input
                        key={field}
                        type="text"
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={formData[field]}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        className="p-2 md:p-3 text-sm md:text-base rounded-lg bg-[#e0e5ec] text-gray-800 w-full"
                        style={{
                          boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                        }}
                      />
                    )
                  )}
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <StickyNote size={16} />
                    Notes
                  </label>
                  <textarea
                    placeholder="Add notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-2 rounded-lg bg-[#e0e5ec] text-gray-800 resize-none"
                    style={{
                      boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                    }}
                    rows="2"
                  ></textarea>
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Tag size={16} />
                    Select Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          selectedTags.includes(tag.id) || (formData.tags && formData.tags.includes(tag.id))
                            ? `${tag.color} text-gray-800 shadow-inner`
                            : "text-gray-600"
                        }`}
                        style={
                          selectedTags.includes(tag.id) || (formData.tags && formData.tags.includes(tag.id))
                            ? {
                                boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.5), inset -3px -3px 6px rgba(255,255,255,0.3)'
                              }
                            : {
                                boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                              }
                        }
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={addProject}
                  disabled={loading}
                  className={`mt-4 px-6 py-2 rounded-lg font-semibold transition-all ${
                    loading
                      ? "text-gray-500 cursor-not-allowed"
                      : "text-green-700 hover:text-green-800"
                  }`}
                  style={{
                    boxShadow: loading 
                      ? 'inset 4px 4px 8px rgba(163,177,198,0.4)' 
                      : '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
                  }}
                >
                  {loading ? "Loading..." : "+ Tambah Project"}
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                {displayedProjects.map((p, i) => (
                  <div
  key={i}
  className="group relative p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm rounded-2xl"
  style={{
    background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
    boxShadow:
      '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)',
  }}
>
  <div className="flex justify-between items-start mb-3">
    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 pr-10">
      {p.name}
    </h3>
    <div className="flex gap-2">
      <button
        onClick={() => toggleDaily(p.name, p.daily)}
        className={`p-2 rounded-lg transition-all duration-200 ${
          p.daily === 'CHECKED' ? 'text-blue-600' : 'text-gray-500'
        }`}
        style={{
          boxShadow:
            p.daily === 'CHECKED'
              ? 'inset 3px 3px 6px rgba(163,177,198,0.5)'
              : '3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255,0.6)',
        }}
      >
        {p.daily === 'CHECKED' ? <CheckSquare size={16} /> : <Square size={16} />}
      </button>
      <button
        onClick={() => deleteProject(p.name)}
        className="p-2 rounded-lg text-red-600 hover:text-red-700 transition-all duration-200"
        style={{
          boxShadow:
            '3px 3px 6px rgba(163,177,198,0.4), -3px -3px 6px rgba(255,255,255,0.6)',
        }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>

  {p.tags?.length > 0 && (
    <div className="flex flex-wrap gap-2 mb-3">
      {p.tags.map((tagId) => {
        const tag = AVAILABLE_TAGS.find((t) => t.id === tagId);
        return (
          <span
            key={tagId}
            className={`${tag?.color || ''} text-gray-800 text-xs px-2.5 py-0.5 rounded-full font-semibold`}
            style={{
              boxShadow:
                'inset 2px 2px 4px rgba(163,177,198,0.4), inset -2px -2px 4px rgba(255,255,255,0.5)',
            }}
          >
            {tag?.label}
          </span>
        );
      })}
    </div>
  )}

  {p.notes && (
    <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 shadow-inner">
      <p className="flex items-start gap-2 text-sm text-gray-700">
        <StickyNote size={14} className="mt-0.5 text-yellow-700 flex-shrink-0" />
        <span className="italic leading-relaxed">{p.notes}</span>
      </p>
    </div>
  )}

  <div className="space-y-1.5"> {/* ← Kunci: rapatkan jarak antar elemen */}
    {p.twitter && (
      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
        <Twitter size={14} className="text-blue-600" />
        <span className="text-sm text-gray-700 font-mono truncate">{hideData ? '••••••' : p.twitter}</span>
      </div>
    )}
    {p.discord && (
      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
        <MessageCircle size={14} className="text-indigo-600" />
        <span className="text-sm text-gray-700 font-mono truncate">{hideData ? '••••••' : p.discord}</span>
      </div>
    )}
    {p.telegram && (
      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
        <Send size={14} className="text-sky-600" />
        <span className="text-sm text-gray-700 font-mono truncate">{hideData ? '••••••' : p.telegram}</span>
      </div>
    )}
    {p.farcaster && (
      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
        <Zap size={14} className="text-purple-600" />
        <span className="text-sm text-gray-700 font-mono truncate">{hideData ? '••••••' : p.farcaster}</span>
      </div>
    )}
    {p.wallet && (
      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
        <Wallet size={14} className="text-yellow-700" />
        <span className="text-xs text-gray-700 font-mono break-all">{hideData ? '••••••••••••••' : p.wallet}</span>
      </div>
    )}
    {p.email && (
      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
        <Mail size={14} className="text-pink-600" />
        <span className="text-sm text-gray-700 font-mono truncate">{hideData ? '••••••' : p.email}</span>
      </div>
    )}
    {p.website && (
      <div className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/30 transition-colors duration-150">
        <Globe size={14} className="text-blue-600" />
        <a
          href={p.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 underline truncate transition-colors"
        >
          {p.website}
        </a>
      </div>
    )}
  </div>

  {/* Efek glowing lembut */}
  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg pointer-events-none"
    style={{ background: 'radial-gradient(circle at center, rgba(147,197,253,0.25), transparent 70%)' }}
  ></div>
</div>
))}     {/* ✅ penutup untuk .map */}
</div>  {/* ✅ penutup untuk flex-wrap container */}

              {filteredProjects.length > 3 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-6 py-2 rounded-lg font-semibold transition text-blue-700 hover:text-blue-800"
                    style={{
                      boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
                    }}
                  >
                    {showAll ? "⬆️ Show Less" : "⬇️ Show More"}
                  </button>
                </div>
              )}

              <div className="p-6 rounded-2xl"
                style={{
                  background: '#e0e5ec',
                  boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
                }}
              >
                <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  📈 Live Crypto Market
                </h2>

                <div className="text-center mb-4">
                  <p className="text-gray-600 text-sm mb-2">
                    ⏱️ Auto-refresh in <span className="text-blue-700 font-semibold">{timer}s</span>
                  </p>
                  <div className="w-64 mx-auto h-2 rounded-full overflow-hidden"
                    style={{
                      background: '#e0e5ec',
                      boxShadow: 'inset 2px 2px 4px rgba(163,177,198,0.6), inset -2px -2px 4px rgba(255,255,255,0.5)'
                    }}
                  >
                    <div
                      className="h-full transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: progressColor }}
                    ></div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {coins.map((coin) => (
                    <div key={coin.id} className="p-4 rounded-xl transition-all"
                      style={{
                        background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
                        boxShadow: '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                          <span className="font-semibold text-gray-800">{coin.name}</span>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            coin.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2 text-sm font-semibold">
                        ${coin.current_price.toLocaleString()}
                      </p>
                      <ResponsiveContainer width="100%" height={60}>
                        <LineChart data={coin.sparkline_in_7d.price.map((p, i) => ({ i, p }))}>
                          <Line
                            type="monotone"
                            dataKey="p"
                            stroke={
                              coin.price_change_percentage_24h >= 0
                                ? "#16a34a"
                                : "#dc2626"
                            }
                            dot={false}
                            strokeWidth={2}
                          />
                          <XAxis hide />
                          <YAxis hide domain={["auto", "auto"]} />
                          <Tooltip
                            contentStyle={{
                              background: "#e0e5ec",
                              border: "none",
                              color: "#1f2937",
                              borderRadius: "8px",
                              boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeView === "balance" && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* EVM Native & Tokens Balance Checker */}
              <div className="p-6 rounded-2xl"
                style={{
                  background: '#e0e5ec',
                  boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
                }}
              >
                <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  🔷 EVM Native & Tokens Balance Checker
                </h2>

                <div className="space-y-4">
                  {/* RPC URL Input */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">Input RPC URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://1.rpc.thirdweb.com"
                      value={customRpcUrl}
                      onChange={(e) => setCustomRpcUrl(e.target.value)}
                      className="w-full bg-[#e0e5ec] p-3 rounded-lg text-gray-800"
                      style={{
                        boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                      }}
                    />
                  </div>

                  {/* Check Type Dropdown */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">Select Check Type</label>
                    <select
                      value={checkType}
                      onChange={(e) => {
                        setCheckType(e.target.value);
                        setEvmBalances([]);
                      }}
                      className="w-full bg-[#e0e5ec] p-3 rounded-lg text-gray-800 cursor-pointer font-medium"
                      style={{
                        boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                      }}
                    >
                      <option value="native">Check Native Balance</option>
                      <option value="token">Check Token Balance</option>
                    </select>
                  </div>

                  {/* Token Contract Address (only show if checkType is token) */}
                  {checkType === "token" ? (
                    <div>
                      <label className="block text-sm text-gray-600 mb-2 font-medium">Token Contract Address</label>
                      <input
                        type="text"
                        placeholder="0xabc...def"
                        value={tokenContractAddress}
                        onChange={(e) => setTokenContractAddress(e.target.value)}
                        className="w-full bg-[#e0e5ec] p-3 rounded-lg text-gray-800"
                        style={{
                          boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                        }}
                      />
                    </div>
                  ) : null}

                  {/* Wallet Addresses Input */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2 font-medium">Wallet Addresses (one per line)</label>
                    <textarea
                      className="w-full bg-[#e0e5ec] p-3 rounded-lg text-gray-800 resize-none"
                      style={{
                        boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                      }}
                      placeholder="Paste wallet addresses (one per line)&#10;Example:&#10;0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&#10;0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
                      rows="6"
                      value={evmAddresses}
                      onChange={(e) => setEvmAddresses(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Check Balance Button */}
                  <button
                    onClick={checkEVMBalances}
                    disabled={evmBalanceLoading}
                    className={`w-full py-3 rounded-lg font-semibold text-lg transition ${
                      evmBalanceLoading
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-blue-700 hover:text-blue-800"
                    }`}
                    style={{
                      boxShadow: evmBalanceLoading
                        ? 'inset 4px 4px 8px rgba(163,177,198,0.6)'
                        : '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'
                    }}
                  >
                    {evmBalanceLoading ? "⏳ Checking..." : "Check Balance"}
                  </button>
                </div>

                {/* Results Table */}
                {evmBalances.length > 0 && (
                  <div className="mt-6 rounded-lg p-4"
                    style={{
                      background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
                      boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)'
                    }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-blue-700 font-semibold">
                        Results - {checkType === "native" ? "Native Balance" : "Token Balance"}
                      </h3>
                      <button
                        onClick={() => setEvmBalances([])}
                        className="text-xs text-white px-3 py-1 rounded"
                        style={{
                          background: 'linear-gradient(145deg, #dc2626, #ef4444)',
                          boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                        }}
                      >
                        Clear
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-blue-700 border-b border-gray-300">
                            <th className="p-2">#</th>
                            <th className="p-2">Address</th>
                            <th className="p-2 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {evmBalances.map((b, i) => (
                            <tr key={i} className="border-b border-gray-300">
                              <td className="p-2 text-gray-600">{i + 1}</td>
                              <td className="p-2 break-all font-mono text-xs text-gray-700">{b.address}</td>
                              <td className={`p-2 text-right font-semibold ${
                                b.balance.includes('Error') || b.balance.includes('Invalid')
                                  ? 'text-red-600'
                                  : parseFloat(b.balance) > 0
                                  ? 'text-green-600'
                                  : 'text-gray-600'
                              }`}>
                                {b.balance.includes('Error') || b.balance.includes('Invalid')
                                  ? b.balance
                                  : checkType === "token"
                                  ? `${b.balance} ${b.symbol || 'TOKEN'}`
                                  : `${b.balance} Native`
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {checkType === "native" && (
                      <div className="mt-3 text-xs text-gray-600 text-right font-medium">
                        Total Balance: {evmBalances
                          .filter(b => !b.balance.includes('Error') && !b.balance.includes('Invalid'))
                          .reduce((sum, b) => sum + parseFloat(b.balance), 0)
                          .toFixed(6)} Native
                      </div>
                    )}
                    {checkType === "token" && evmBalances[0]?.symbol && (
                      <div className="mt-3 text-xs text-gray-600 text-right font-medium">
                        Total Balance: {evmBalances
                          .filter(b => !b.balance.includes('Error') && !b.balance.includes('Invalid'))
                          .reduce((sum, b) => sum + parseFloat(b.balance), 0)
                          .toFixed(6)} {evmBalances[0].symbol}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Default Network Balance Checker */}
              <div className="p-6 rounded-2xl"
                style={{
                  background: '#e0e5ec',
                  boxShadow: '10px 10px 20px rgba(163,177,198,0.6), -10px -10px 20px rgba(255,255,255,0.5)'
                }}
              >
                <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  💰 Quick Network Balance Checker
                </h2>

                <div className="flex flex-wrap justify-center gap-3 mb-4">
                  {Object.keys(NETWORKS).map((net) => (
                    <button
                      key={net}
                      onClick={() => setSelectedNetwork(net)}
                      className={`px-4 py-2 rounded-lg text-sm md:text-base transition font-medium ${
                        selectedNetwork === net
                          ? "text-blue-700"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                      style={
                        selectedNetwork === net
                          ? {
                              boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.6), inset -4px -4px 8px rgba(255,255,255,0.5)'
                            }
                          : {
                              boxShadow: '6px 6px 12px rgba(163,177,198,0.6), -6px -6px 12px rgba(255,255,255,0.5)'
                            }
                      }
                    >
                      {net}
                    </button>
                  ))}
                </div>

                <textarea
                  className="w-full bg-[#e0e5ec] p-3 rounded-lg text-gray-800 resize-none"
                  style={{
                    boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)'
                  }}
                  placeholder="Paste wallet addresses (one per line)&#10;Example:&#10;0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&#10;0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
                  rows="8"
                  value={quickAddresses}
                  onChange={(e) => setQuickAddresses(e.target.value)}
                ></textarea>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                  <button
                    onClick={checkBalances}
                    disabled={quickBalanceLoading}
                    className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition ${
                      quickBalanceLoading
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-green-700 hover:text-green-800"
                    }`}
                    style={{
                      boxShadow: quickBalanceLoading
                        ? 'inset 4px 4px 8px rgba(163,177,198,0.6)'
                        : '8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.5)'
                    }}
                  >
                    {quickBalanceLoading ? "⏳ Checking..." : "✅ Check Balance"}
                  </button>
                  {quickBalances.length > 0 && (
                    <span className="text-sm text-gray-600 font-medium">
                      Total: {quickBalances.length} address(es) checked
                    </span>
                  )}
                </div>

                {quickBalances.length > 0 && (
                  <div className="mt-6 rounded-lg p-4"
                    style={{
                      background: 'linear-gradient(145deg, #d1d6dd, #ecf0f3)',
                      boxShadow: 'inset 4px 4px 8px rgba(163,177,198,0.4), inset -4px -4px 8px rgba(255,255,255,0.5)'
                    }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-blue-700 font-semibold">Results - {selectedNetwork}</h3>
                      <button
                        onClick={() => setQuickBalances([])}
                        className="text-xs text-white px-3 py-1 rounded"
                        style={{
                          background: 'linear-gradient(145deg, #dc2626, #ef4444)',
                          boxShadow: '4px 4px 8px rgba(163,177,198,0.6), -4px -4px 8px rgba(255,255,255,0.5)'
                        }}
                      >
                        Clear
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-blue-700 border-b border-gray-300">
                            <th className="p-2">#</th>
                            <th className="p-2">Address</th>
                            <th className="p-2 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quickBalances.map((b, i) => (
                            <tr key={i} className="border-b border-gray-300">
                              <td className="p-2 text-gray-600">{i + 1}</td>
                              <td className="p-2 break-all font-mono text-xs text-gray-700">{b.address}</td>
                              <td className={`p-2 text-right font-semibold ${
                                b.balance.includes('Error') || b.balance.includes('Invalid')
                                  ? 'text-red-600'
                                  : parseFloat(b.balance) > 0
                                  ? 'text-green-600'
                                  : 'text-gray-600'
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
                    </div>
                    <div className="mt-3 text-xs text-gray-600 text-right font-medium">
                      Total Balance: {quickBalances
                        .filter(b => !b.balance.includes('Error') && !b.balance.includes('Invalid'))
                        .reduce((sum, b) => sum + parseFloat(b.balance), 0)
                        .toFixed(6)} {selectedNetwork === 'BSC' ? 'BNB' : selectedNetwork === 'Polygon' ? 'MATIC' : 'ETH'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === "analytics" && (
            <div className="max-w-7xl mx-auto">
              <AnalyticsDashboard
                projects={projects}
                balances={quickBalances}
                selectedNetwork={selectedNetwork}
              />
            </div>
          )}

          {activeView === "gas" && (
            <div className="max-w-7xl mx-auto">
              <GasTracker />
            </div>
          )}

          {activeView === "roi" && (
            <div className="max-w-7xl mx-auto">
              <ROICalculator />
            </div>
          )}

          {activeView === "news" && (
            <div className="max-w-7xl mx-auto">
              <NewsAggregator />
            </div>
          )}

          {activeView === "multisend" && (
            <div className="max-w-7xl mx-auto">
              <MultisendTool />
            </div>
          )}
        </div>
      </div>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default TrackerPageFullScreen;


