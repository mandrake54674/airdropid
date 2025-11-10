import React, { useState } from "react";
import { LogIn, User, Lock } from "lucide-react";
import { motion } from "framer-motion";

const LoginPage = ({ onLogin }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);

  const ADMIN_USER = import.meta.env.VITE_ADMIN_USER;
  const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.username === ADMIN_USER && form.password === ADMIN_PASS) {
      localStorage.setItem("isLoggedIn", "true");
      onLogin();
    } else {
      setError("❌ Username atau password salah!");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden" style={{
      background: "linear-gradient(135deg, #e3edf7 0%, #d4e4f7 50%, #dfe9f5 100%)"
    }}>
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-30" style={{
        background: "linear-gradient(135deg, #a8d5f2, #7cb9e8)",
        boxShadow: "20px 20px 60px #b8c9d9, -20px -20px 60px #ffffff"
      }}></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20" style={{
        background: "linear-gradient(135deg, #c4d7f2, #9dc4e8)",
        boxShadow: "20px 20px 60px #b8c9d9, -20px -20px 60px #ffffff"
      }}></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-[90%] max-w-md p-10 rounded-3xl"
        style={{
          background: "#e3edf7",
          boxShadow: "20px 20px 60px #becad6, -20px -20px 60px #ffffff"
        }}
      >
        {/* Logo/Icon Container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8"
          style={{
            background: "#e3edf7",
            boxShadow: "inset 8px 8px 16px #becad6, inset -8px -8px 16px #ffffff"
          }}
        >
          <User size={40} className="text-gray-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-2 text-center text-gray-700"
        >
          Welcome Back
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-500 mb-8 text-sm"
        >
          Sign in to your Airdrop Tracker account
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300"
              style={{
                background: "#e3edf7",
                boxShadow: focusedInput === "username" 
                  ? "inset 6px 6px 12px #becad6, inset -6px -6px 12px #ffffff"
                  : "6px 6px 12px #becad6, -6px -6px 12px #ffffff"
              }}
            >
              <User size={20} className="text-gray-500" />
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                onFocus={() => setFocusedInput("username")}
                onBlur={() => setFocusedInput(null)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                data-testid="username-input"
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300"
              style={{
                background: "#e3edf7",
                boxShadow: focusedInput === "password"
                  ? "inset 6px 6px 12px #becad6, inset -6px -6px 12px #ffffff"
                  : "6px 6px 12px #becad6, -6px -6px 12px #ffffff"
              }}
            >
              <Lock size={20} className="text-gray-500" />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                data-testid="password-input"
              />
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-red-500 text-sm text-center font-medium"
            >
              {error}
            </motion.p>
          )}

          {/* Login Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            type="submit"
            className="w-full py-4 rounded-2xl font-semibold text-gray-700 flex items-center justify-center gap-2 transition-all duration-300 active:scale-95"
            style={{
              background: "#e3edf7",
              boxShadow: "6px 6px 12px #becad6, -6px -6px 12px #ffffff"
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.boxShadow = "inset 4px 4px 8px #becad6, inset -4px -4px 8px #ffffff";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.boxShadow = "6px 6px 12px #becad6, -6px -6px 12px #ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "6px 6px 12px #becad6, -6px -6px 12px #ffffff";
            }}
            data-testid="login-button"
          >
            <LogIn size={20} />
            <span>Sign In</span>
          </motion.button>
        </form>

        {/* Footer Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-500">
            Secure access to your crypto tracking dashboard
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
