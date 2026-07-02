export interface RecentApplication {
  id: string;
  age: number;
  gender: string;
  monthlyIncome: number;
  loanAmount: number;
  loanTerm: number;
  creditScore: number;
  loanPurpose: string;
  defaultStatus: number;
}

export interface DashboardData {
  totalCustomers: number;
  totalLoans: number;
  approvedLoans: number;
  defaultCases: number;
  avgLoanAmount: number;
  avgMonthlyIncome: number;
  recentApplications: RecentApplication[];
}

export interface PredictionInput {
  age: number;
  gender: string;
  maritalStatus: string;
  education: string;
  employmentType: string;
  monthlyIncome: number;
  existingEMI: number;
  loanAmount: number;
  loanTerm: number;
  interestRate: number;
  creditScore: number;
  dependents: number;
  propertyOwnership: string;
  cityTier: string;
  existingLoans: string;
  loanPurpose: string;
}

export interface PredictionResult {
  loanStatus: string;
  recommendation: string;
  statusColor: string;
  defaultProbability: number;
  riskScore: number;
  modelPredictions: {
    randomForestProb: number;
    decisionTreePred: number;
    logisticRegressionProb: number;
  };
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface PerformanceData {
  bestModelName: string;
  rfMetrics: ModelMetrics;
  dtMetrics: ModelMetrics;
  lrMetrics: ModelMetrics;
  featureImportance: FeatureImportance[];
}

export interface DatasetResponse {
  totalRecords: number;
  records: any[];
  totalPages: number;
  currentPage: number;
}
