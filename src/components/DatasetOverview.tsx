import React, { useEffect, useState } from "react";
import { Search, Download, ArrowUpDown, ChevronLeft, ChevronRight, Filter, RefreshCw, TableProperties, AlertCircle } from "lucide-react";
import { DatasetResponse } from "../types";

export default function DatasetOverview() {
  const [data, setData] = useState<DatasetResponse | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataset = () => {
    setLoading(true);
    const query = new URLSearchParams({
      search,
      sortBy,
      sortOrder,
      page: String(page),
      limit: String(limit)
    });

    fetch(`/api/dataset?${query}`)
      .then(res => {
        if (!res.ok) throw new Error("Could not fetch dataset table records.");
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
  };

  useEffect(() => {
    fetchDataset();
  }, [search, sortBy, sortOrder, page]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1); // Reset to first page when sort parameters change
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleDownload = () => {
    window.open("/api/dataset/download", "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in" id="dataset-overview-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 font-display">
          <TableProperties className="h-7 w-7 text-blue-600" />
          Indian Banking Dataset
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Explore, sort, filter and paginate real-time sample records representing realistic banking borrowers in India. Click on column headers to sort.
        </p>
      </div>

      {/* Control Panel: Search & Download */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Applicant ID, gender, purpose, or score..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none text-sm"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button
            onClick={fetchDataset}
            className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300"
            title="Reload dataset"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Download className="h-4 w-4" /> Download Dataset CSV
          </button>
        </div>
      </div>

      {/* Dataset Table Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-hidden" id="dataset-table-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-400 font-medium text-sm">Querying data table records...</p>
          </div>
        ) : error || !data ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-semibold">Query Failed</h3>
              <p className="text-sm mt-1">{error || "Data load failed."}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[1200px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 text-xs uppercase font-bold tracking-wider">
                    <th className="py-3 px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded-l-lg" onClick={() => handleSort("id")}>
                      <span className="flex items-center gap-1.5">ID <ArrowUpDown className="h-3.5 w-3.5" /></span>
                    </th>
                    <th className="py-3 px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => handleSort("age")}>
                      <span className="flex items-center gap-1.5">Age <ArrowUpDown className="h-3.5 w-3.5" /></span>
                    </th>
                    <th className="py-3 px-2">Gender</th>
                    <th className="py-3 px-2">Education</th>
                    <th className="py-3 px-2">Employment</th>
                    <th className="py-3 px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => handleSort("monthlyIncome")}>
                      <span className="flex items-center gap-1.5">Monthly Income <ArrowUpDown className="h-3.5 w-3.5" /></span>
                    </th>
                    <th className="py-3 px-2">Existing EMI</th>
                    <th className="py-3 px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => handleSort("loanAmount")}>
                      <span className="flex items-center gap-1.5">Loan Amount <ArrowUpDown className="h-3.5 w-3.5" /></span>
                    </th>
                    <th className="py-3 px-2">Term (Months)</th>
                    <th className="py-3 px-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => handleSort("creditScore")}>
                      <span className="flex items-center gap-1.5">CIBIL Score <ArrowUpDown className="h-3.5 w-3.5" /></span>
                    </th>
                    <th className="py-3 px-2">Purpose</th>
                    <th className="py-3 px-2 text-right rounded-r-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => handleSort("defaultStatus")}>
                      <span className="flex items-center justify-end gap-1.5">Default Risk <ArrowUpDown className="h-3.5 w-3.5" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {data.records.map((r, i) => (
                    <tr key={r.id + i} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 px-2 font-mono text-slate-600 dark:text-slate-300 font-semibold">{r.id}</td>
                      <td className="py-3 px-2 font-medium text-slate-900 dark:text-white">{r.age}</td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{r.gender}</td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{r.education}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          r.employmentType === "Salaried" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20" :
                          r.employmentType === "Self-Employed" ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20" : "bg-orange-50 text-orange-700"
                        }`}>
                          {r.employmentType}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-semibold text-slate-900 dark:text-white">{formatINR(r.monthlyIncome)}</td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{formatINR(r.existingEMI)}</td>
                      <td className="py-3 px-2 font-semibold text-slate-950 dark:text-white">{formatINR(r.loanAmount)}</td>
                      <td className="py-3 px-2 font-medium text-slate-600 dark:text-slate-400">{r.loanTerm} months</td>
                      <td className="py-3 px-2 font-mono">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          r.creditScore >= 750 ? "bg-emerald-50 text-emerald-700" :
                          r.creditScore >= 650 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                        }`}>
                          {r.creditScore}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300">{r.loanPurpose}</td>
                      <td className="py-3 px-2 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          r.defaultStatus === 1
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        }`}>
                          {r.defaultStatus === 1 ? "⚠️ High Risk" : "✅ Low Risk"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700 gap-4">
              <span className="text-xs text-slate-400 font-medium">
                Showing page <span className="font-bold text-slate-800 dark:text-white">{data.currentPage}</span> of <span className="font-bold text-slate-800 dark:text-white">{data.totalPages}</span> ({data.totalRecords} records)
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  disabled={page === data.totalPages}
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-600 dark:text-slate-300"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
