import React, { useEffect, useState } from "react";
import { Award, BarChart3, Binary, ShieldAlert, GitBranch, Table, AlertCircle } from "lucide-react";
import { PerformanceData } from "../types";

export default function ModelPerformance() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/model-performance")
      .then(res => {
        if (!res.ok) throw new Error("Could not fetch ML metrics.");
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20" id="performance-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-400 font-medium text-sm">Evaluating classifiers & computing importances...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-xl flex items-center gap-3">
        <AlertCircle className="h-6 w-6 text-red-500" />
        <div>
          <h3 className="font-semibold">Performance Load Failed</h3>
          <p className="text-sm mt-1">{error || "Data retrieval error."}</p>
        </div>
      </div>
    );
  }

  // Helper to format as percentage
  const pct = (val: number) => `${(val * 100).toFixed(1)}%`;

  // Confusion matrix labels
  const [tn, fp] = data.rfMetrics.confusionMatrix[0];
  const [fn, tp] = data.rfMetrics.confusionMatrix[1];
  const totalCases = tn + fp + fn + tp;

  return (
    <div className="space-y-8 animate-fade-in" id="model-performance-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 font-display">
          <Award className="h-7 w-7 text-blue-600" />
          Model Performance & Training Insights
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Comprehensive benchmark comparing three core machine learning algorithms. The model with the highest test accuracy is automatically selected.
        </p>
      </div>

      {/* Model Selection Alert Banner */}
      <div className="bg-blue-50/50 border border-blue-100 dark:border-blue-900/10 dark:bg-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 text-blue-800 dark:text-blue-300">
        <div className="p-3 bg-blue-600 text-white rounded-xl">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm sm:text-base font-display">Selected Model: {data.bestModelName}</h3>
          <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-0.5 font-medium">
            This model achieved the highest test score among all trained classifiers on the local dataset.
          </p>
        </div>
      </div>

      {/* Performance Statistics Comparison Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm" id="metrics-comparison-card">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 font-display">
          <Table className="h-4 w-4 text-blue-600" />
          Algorithm Comparison Table
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-2">Classifier Model</th>
                <th className="py-3 px-2">Accuracy</th>
                <th className="py-3 px-2">Precision</th>
                <th className="py-3 px-2">Recall</th>
                <th className="py-3 px-2">F1-Score</th>
                <th className="py-3 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${data.bestModelName === "Random Forest Classifier" ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}>
                <td className="py-3.5 px-2 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-emerald-500" /> Random Forest Classifier
                </td>
                <td className="py-3.5 px-2 font-semibold text-slate-950 dark:text-white">{pct(data.rfMetrics.accuracy)}</td>
                <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">{pct(data.rfMetrics.precision)}</td>
                <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">{pct(data.rfMetrics.recall)}</td>
                <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">{pct(data.rfMetrics.f1Score)}</td>
                <td className="py-3.5 px-2 text-right">
                  {data.bestModelName === "Random Forest Classifier" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 uppercase">Selected</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 uppercase">Compared</span>
                  )}
                </td>
              </tr>
              <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${data.bestModelName === "Decision Tree Classifier" ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}>
                <td className="py-3.5 px-2 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-indigo-500" /> Decision Tree Classifier
                </td>
                <td className="py-3.5 px-2 font-semibold text-slate-950 dark:text-white">{pct(data.dtMetrics.accuracy)}</td>
                <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">{pct(data.dtMetrics.precision)}</td>
                <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">{pct(data.dtMetrics.recall)}</td>
                <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">{pct(data.dtMetrics.f1Score)}</td>
                <td className="py-3.5 px-2 text-right">
                  {data.bestModelName === "Decision Tree Classifier" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 uppercase">Selected</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 uppercase">Compared</span>
                  )}
                </td>
              </tr>
              <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors ${data.bestModelName === "Logistic Regression" ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}`}>
                <td className="py-3.5 px-2 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Binary className="h-4 w-4 text-purple-500" /> Logistic Regression
                </td>
                <td className="py-3.5 px-2 font-semibold text-slate-950 dark:text-white">{pct(data.lrMetrics.accuracy)}</td>
                <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">{pct(data.lrMetrics.precision)}</td>
                <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">{pct(data.lrMetrics.recall)}</td>
                <td className="py-3.5 px-2 text-slate-600 dark:text-slate-300">{pct(data.lrMetrics.f1Score)}</td>
                <td className="py-3.5 px-2 text-right">
                  {data.bestModelName === "Logistic Regression" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700 uppercase">Selected</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 uppercase">Compared</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid of charts: Feature Importance & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature Importance SVG Bar Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm" id="feature-importance-card">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Random Forest Feature Importance
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
            Relative weight/contribution of each credential during training splitting operations.
          </p>

          <div className="space-y-4">
            {data.featureImportance.slice(0, 8).map((fi, i) => (
              <div key={fi.feature} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{fi.feature}</span>
                  <span className="text-blue-600 font-mono">{(fi.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-blue-600 transition-all duration-1000 ease-out"
                    style={{ width: `${fi.importance * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confusion Matrix Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between" id="confusion-matrix-card">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Binary className="h-5 w-5 text-blue-600" />
              Test Set Confusion Matrix
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">
              True / False classifications breakdown evaluated on an independent 20% validation split.
            </p>

            {/* Matrix 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              {/* TN */}
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">True Negative (TN)</span>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{tn}</p>
                <p className="text-[10px] text-slate-400">Predicted safe, was safe ({Math.round((tn / totalCases) * 100)}%)</p>
              </div>

              {/* FP */}
              <div className="bg-rose-50/30 dark:bg-rose-900/5 border border-rose-150 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] font-bold text-rose-500 uppercase">False Positive (FP)</span>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{fp}</p>
                <p className="text-[10px] text-slate-400">Predicted default, was safe ({Math.round((fp / totalCases) * 100)}%)</p>
              </div>

              {/* FN */}
              <div className="bg-rose-50/30 dark:bg-rose-900/5 border border-rose-150 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] font-bold text-rose-500 uppercase">False Negative (FN)</span>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{fn}</p>
                <p className="text-[10px] text-slate-400">Predicted safe, defaulted ({Math.round((fn / totalCases) * 100)}%)</p>
              </div>

              {/* TP */}
              <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] font-bold text-rose-600 uppercase">True Positive (TP)</span>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{tp}</p>
                <p className="text-[10px] text-slate-400">Predicted default, defaulted ({Math.round((tp / totalCases) * 100)}%)</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-500 flex items-center gap-2 bg-slate-50 dark:bg-slate-700/10 p-3 rounded-xl">
            <ShieldAlert className="h-5 w-5 text-blue-500 shrink-0" />
            <span>
              <strong>Precision ({pct(data.rfMetrics.precision)})</strong> measures how often predicted defaults were accurate, while <strong>Recall ({pct(data.rfMetrics.recall)})</strong> gauges the percentage of real defaults flagged.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
