import React from "react";
import { Info, CheckCircle, Database, Cpu, Milestone, Rocket, Server, Layout } from "lucide-react";

export default function AboutProject() {
  const sections = [
    {
      id: "section-objective",
      title: "Project Objective",
      icon: Info,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      content: (
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          The primary objective of the <strong>Indian Loan Default Prediction System</strong> is to empower banks and credit institutions with real-time risk assessment dashboards. By analyzing borrower profiles (e.g. CIBIL score, Debt-To-Income levels, employment classifications) using machine learning algorithms, the system outputs immediate approvals or risk warning recommendations.
        </p>
      )
    },
    {
      id: "section-features",
      title: "Key Functional Features",
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      content: (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300">
          <li className="flex items-center gap-2">🟢 Real-Time Risk Predictions</li>
          <li className="flex items-center gap-2">🟢 Ensemble Model Consensus</li>
          <li className="flex items-center gap-2">🟢 Interactive Dataset Overview</li>
          <li className="flex items-center gap-2">🟢 Sorting & Server Pagination</li>
          <li className="flex items-center gap-2">🟢 Interactive Performance Metrics</li>
          <li className="flex items-center gap-2">🟢 Confusion Matrix Visualizers</li>
          <li className="flex items-center gap-2">🟢 Report Generation as PDF & CSV</li>
          <li className="flex items-center gap-2">🟢 Native Dark Mode Compatibility</li>
        </ul>
      )
    },
    {
      id: "section-dataset",
      title: "Dataset Information",
      icon: Database,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            The dataset consists of 250 realistic customer files representing diverse socio-economic borrow ranges across Indian Tier 1, Tier 2, and Tier 3 cities.
          </p>
          <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-xs font-mono space-y-1">
            <div>• Numerical dimensions: Age, Monthly Income, Existing EMI, Loan Amount, Term, Interest Rate, CIBIL, Dependents</div>
            <div>• Categorical dimensions: Gender, Marital Status, Education, Employment, Property Ownership, City Tier, Existing Loans, Loan Purpose</div>
          </div>
        </div>
      )
    },
    {
      id: "section-algorithms",
      title: "Machine Learning Algorithms",
      icon: Cpu,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      content: (
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>
            To align with rigorous academic and project evaluation requirements, the backend executes three standard classification models in parallel:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-100 dark:border-slate-700 p-4 rounded-xl space-y-1.5 bg-white dark:bg-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white">Random Forest</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Primary model. Spawns 15 bootstrapped Decision Tree estimators with majority-voting ensemble consensus.
              </p>
            </div>
            <div className="border border-slate-100 dark:border-slate-700 p-4 rounded-xl space-y-1.5 bg-white dark:bg-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white">Decision Tree</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Single-tree classifier dividing applicant nodes via recursive splitting on Gini Impurity.
              </p>
            </div>
            <div className="border border-slate-100 dark:border-slate-700 p-4 rounded-xl space-y-1.5 bg-white dark:bg-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white">Logistic Regression</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Continuous probabilistic regression classification fitted via gradient descent optimization.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "section-tech",
      title: "Technologies Utilized",
      icon: Milestone,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-2.5">
            <Layout className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-950 dark:text-white">Frontend Framework</h4>
              <p className="text-xs text-slate-400">React 19 + TypeScript, styled beautifully using Vite and modern Tailwind CSS configurations.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Server className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-950 dark:text-white">Backend Engine</h4>
              <p className="text-xs text-slate-400">Node.js Express full-stack architecture serving REST endpoints with lightning-fast training models.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "section-future",
      title: "Academic & Future Scope",
      icon: Rocket,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      content: (
        <ul className="space-y-2 text-xs md:text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-1.5">
            <span>🚀</span>
            <span><strong>Alternative Classifiers:</strong> Expanding benchmarks to encompass Support Vector Machines (SVM), Naive Bayes, and Gradient Boosted trees (XGBoost).</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span>🚀</span>
            <span><strong>Live Bank Integrations:</strong> Exposing prediction endpoints securely via authenticated OAuth pipelines for automated core banking APIs.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span>🚀</span>
            <span><strong>Advanced Explainable AI (XAI):</strong> Embedding local explanation frameworks like SHAP/LIME to provide natural language justifications for specific rejections.</span>
          </li>
        </ul>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="about-project-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 font-display">
          <Info className="h-7 w-7 text-blue-600" />
          About Project
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Academic and implementation specification sheet detailing algorithmic, data, and design parameters.
        </p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 gap-6">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              id={section.id}
              className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${section.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">{section.title}</h3>
              </div>
              <div className="border-t border-slate-50 dark:border-slate-700/50 pt-4">
                {section.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
