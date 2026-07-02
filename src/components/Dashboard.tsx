import React, { useEffect, useState } from "react";
import { Users, FileText, CheckCircle, AlertTriangle, IndianRupee, TrendingUp, ArrowRight, Activity } from "lucide-react";
import { DashboardData } from "../types";

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
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
      <div className="flex flex-col items-center justify-center py-20" id="dashboard-loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading Dashboard metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl max-w-2xl mx-auto my-10" id="dashboard-error">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Dashboard Load Failed
        </h3>
        <p className="mt-2 text-sm">{error || "Could not retrieve analytical data from backend."}</p>
      </div>
    );
  }

  // Format INR nicely
  const formatINR = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  const stats = [
    {
      id: "stat-customers",
      title: "Total Customers",
      value: data.totalCustomers,
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      description: "Unique applicants in system"
    },
    {
      id: "stat-loans",
      title: "Total Loan Applications",
      value: data.totalLoans,
      icon: FileText,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      description: "Submitted for evaluation"
    },
    {
      id: "stat-approved",
      title: "Approved / Low Risk",
      value: data.approvedLoans,
      icon: CheckCircle,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      description: "Eligible healthy accounts"
    },
    {
      id: "stat-defaulted",
      title: "Default Cases / High Risk",
      value: data.defaultCases,
      icon: AlertTriangle,
      color: "bg-rose-50 text-rose-600 border-rose-100",
      description: "Predicted default warning"
    },
    {
      id: "stat-avg-loan",
      title: "Avg. Loan Amount",
      value: formatINR(data.avgLoanAmount),
      icon: IndianRupee,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      description: "Requested capital average"
    },
    {
      id: "stat-avg-income",
      title: "Avg. Monthly Income",
      value: formatINR(data.avgMonthlyIncome),
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      description: "Applicant household income"
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 font-display">
          <Activity className="h-7 w-7 text-blue-600" />
          Executive Analytics Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Real-time summary of Indian bank applicants, risk profiles, and training sample insights.
        </p>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              id={stat.id}
              className="bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-start gap-4"
            >
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">{stat.value}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution visualizer & Recent applications row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Distribution Chart */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm col-span-1" id="risk-distribution-box">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 font-display">Risk Distribution</h3>
          
          <div className="flex justify-center items-center h-48 relative">
            {/* Elegant Circular Progress / Semi Donut */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-slate-100 dark:stroke-slate-700"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-blue-600 transition-all duration-1000 ease-out"
                strokeWidth="16"
                fill="none"
                strokeDasharray={402}
                strokeDashoffset={402 * (1 - data.approvedLoans / (data.totalLoans || 1))}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {Math.round((data.approvedLoans / (data.totalLoans || 1)) * 100)}%
              </span>
              <span className="text-xs text-slate-400 font-medium">Approved / Safe</span>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <span className="h-3 w-3 rounded-full bg-blue-600"></span>
                Approved Risk (0)
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{data.approvedLoans} cases</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                Default Risk (1)
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{data.defaultCases} cases</span>
            </div>
          </div>
        </div>

        {/* Recent Applications Table */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between" id="recent-applications-box">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">Recent Evaluation Entries</h3>
              <button
                onClick={() => onNavigate("dataset")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                View dataset <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs uppercase font-semibold">
                    <th className="py-3 px-2">Applicant ID</th>
                    <th className="py-3 px-2">Age/Gender</th>
                    <th className="py-3 px-2">Income</th>
                    <th className="py-3 px-2">Loan Details</th>
                    <th className="py-3 px-2">Credit Score</th>
                    <th className="py-3 px-2 text-right">Model Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {data.recentApplications.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="py-3.5 px-2 font-mono text-slate-600 dark:text-slate-300 font-semibold">{app.id}</td>
                      <td className="py-3.5 px-2">
                        <div className="text-slate-950 dark:text-white font-medium">{app.gender}</div>
                        <div className="text-xs text-slate-400">{app.age} yrs</div>
                      </td>
                      <td className="py-3.5 px-2 font-medium text-slate-700 dark:text-slate-300">
                        {formatINR(app.monthlyIncome)}
                      </td>
                      <td className="py-3.5 px-2">
                        <div className="text-slate-900 dark:text-white font-semibold">{formatINR(app.loanAmount)}</div>
                        <div className="text-xs text-slate-400">{app.loanPurpose} • {app.loanTerm}m</div>
                      </td>
                      <td className="py-3.5 px-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-mono font-bold ${
                          app.creditScore >= 750 ? "bg-emerald-50 text-emerald-700" :
                          app.creditScore >= 650 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {app.creditScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          app.defaultStatus === 1
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        }`}>
                          {app.defaultStatus === 1 ? "⚠️ High" : "✅ Low"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-slate-400 dark:text-slate-500">Need to make a fast decision on a new applicant?</span>
            <button
              onClick={() => onNavigate("prediction")}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all"
            >
              Evaluate New Loan Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
