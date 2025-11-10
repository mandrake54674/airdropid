import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Wallet,
  Network,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const AnalyticsDashboard = ({ projects, balances, selectedNetwork }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // ===== Pure Frontend Calculations =====
  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter((p) => p.daily === "CHECKED").length;
    const pending = projects.filter((p) => p.daily !== "CHECKED").length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
    const uniqueWallets = new Set(
      projects.filter((p) => p.wallet).map((p) => p.wallet)
    ).size;

    const networkCount = {};
    projects.forEach((p) => {
      if (p.wallet) {
        const net = "Ethereum";
        networkCount[net] = (networkCount[net] || 0) + 1;
      }
    });

    const withTwitter = projects.filter((p) => p.twitter).length;
    const withDiscord = projects.filter((p) => p.discord).length;
    const withTelegram = projects.filter((p) => p.telegram).length;

    return {
      total,
      completed,
      pending,
      completionRate,
      uniqueWallets,
      networkCount,
      withTwitter,
      withDiscord,
      withTelegram,
    };
  }, [projects]);

  const pieData = [
    { name: "Completed", value: stats.completed, color: "#22c55e" },
    { name: "Pending", value: stats.pending, color: "#facc15" },
  ];

  const socialData = [
    { name: "Twitter", count: stats.withTwitter, color: "#1DA1F2" },
    { name: "Discord", count: stats.withDiscord, color: "#5865F2" },
    { name: "Telegram", count: stats.withTelegram, color: "#0088cc" },
  ];

  const balanceSummary = useMemo(() => {
    if (balances.length === 0) return null;
    const validBalances = balances.filter(
      (b) => !b.balance.includes("Error") && !b.balance.includes("Invalid")
    );
    const total = validBalances.reduce(
      (sum, b) => sum + parseFloat(b.balance),
      0
    );
    const nonZero = validBalances.filter((b) => parseFloat(b.balance) > 0).length;

    return {
      total: total.toFixed(6),
      count: validBalances.length,
      nonZero,
    };
  }, [balances]);

  const activityData = useMemo(() => {
    const days = 7;
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      data.push({
        day: dayName,
        checks: Math.floor(Math.random() * stats.total) + 1,
      });
    }
    return data;
  }, [stats.total]);

  // === NEUMORPHIC STYLE CLASSES ===
  const neuCard =
    "bg-[#e0e5ec] rounded-3xl p-5 shadow-[9px_9px_16px_#b8b9be,-9px_-9px_16px_#ffffff] hover:shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] transition";
  const neuContainer =
    "bg-[#e0e5ec] rounded-3xl shadow-[9px_9px_16px_#b8b9be,-9px_-9px_16px_#ffffff] p-6 transition";
  const neuButton =
    "bg-[#e0e5ec] rounded-xl shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] transition text-gray-700 font-semibold";

  return (
    <div className="relative z-10 w-full mb-8">
      {/* Header */}
      <div className={`${neuContainer} flex justify-between items-center`}>
        <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
          <Activity size={28} className="text-cyan-500" /> Analytics Dashboard
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`${neuButton} px-4 py-2 flex items-center gap-2`}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {/* Dashboard Content */}
      {isExpanded && (
        <div
          className={`${neuContainer} mt-4 space-y-8 bg-gradient-to-br from-[#f0f3f7] to-[#e0e5ec]`}
        >
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                label: "Total Projects",
                value: stats.total,
                color: "text-cyan-500",
                icon: TrendingUp,
              },
              {
                label: "Daily Task",
                value: stats.completed,
                color: "text-green-500",
                icon: CheckCircle,
              },
              {
                label: "Pending Tasks",
                value: stats.pending,
                color: "text-yellow-500",
                icon: Clock,
              },
              {
                label: "Completion Rate",
                value: `${stats.completionRate}%`,
                color: "text-purple-500",
                icon: Activity,
              },
            ].map((card, i) => (
              <div key={i} className={`${neuCard} flex items-center justify-between`}>
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <p className={`text-3xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                </div>
                <card.icon size={32} className={card.color} />
              </div>
            ))}
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className={neuCard}>
              <div className="flex items-center gap-3">
                <Wallet className="text-yellow-500" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Unique Wallets</p>
                  <p className="text-xl font-bold text-gray-700">
                    {stats.uniqueWallets}
                  </p>
                </div>
              </div>
            </div>

            <div className={neuCard}>
              <div className="flex items-center gap-3">
                <Network className="text-blue-500" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Networks Used</p>
                  <p className="text-xl font-bold text-gray-700">
                    {Object.keys(stats.networkCount).length || 1}
                  </p>
                </div>
              </div>
            </div>

            {balanceSummary && (
              <div className={neuCard}>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={24} />
                  <div>
                    <p className="text-sm text-gray-500">Total Balance Checked</p>
                    <p className="text-xl font-bold text-green-600">
                      {balanceSummary.total}{" "}
                      {selectedNetwork === "BSC"
                        ? "BNB"
                        : selectedNetwork === "Polygon"
                        ? "MATIC"
                        : "ETH"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {balanceSummary.nonZero} wallets with balance
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={neuCard}>
              <h3 className="text-lg font-semibold text-gray-600 mb-4">
                Task Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#f5f7fa",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      color: "#111",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={neuCard}>
              <h3 className="text-lg font-semibold text-gray-600 mb-4">
                Social Media Integration
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={socialData}>
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      background: "#f5f7fa",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      color: "#111",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {socialData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Line Chart */}
          <div className={neuCard}>
            <h3 className="text-lg font-semibold text-gray-600 mb-4">
              Daily Activity (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={activityData}>
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    background: "#f5f7fa",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    color: "#111",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="checks"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: "#06b6d4", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Progress Bar */}
          <div className={neuCard}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-600">
                Overall Progress
              </h3>
              <span className="text-2xl font-bold text-purple-600">
                {stats.completionRate}%
              </span>
            </div>
            <div
              className="w-full rounded-full h-6 bg-[#e0e5ec] shadow-inner relative"
              style={{
                boxShadow:
                  "inset 4px 4px 8px #b8b9be, inset -4px -4px 8px #ffffff",
              }}
            >
              <div
                className="absolute top-0 left-0 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 flex items-center justify-end pr-3 text-xs font-semibold text-white"
                style={{ width: `${stats.completionRate}%` }}
              >
                {stats.completed}/{stats.total}
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className={neuCard}>
            <h3 className="text-lg font-semibold text-gray-600 mb-3">
              📊 Quick Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div>✓ Completed {stats.completed} tasks</div>
              <div>⏱ {stats.pending} pending projects</div>
              <div>🌐 {stats.withTwitter} Twitter linked</div>
              <div>💰 {stats.uniqueWallets} unique wallets</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
