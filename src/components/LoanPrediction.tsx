import React, { useState } from "react";
import { AlertCircle, IndianRupee, Printer, Download, RefreshCw, Sparkles, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { PredictionInput, PredictionResult } from "../types";

export default function LoanPrediction() {
  const [inputs, setInputs] = useState<PredictionInput>({
    age: 30,
    gender: "Male",
    maritalStatus: "Single",
    education: "Graduate",
    employmentType: "Salaried",
    monthlyIncome: 50000,
    existingEMI: 5000,
    loanAmount: 300000,
    loanTerm: 36,
    interestRate: 10.5,
    creditScore: 720,
    dependents: 1,
    propertyOwnership: "Owned",
    cityTier: "Tier 1",
    existingLoans: "No",
    loanPurpose: "Personal"
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};

    if (inputs.age < 18 || inputs.age > 100) {
      errs.age = "Applicant age must be between 18 and 100";
    }
    if (inputs.monthlyIncome <= 0) {
      errs.monthlyIncome = "Monthly Income must be greater than 0";
    }
    if (inputs.loanAmount <= 0) {
      errs.loanAmount = "Loan Amount must be greater than 0";
    }
    if (inputs.loanTerm <= 0) {
      errs.loanTerm = "Loan Term must be greater than 0 months";
    }
    if (inputs.interestRate <= 0) {
      errs.interestRate = "Interest Rate must be greater than 0%";
    }
    if (inputs.creditScore < 300 || inputs.creditScore > 900) {
      errs.creditScore = "Credit Score must be between 300 and 900 (Indian CIBIL standard)";
    }
    if (inputs.existingEMI < 0) {
      errs.existingEMI = "Existing EMI cannot be negative";
    }
    if (inputs.dependents < 0) {
      errs.dependents = "Dependents cannot be negative";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = ["age", "monthlyIncome", "existingEMI", "loanAmount", "loanTerm", "interestRate", "creditScore", "dependents"].includes(name);
    setInputs(prev => ({
      ...prev,
      [name]: isNumber ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setResult(null);

    // Simulate training / query latency to look professional
    setTimeout(() => {
      fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs)
      })
        .then(res => {
          if (!res.ok) return res.json().then(err => { throw new Error(err.error); });
          return res.json();
        })
        .then(data => {
          setResult(data);
          setLoading(false);
        })
        .catch(err => {
          setErrors({ submit: err.message });
          setLoading(false);
        });
    }, 850);
  };

  const handleReset = () => {
    setInputs({
      age: 30,
      gender: "Male",
      maritalStatus: "Single",
      education: "Graduate",
      employmentType: "Salaried",
      monthlyIncome: 50000,
      existingEMI: 5000,
      loanAmount: 300000,
      loanTerm: 36,
      interestRate: 10.5,
      creditScore: 720,
      dependents: 1,
      propertyOwnership: "Owned",
      cityTier: "Tier 1",
      existingLoans: "No",
      loanPurpose: "Personal"
    });
    setResult(null);
    setErrors({});
  };

  // Generate and download client CSV representation of prediction
  const downloadPredictionCSV = () => {
    if (!result) return;
    const headers = [
      "Parameter", "Input Value", "Risk Outcome", "Probability", "Risk Score", "Recommendation"
    ];
    const rows = [
      ["Age", inputs.age],
      ["Gender", inputs.gender],
      ["Income", inputs.monthlyIncome],
      ["EMI", inputs.existingEMI],
      ["Loan Amount", inputs.loanAmount],
      ["Term", inputs.loanTerm],
      ["Interest Rate", inputs.interestRate],
      ["Credit Score", inputs.creditScore],
      ["Employment", inputs.employmentType],
      ["Purpose", inputs.loanPurpose],
      ["Outcome", result.loanStatus],
      ["Probability", result.defaultProbability],
      ["Risk Score", `${result.riskScore}%`],
      ["Recommendation", result.recommendation]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prediction_report_${inputs.creditScore}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in print:p-0" id="loan-prediction-page">
      <div className="print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 font-display">
          <Sparkles className="h-7 w-7 text-blue-600" />
          AI Loan Default Predictor
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Enter applicant details below. Our Random Forest classification algorithm evaluates CIBIL scores, DTI rates, and demographic details to return a dynamic risk score.
        </p>
      </div>

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Prediction Form - 7 Cols */}
        <div className={`bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm lg:col-span-7 print:hidden`}>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 font-display">
            <IndianRupee className="h-4 w-4 text-blue-600" />
            Applicant Information Form
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm p-4 rounded-xl flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Demographic Parameters */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Demographic Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Age of Applicant</label>
                  <input
                    type="number"
                    name="age"
                    value={inputs.age}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.age ? "border-rose-500 ring-rose-200" : "border-slate-200 dark:border-slate-600"} bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none`}
                  />
                  {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={inputs.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={inputs.maritalStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Dependents</label>
                  <input
                    type="number"
                    name="dependents"
                    value={inputs.dependents}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Financial Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Financial Credentials</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Monthly Income (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      name="monthlyIncome"
                      value={inputs.monthlyIncome}
                      onChange={handleInputChange}
                      className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${errors.monthlyIncome ? "border-rose-500" : "border-slate-200 dark:border-slate-600"} bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none`}
                    />
                  </div>
                  {errors.monthlyIncome && <p className="text-xs text-rose-500 mt-1">{errors.monthlyIncome}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Existing EMI obligations (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      name="existingEMI"
                      value={inputs.existingEMI}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Employment Type</label>
                  <select
                    name="employmentType"
                    value={inputs.employmentType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none"
                  >
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Unemployed">Unemployed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">CIBIL / Credit Score</label>
                  <input
                    type="number"
                    name="creditScore"
                    value={inputs.creditScore}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.creditScore ? "border-rose-500" : "border-slate-200 dark:border-slate-600"} bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none`}
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Scale: 300 (Poor) to 900 (Excellent)</p>
                  {errors.creditScore && <p className="text-xs text-rose-500 mt-1">{errors.creditScore}</p>}
                </div>
              </div>
            </div>

            {/* Loan Request Specifics */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Loan Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Loan Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      name="loanAmount"
                      value={inputs.loanAmount}
                      onChange={handleInputChange}
                      className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${errors.loanAmount ? "border-rose-500" : "border-slate-200 dark:border-slate-600"} bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none`}
                    />
                  </div>
                  {errors.loanAmount && <p className="text-xs text-rose-500 mt-1">{errors.loanAmount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Loan Term (Months)</label>
                  <input
                    type="number"
                    name="loanTerm"
                    value={inputs.loanTerm}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.loanTerm ? "border-rose-500" : "border-slate-200 dark:border-slate-600"} bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none`}
                  />
                  {errors.loanTerm && <p className="text-xs text-rose-500 mt-1">{errors.loanTerm}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="interestRate"
                    value={inputs.interestRate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.interestRate ? "border-rose-500" : "border-slate-200 dark:border-slate-600"} bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none`}
                  />
                  {errors.interestRate && <p className="text-xs text-rose-500 mt-1">{errors.interestRate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Loan Purpose</label>
                  <select
                    name="loanPurpose"
                    value={inputs.loanPurpose}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none"
                  >
                    <option value="Home">Home Loan</option>
                    <option value="Personal">Personal Loan</option>
                    <option value="Education">Education Loan</option>
                    <option value="Vehicle">Vehicle Loan</option>
                    <option value="Business">Business Loan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Existing Active Loans</label>
                  <select
                    name="existingLoans"
                    value={inputs.existingLoans}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Property Ownership</label>
                  <select
                    name="propertyOwnership"
                    value={inputs.propertyOwnership}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700 text-slate-950 dark:text-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none"
                  >
                    <option value="Owned">Owned Property</option>
                    <option value="Rented">Rented Residence</option>
                    <option value="Mortgaged">Mortgaged Property</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" /> Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 font-bold shadow-sm transition-all text-sm flex justify-center items-center gap-2 disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Executing Algorithms...
                  </>
                ) : (
                  "Predict Default Risk"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Prediction Results Display Card - 5 Cols */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {loading && (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-8 shadow-sm h-full flex flex-col justify-center items-center py-24 text-center print:hidden" id="result-loading-box">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Analyzing Applicant Profile</h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 max-w-sm">
                Scaling inputs, evaluating features across Random Forest estimators, and matching decision nodes...
              </p>
            </div>
          )}

          {!loading && !result && (
            <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 h-full flex flex-col justify-center items-center py-24 text-center print:hidden">
              <HelpCircle className="h-14 w-14 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-white">No Evaluation Executed</h3>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 max-w-xs">
                Provide applicant credentials on the left panel and click "Predict Default Risk" to review real-time classification results.
              </p>
            </div>
          )}

          {result && (
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6 print:border-none print:shadow-none" id="prediction-result-card">
              {/* Report Header for Print Mode */}
              <div className="hidden print:block border-b pb-4 mb-4">
                <h1 className="text-2xl font-bold">Indian Loan Default Prediction System</h1>
                <p className="text-xs text-gray-500">Official Machine Learning Risk Assessment Report</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Risk Evaluation Report</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    result.statusColor === "green" ? "bg-emerald-50 text-emerald-700" :
                    result.statusColor === "yellow" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {result.statusColor === "green" ? <ShieldCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    {result.loanStatus}
                  </span>
                </div>

                {/* Score Indicator Visual */}
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-6 text-center space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    {/* Circle representing the score */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        className="stroke-slate-150 dark:stroke-slate-700"
                        strokeWidth="10"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        className={`transition-all duration-1000 ease-out ${
                          result.statusColor === "green" ? "stroke-emerald-500" :
                          result.statusColor === "yellow" ? "stroke-amber-500" : "stroke-rose-500"
                        }`}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={339}
                        strokeDashoffset={339 * (1 - result.riskScore / 100)}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{result.riskScore}%</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Risk Index</span>
                    </div>
                  </div>

                  {/* Progressive risk score bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                      <span>Low Risk</span>
                      <span>Medium</span>
                      <span>High Risk</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          result.statusColor === "green" ? "bg-emerald-500" :
                          result.statusColor === "yellow" ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${result.riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Recommendation summary block */}
                <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Recommendation Result</h4>
                    <p className="mt-1.5 text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {result.recommendation}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-50/50 dark:bg-slate-700/10 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">CIBIL Score</span>
                      <p className="text-lg font-extrabold text-slate-800 dark:text-white">{inputs.creditScore}</p>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-slate-700/10 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Debt-to-Income (DTI)</span>
                      <p className="text-lg font-extrabold text-slate-800 dark:text-white">
                        {Math.round((inputs.existingEMI / (inputs.monthlyIncome || 1)) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ensemble Model Consensus (Unique College Project Value-Add!) */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">Ensemble Model Outputs</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Random Forest Classifier (Primary)</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white">{(result.modelPredictions.randomForestProb * 100).toFixed(0)}% Probability</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Logistic Regression</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white">{(result.modelPredictions.logisticRegressionProb * 100).toFixed(0)}% Probability</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Decision Tree Classifier</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white">{result.modelPredictions.decisionTreePred === 1 ? "⚠️ High Risk Prediction" : "✅ Low Risk Prediction"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 print:hidden">
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                  <Printer className="h-4 w-4" /> Print / Save PDF Report
                </button>
                <button
                  onClick={downloadPredictionCSV}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-all shadow-sm"
                >
                  <Download className="h-4 w-4" /> Export Report data as CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
