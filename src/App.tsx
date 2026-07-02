import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Award, Sparkles, TableProperties, Info, Moon, Sun, ShieldAlert, ChevronRight, Menu, X, Check } from "lucide-react";

import Dashboard from "./components/Dashboard";
import LoanPrediction from "./components/LoanPrediction";
import DatasetOverview from "./components/DatasetOverview";
import ModelPerformance from "./components/ModelPerformance";
import AboutProject from "./components/AboutProject";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "prediction", label: "Loan Prediction", icon: Sparkles },
    { id: "dataset", label: "Dataset Overview", icon: TableProperties },
    { id: "performance", label: "Model Performance", icon: Award },
    { id: "about", label: "About Project", icon: Info }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "prediction":
        return <LoanPrediction />;
      case "dataset":
        return <DatasetOverview />;
      case "performance":
        return <ModelPerformance />;
      case "about":
        return <AboutProject />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "Indian Banking Portfolio";
      case "prediction":
        return "Evaluate Risk Profile";
      case "dataset":
        return "Dataset Overview";
      case "performance":
        return "Model Performance";
      case "about":
        return "About Project";
      default:
        return "Indian Banking Portfolio";
    }
  };

  const getPageSubtitle = () => {
    switch (currentPage) {
      case "dashboard":
        return "System status: Operational (Random Forest)";
      case "prediction":
        return "Interactive simulation using CIBIL & ML engine";
      case "dataset":
        return "Explore the customer dataset distributions";
      case "performance":
        return "Receiver Operating Characteristic (ROC) & accuracy";
      case "about":
        return "Technical specifications and architectural stack";
      default:
        return "System status: Operational (Random Forest)";
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 font-sans select-none flex overflow-hidden transition-colors duration-300">
      
      {/* Sidebar Navigation - Desktop */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700/80 flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/10">
            L
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight font-display">
            LoanGuard AI
          </h1>
        </div>
        
        {/* Navigation links */}
        <div className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left text-xs ${
                  active
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Accuracy Info Box at Sidebar Bottom */}
        <div className="p-6">
          <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-2xl text-white">
            <p className="text-[10px] text-slate-400 mb-1 font-semibold tracking-wider uppercase">Model Accuracy</p>
            <p className="text-xl font-extrabold tracking-tight font-display">94.2%</p>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: "94.2%" }}></div>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
              RF Ensemble Engine Live
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header bar */}
        <header className="h-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between px-6 sm:px-8 shrink-0 transition-colors duration-300">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight leading-snug">
              {getPageTitle()}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
              {currentPage === "dashboard" && (
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
              )}
              {getPageSubtitle()}
            </p>
          </div>

          <div className="flex gap-4 items-center">
            {/* Dark Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 rounded-xl transition-all"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-500" />}
            </button>

            {/* Profile Avatar Widget */}
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center font-extrabold text-sm shadow-sm">
              IN
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl lg:hidden transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content Area - Scrollable */}
        <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto min-h-0 bg-slate-50 dark:bg-slate-900/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-7xl mx-auto h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Drawer Navigation overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
            />
            {/* Slide-out drawer panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-800 shadow-2xl border-r border-slate-100 dark:border-slate-700 p-6 flex flex-col justify-between lg:hidden"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider font-display">LoanGuard AI</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex flex-col gap-1.5">
                  {navItems.map(item => {
                    const Icon = item.icon;
                    const active = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        <ChevronRight className={`h-4 w-4 opacity-50 ${active ? "text-white" : ""}`} />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom footer for drawer */}
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-2xl text-white">
                  <p className="text-[9px] text-slate-400 mb-0.5 uppercase tracking-wider font-mono">Model Accuracy</p>
                  <p className="text-lg font-bold">94.2%</p>
                  <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: "94.2%" }}></div>
                  </div>
                </div>
                <div className="text-center text-[10px] text-slate-400 font-mono">
                  © 2026 Indian Banking Risk Engine
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
