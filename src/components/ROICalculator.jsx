import React, { useState, useEffect } from "react";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  Save,
  Trash2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ROICalculator = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [formData, setFormData] = useState({
    projectName: "",
    gasSpent: "",
    timeInvested: "",
    expectedValue: "",
    probability: "50",
  });
  const [result, setResult] = useState(null);
  const [savedCalculations, setSavedCalculations] = useState([]);

  const historicalAirdrops = [
    { name: "Uniswap", avgReturn: 12000, probability: 100 },
    { name: "dYdX", avgReturn: 8000, probability: 85 },
    { name: "Optimism", avgReturn: 5000, probability: 90 },
    { name: "Arbitrum", avgReturn: 3500, probability: 95 },
    { name: "Aptos", avgReturn: 2000, probability: 70 },
    { name: "zkSync", avgReturn: 1500, probability: 60 },
    { name: "Blur", avgReturn: 4000, probability: 75 },
    { name: "Celestia", avgReturn: 3000, probability: 65 },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("roi_calculations");
    if (saved) setSavedCalculations(JSON.parse(saved));
  }, []);

  const calculateROI = () => {
    const gas = parseFloat(formData.gasSpent) || 0;
    const time = parseFloat(formData.timeInvested) || 0;
    const expected = parseFloat(formData.expectedValue) || 0;
    const prob = parseFloat(formData.probability) || 50;
    const timeValue = time * 20;
    const totalInvestment = gas + timeValue;
    const adjustedExpected = (expected * prob) / 100;
    const profit = adjustedExpected - totalInvestment;
    const roiPercentage =
      totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
    const breakEvenValue = totalInvestment;

    let riskLevel = "Low";
    let riskColor = "text-green-500";
    if (roiPercentage < 0) {
      riskLevel = "High";
      riskColor = "text-red-500";
    } else if (roiPercentage < 100) {
      riskLevel = "Medium";
      riskColor = "text-yellow-500";
    }

    const scenarios = [
      { name: "Pessimistic", value: adjustedExpected * 0.3 },
      { name: "Realistic", value: adjustedExpected },
      { name: "Optimistic", value: adjustedExpected * 2 },
    ];

    const resultData = {
      totalInvestment: totalInvestment.toFixed(2),
      expectedReturn: adjustedExpected.toFixed(2),
      profit: profit.toFixed(2),
      roiPercentage: roiPercentage.toFixed(2),
      breakEvenValue: breakEvenValue.toFixed(2),
      riskLevel,
      riskColor,
      scenarios,
      projectName: formData.projectName || "Unnamed Project",
      timestamp: new Date().toISOString(),
    };
    setResult(resultData);
  };

  const saveCalculation = () => {
    if (!result) return;
    const newCalculations = [result, ...savedCalculations].slice(0, 10);
    setSavedCalculations(newCalculations);
    localStorage.setItem("roi_calculations", JSON.stringify(newCalculations));
  };

  const deleteCalculation = (index) => {
    const updated = savedCalculations.filter((_, i) => i !== index);
    setSavedCalculations(updated);
    localStorage.setItem("roi_calculations", JSON.stringify(updated));
  };

  // === NEUMORPHIC UI STYLE START ===
  const neuContainer =
    "bg-[#e0e5ec] rounded-3xl shadow-[9px_9px_16px_#b8b9be,-9px_-9px_16px_#ffffff] p-6 transition hover:shadow-[inset_5px_5px_10px_#b8b9be,inset_-5px_-5px_10px_#ffffff]";
  const neuButton =
    "bg-[#e0e5ec] rounded-xl shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] transition text-gray-700 font-semibold";
  const neuInput =
    "w-full bg-[#e0e5ec] rounded-xl px-4 py-3 shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-gray-700 outline-none";
  // === NEUMORPHIC UI STYLE END ===

  return (
    <div className="relative z-10 w-full mb-8">
      {/* Header */}
      <div
        className={`${neuContainer} flex justify-between items-center bg-gradient-to-r from-[#e0e5ec] to-[#f1f4f8]`}
      >
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-700">
          <Calculator size={26} className="text-cyan-500" /> ROI Calculator
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`${neuButton} px-4 py-2 flex items-center gap-2`}
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {isExpanded && (
        <div
          className={`${neuContainer} mt-4 space-y-6 bg-gradient-to-br from-[#f0f3f7] to-[#e0e5ec]`}
        >
          {/* Info Banner */}
          <div
            className="rounded-2xl p-4 flex items-start gap-3 text-gray-700"
            style={{
              boxShadow:
                "inset 4px 4px 8px #b8b9be, inset -4px -4px 8px #ffffff",
            }}
          >
            <Info className="text-cyan-500 mt-0.5" size={20} />
            <p className="text-sm">
              💡 <b>How it works:</b> Enter your gas, time, and expected value.
              Time is valued at <b>$20/hour</b>.
            </p>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-600">Input Data</h3>
              {[
                { label: "Project Name", key: "projectName", placeholder: "zkSync, LayerZero" },
                { label: "💰 Gas Spent (USD)", key: "gasSpent", placeholder: "150" },
                { label: "⏱️ Time Invested (Hours)", key: "timeInvested", placeholder: "5" },
                { label: "🎯 Expected Airdrop Value (USD)", key: "expectedValue", placeholder: "3000" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-gray-500 mb-1">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={formData[f.key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [f.key]: e.target.value })
                    }
                    className={neuInput}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  📊 Success Probability: {formData.probability}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) =>
                    setFormData({ ...formData, probability: e.target.value })
                  }
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={calculateROI}
                  className={`${neuButton} flex-1 py-3 flex items-center justify-center gap-2 text-cyan-600`}
                >
                  <Calculator size={18} /> Calculate ROI
                </button>
                <button
                  onClick={() =>
                    setFormData({
                      projectName: "",
                      gasSpent: "",
                      timeInvested: "",
                      expectedValue: "",
                      probability: "50",
                    })
                  }
                  className={`${neuButton} px-6 py-3 text-gray-600`}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Historical Table */}
            <div
              className="rounded-3xl p-4 overflow-y-auto"
              style={{
                boxShadow:
                  "inset 4px 4px 8px #b8b9be, inset -4px -4px 8px #ffffff",
              }}
            >
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Historical Airdrops
              </h3>
              <table className="w-full text-sm text-gray-700">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-500">
                    <th className="p-2 text-left">Project</th>
                    <th className="p-2 text-right">Avg Return</th>
                    <th className="p-2 text-right">Success %</th>
                  </tr>
                </thead>
                <tbody>
                  {historicalAirdrops.map((air, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-100 cursor-pointer transition"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          projectName: air.name,
                          expectedValue: air.avgReturn.toString(),
                          probability: air.probability.toString(),
                        })
                      }
                    >
                      <td className="p-2 font-medium">{air.name}</td>
                      <td className="p-2 text-right">${air.avgReturn}</td>
                      <td className="p-2 text-right text-cyan-600">
                        {air.probability}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-600">Results</h3>
                <button
                  onClick={saveCalculation}
                  className={`${neuButton} px-5 py-2 flex items-center gap-2 text-cyan-600`}
                >
                  <Save size={16} /> Save
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: "Investment", value: `$${result.totalInvestment}`, icon: DollarSign },
                  { label: "Expected", value: `$${result.expectedReturn}`, icon: TrendingUp },
                  {
                    label: "Profit",
                    value: `$${result.profit}`,
                    icon: Zap,
                    color: parseFloat(result.profit) >= 0 ? "text-green-500" : "text-red-500",
                  },
                  {
                    label: "ROI",
                    value: `${result.roiPercentage}%`,
                    icon: TrendingUp,
                    color: parseFloat(result.roiPercentage) >= 0 ? "text-purple-500" : "text-red-500",
                  },
                ].map((card, i) => (
                  <div
                    key={i}
                    className={`${neuContainer} flex flex-col items-start space-y-2`}
                  >
                    <div className="flex items-center gap-2">
                      <card.icon
                        size={26}
                        className={card.color || "text-cyan-500"}
                      />
                      <p className="text-gray-500 text-sm">{card.label}</p>
                    </div>
                    <p
                      className={`text-2xl font-bold ${
                        card.color || "text-gray-700"
                      }`}
                    >
                      {card.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Risk Level */}
              <div
                className={`${neuContainer} flex items-center gap-3 text-gray-700`}
              >
                <Info className={result.riskColor} size={24} />
                <div>
                  <p className="font-semibold">
                    Risk Level:{" "}
                    <span className={result.riskColor}>{result.riskLevel}</span>
                  </p>
                  <p className="text-sm">
                    Break-even: ${result.breakEvenValue} | $20/hr time value
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Saved */}
          {savedCalculations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-3">
                Saved Calculations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCalculations.map((calc, i) => (
                  <div
                    key={i}
                    className={`${neuContainer} flex flex-col justify-between`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-700">
                          {calc.projectName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(calc.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteCalculation(i)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        Investment:{" "}
                        <span className="font-semibold text-gray-700">
                          ${calc.totalInvestment}
                        </span>
                      </p>
                      <p>
                        ROI:{" "}
                        <span
                          className={`font-semibold ${
                            parseFloat(calc.roiPercentage) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {calc.roiPercentage}%
                        </span>
                      </p>
                      <p>
                        Profit:{" "}
                        <span
                          className={`font-semibold ${
                            parseFloat(calc.profit) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          ${calc.profit}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ROICalculator;
