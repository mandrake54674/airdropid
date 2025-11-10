import React, { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import TrackerPageFullScreen from "./TrackerPageFullScreen";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn");
    if (logged === "true") setIsLoggedIn(true);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoggedIn ? (
        <motion.div
          key="tracker"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <TrackerPageFullScreen onLogout={() => setIsLoggedIn(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <LoginPage onLogin={() => setIsLoggedIn(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;

