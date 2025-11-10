import React, { useState, useEffect, useCallback } from "react";
import {
  Newspaper,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Filter,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const NewsAggregator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [news, setNews] = useState([]);
  const [apiNews, setApiNews] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    source: "",
    category: "defi",
    url: "",
  });

  const categories = [
    { id: "all", label: "All", color: "bg-gray-700" },
    { id: "defi", label: "DeFi", color: "bg-blue-400" },
    { id: "gamefi", label: "GameFi", color: "bg-purple-400" },
    { id: "layer2", label: "Layer2", color: "bg-green-400" },
    { id: "nft", label: "NFT", color: "bg-pink-400" },
    { id: "bridge", label: "Bridge", color: "bg-indigo-400" },
    { id: "socialfi", label: "SocialFi", color: "bg-orange-400" },
    { id: "airdrop", label: "Airdrop", color: "bg-yellow-400" },
  ];

  // ==== Fetch News ====
  const fetchCryptoNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "https://min-api.cryptocompare.com/data/v2/news/?lang=EN",
        { timeout: 10000 }
      );

      if (response.data && response.data.Data) {
        const transformedNews = response.data.Data.slice(0, 20).map(
          (item, index) => ({
            id: `api-${item.id || Date.now() + index}`,
            title: item.title || "No Title",
            description: item.body || "No description available",
            source: item.source || "CryptoCompare",
            category: detectCategory(
              item.title +
                " " +
                (item.body || "") +
                " " +
                (item.categories || "")
            ),
            url: item.url || item.guid || "#",
            sentiment: analyzeSentiment(
              item.title + " " + (item.body || "")
            ),
            votes: 0,
            timestamp: new Date(item.published_on * 1000).toISOString(),
            isFromApi: true,
            imageurl: item.imageurl || null,
          })
        );

        setApiNews(transformedNews);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Error fetching crypto news:", err);
      setError("⚠️ Failed to fetch latest news. Showing sample data.");
      if (apiNews.length === 0) setApiNews(getSampleNews());
    } finally {
      setIsLoading(false);
    }
  }, [apiNews.length]);

  // === Analisis kategori dan sentimen ===
  const detectCategory = (text) => {
    const lower = text.toLowerCase();
    if (lower.match(/airdrop|snapshot|reward/)) return "airdrop";
    if (lower.match(/defi|liquidity|yield/)) return "defi";
    if (lower.match(/game|p2e|metaverse/)) return "gamefi";
    if (lower.match(/layer 2|rollup|zk|optimistic/)) return "layer2";
    if (lower.match(/nft|collectible/)) return "nft";
    if (lower.match(/bridge|cross-chain/)) return "bridge";
    if (lower.match(/social|community|dao/)) return "socialfi";
    return "defi";
  };

  const analyzeSentiment = (text) => {
    const bull = ["gain", "bullish", "up", "reward", "launch"];
    const bear = ["down", "hack", "loss", "bearish", "drop"];
    const t = text.toLowerCase();
    const bullCount = bull.filter((w) => t.includes(w)).length;
    const bearCount = bear.filter((w) => t.includes(w)).length;
    if (bullCount > bearCount) return "bullish";
    if (bearCount > bullCount) return "bearish";
    return "neutral";
  };

  const getSampleNews = () => [
    {
      id: "sample-1",
      title: "Major L2 Protocol Announces Airdrop Snapshot",
      description:
        "Layer 2 solution confirms airdrop snapshot for early users.",
      source: "CryptoNews",
      category: "airdrop",
      url: "#",
      sentiment: "bullish",
      votes: 45,
      timestamp: new Date().toISOString(),
      isFromApi: true,
    },
  ];

  // === useEffect ===
  useEffect(() => {
    const saved = localStorage.getItem("airdrop_news_manual");
    if (saved) setNews(JSON.parse(saved));
  }, []);

  useEffect(() => {
    fetchCryptoNews();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchCryptoNews, 10 * 60 * 1000);
    }
    return () => interval && clearInterval(interval);
  }, [autoRefresh, fetchCryptoNews]);

  // === Header UI ===
  return (
    <div className="relative z-10 w-full mb-8 fade-in bg-[#E3E8EF] rounded-3xl shadow-[9px_9px_16px_#C8D0DA,-9px_-9px_16px_#FFFFFF] transition-all duration-300">
      <div className="p-5 flex justify-between items-center flex-wrap gap-3 rounded-t-3xl bg-[#E3E8EF] shadow-[inset_5px_5px_10px_#C8D0DA,inset_-5px_-5px_10px_#FFFFFF]">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
            <Newspaper size={28} className="text-blue-500" />
            🤖 Airdrop News Aggregator
          </h2>
          {isLoading && (
            <RefreshCw size={20} className="text-blue-400 animate-spin" />
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {lastUpdate && (
            <div className="flex items-center gap-2 text-gray-600 text-sm px-3 py-1 rounded-full shadow-[inset_3px_3px_6px_#C8D0DA,inset_-3px_-3px_6px_#FFFFFF]">
              <Clock size={16} />
              <span>
                Updated {Math.floor((new Date() - lastUpdate) / 60000)}m ago
              </span>
            </div>
          )}

          <button
            onClick={fetchCryptoNews}
            disabled={isLoading}
            className="px-4 py-2 rounded-full text-gray-700 bg-[#E3E8EF] shadow-[6px_6px_12px_#C8D0DA,-6px_-6px_12px_#FFFFFF] hover:shadow-[inset_4px_4px_8px_#C8D0DA,inset_-4px_-4px_8px_#FFFFFF] transition"
          >
            <RefreshCw
              size={16}
              className={`inline-block mr-1 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>

          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-full text-gray-700 transition ${
              autoRefresh
                ? "shadow-[6px_6px_12px_#C8D0DA,-6px_-6px_12px_#FFFFFF]"
                : "shadow-[inset_4px_4px_8px_#C8D0DA,inset_-4px_-4px_8px_#FFFFFF]"
            }`}
          >
            Auto: {autoRefresh ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 rounded-full text-gray-700 shadow-[6px_6px_12px_#C8D0DA,-6px_-6px_12px_#FFFFFF] hover:shadow-[inset_4px_4px_8px_#C8D0DA,inset_-4px_-4px_8px_#FFFFFF] flex items-center gap-2"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            {isExpanded ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4">
          <div className="p-3 text-gray-700 flex items-center gap-2 rounded-xl bg-[#E3E8EF] shadow-[inset_6px_6px_12px_#C8D0DA,inset_-6px_-6px_12px_#FFFFFF]">
            <AlertCircle size={18} className="text-yellow-600" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="p-6 rounded-b-3xl bg-[#E3E8EF] shadow-[inset_6px_6px_12px_#C8D0DA,inset_-6px_-6px_12px_#FFFFFF] space-y-6">
          {/* === Filter & Sort === */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-600" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#E3E8EF] text-gray-700 shadow-[inset_5px_5px_10px_#C8D0DA,inset_-5px_-5px_10px_#FFFFFF] focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#E3E8EF] text-gray-700 shadow-[inset_5px_5px_10px_#C8D0DA,inset_-5px_-5px_10px_#FFFFFF] focus:outline-none"
              >
                <option value="trending">Trending</option>
                <option value="latest">Latest</option>
                <option value="bullish">Most Bullish</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="ml-auto px-4 py-2 rounded-full text-gray-700 bg-[#E3E8EF] shadow-[6px_6px_12px_#C8D0DA,-6px_-6px_12px_#FFFFFF] hover:shadow-[inset_4px_4px_8px_#C8D0DA,inset_-4px_-4px_8px_#FFFFFF] flex items-center gap-2 transition"
            >
              {showAddForm ? (
                <>
                  <X size={16} /> Cancel
                </>
              ) : (
                <>
                  <Plus size={16} /> Add News
                </>
              )}
            </button>
          </div>

          {/* === Add Form === */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl p-5 bg-[#E3E8EF] shadow-[inset_8px_8px_16px_#C8D0DA,inset_-8px_-8px_16px_#FFFFFF]"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!formData.title || !formData.url) return;
                    const newItem = {
                      id: Date.now(),
                      ...formData,
                      sentiment: analyzeSentiment(formData.title),
                      votes: 0,
                      timestamp: new Date().toISOString(),
                      isFromApi: false,
                    };
                    const updated = [newItem, ...news];
                    setNews(updated);
                    localStorage.setItem(
                      "airdrop_news_manual",
                      JSON.stringify(updated)
                    );
                    setFormData({
                      title: "",
                      description: "",
                      source: "",
                      category: "defi",
                      url: "",
                    });
                    setShowAddForm(false);
                  }}
                  className="grid gap-4"
                >
                  <input
                    placeholder="Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="px-4 py-2 rounded-xl text-gray-700 bg-[#E3E8EF] shadow-[inset_5px_5px_10px_#C8D0DA,inset_-5px_-5px_10px_#FFFFFF] focus:outline-none"
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="px-4 py-2 rounded-xl text-gray-700 bg-[#E3E8EF] shadow-[inset_5px_5px_10px_#C8D0DA,inset_-5px_-5px_10px_#FFFFFF] focus:outline-none"
                  />
                  <input
                    placeholder="Source"
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                    className="px-4 py-2 rounded-xl text-gray-700 bg-[#E3E8EF] shadow-[inset_5px_5px_10px_#C8D0DA,inset_-5px_-5px_10px_#FFFFFF] focus:outline-none"
                  />
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="px-4 py-2 rounded-xl text-gray-700 bg-[#E3E8EF] shadow-[inset_5px_5px_10px_#C8D0DA,inset_-5px_-5px_10px_#FFFFFF]"
                  >
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                  <input
                    placeholder="URL"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    className="px-4 py-2 rounded-xl text-gray-700 bg-[#E3E8EF] shadow-[inset_5px_5px_10px_#C8D0DA,inset_-5px_-5px_10px_#FFFFFF] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full text-gray-700 bg-[#E3E8EF] shadow-[6px_6px_12px_#C8D0DA,-6px_-6px_12px_#FFFFFF] hover:shadow-[inset_4px_4px_8px_#C8D0DA,inset_-4px_-4px_8px_#FFFFFF]"
                  >
                    Add News
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* === List === */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...news,
              ...apiNews.filter(
                (n) =>
                  filterCategory === "all" || n.category === filterCategory
              ),
            ]
              .sort((a, b) => {
                if (sortBy === "latest")
                  return new Date(b.timestamp) - new Date(a.timestamp);
                if (sortBy === "bullish")
                  return (
                    (b.sentiment === "bullish") -
                    (a.sentiment === "bullish")
                  );
                return b.votes - a.votes;
              })
              .map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -3 }}
                  className="rounded-3xl p-5 bg-[#E3E8EF] shadow-[9px_9px_16px_#C8D0DA,-9px_-9px_16px_#FFFFFF] transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs text-white ${
                        categories.find((c) => c.id === item.category)?.color
                      }`}
                    >
                      {item.category.toUpperCase()}
                    </span>
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink size={14} /> Source
                    </a>
                    <div className="flex gap-2 text-gray-600">
                      <button
                        onClick={() => {
                          const all = [...news, ...apiNews];
                          const updated = all.map((n) =>
                            n.id === item.id
                              ? { ...n, votes: (n.votes || 0) + 1 }
                              : n
                          );
                          setApiNews(updated.filter((n) => n.isFromApi));
                          setNews(updated.filter((n) => !n.isFromApi));
                        }}
                      >
                        <ThumbsUp size={16} />
                      </button>
                      <button
                        onClick={() => {
                          const all = [...news, ...apiNews];
                          const updated = all.map((n) =>
                            n.id === item.id
                              ? { ...n, votes: (n.votes || 0) - 1 }
                              : n
                          );
                          setApiNews(updated.filter((n) => n.isFromApi));
                          setNews(updated.filter((n) => !n.isFromApi));
                        }}
                      >
                        <ThumbsDown size={16} />
                      </button>
                      <span className="text-sm">{item.votes}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsAggregator;
