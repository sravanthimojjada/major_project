import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import {
  LoanRecord,
  FEATURE_COLS,
  SimpleLabelEncoder,
  StandardScaler,
  RandomForestClassifier,
  DecisionTreeClassifier,
  LogisticRegression,
  evaluateModel
} from "./src/utils/ml";

const app = express();
const PORT = 3000;
const CSV_PATH = path.join(process.cwd(), "dataset.csv");

app.use(express.json());

// In-memory cache for loaded data and trained models
let cachedData: LoanRecord[] = [];
let labelEncoder = new SimpleLabelEncoder();
let scaler = new StandardScaler([0, 5, 6, 7, 8, 9, 10, 11]); // Indices of numeric columns: age, monthlyIncome, existingEMI, loanAmount, loanTerm, interestRate, creditScore, dependents

// Model instances
let randomForest = new RandomForestClassifier(15, 6, 2);
let decisionTree = new DecisionTreeClassifier(5, 2);
let logisticReg = new LogisticRegression(0.05, 500);

// Metrics
let rfMetrics: any = null;
let dtMetrics: any = null;
let lrMetrics: any = null;
let bestModelName = "Random Forest Classifier";

// Helper to generate a highly realistic dataset
function generateDatasetCSV() {
  const purposes = ["Home", "Personal", "Education", "Vehicle", "Business"];
  const propertyTypes = ["Owned", "Rented", "Mortgaged"];
  const cityTiers = ["Tier 1", "Tier 2", "Tier 3"];
  const educations = ["Undergraduate", "Graduate", "Postgraduate"];
  const employments = ["Salaried", "Self-Employed", "Unemployed"];
  const genders = ["Male", "Female"];
  const maritalStatuses = ["Single", "Married"];

  let csvContent = "Customer ID,Age,Gender,Marital Status,Education,Employment Type,Monthly Income (INR),Existing EMI,Loan Amount (INR),Loan Term (Months),Interest Rate,Credit Score,Number of Dependents,Property Ownership,City Tier,Existing Loans,Loan Purpose,Default Status\n";

  for (let i = 1; i <= 250; i++) {
    const customerId = `CID-${1000 + i}`;
    const age = Math.floor(Math.random() * 40) + 22; // 22 to 61
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const maritalStatus = maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)];
    const education = educations[Math.floor(Math.random() * educations.length)];
    const employmentType = employments[Math.floor(Math.random() * employments.length)];
    
    // Monthly income correlated with education and employment
    let baseIncome = 25000;
    if (education === "Graduate") baseIncome += 15000;
    if (education === "Postgraduate") baseIncome += 35000;
    if (employmentType === "Salaried") baseIncome += 15000;
    if (employmentType === "Unemployed") baseIncome = 8000;
    
    const monthlyIncome = Math.floor(baseIncome + Math.random() * 40000);
    
    // Existing EMI
    const existingEMI = employmentType === "Unemployed" ? 0 : Math.random() < 0.6 ? Math.floor(Math.random() * (monthlyIncome * 0.3)) : 0;
    
    // Loan Amount based on income
    const maxLoan = employmentType === "Unemployed" ? 50000 : monthlyIncome * 15;
    const loanAmount = Math.floor(50000 + Math.random() * (maxLoan - 50000));
    const loanTerm = [12, 24, 36, 48, 60, 84, 120][Math.floor(Math.random() * 7)];
    
    // Interest rate correlated with credit score and term
    let baseRate = 8.5;
    if (loanTerm > 48) baseRate += 1.5;
    const interestRate = parseFloat((baseRate + Math.random() * 5).toFixed(1));
    
    // Credit Score (300 to 900)
    let creditScore = Math.floor(Math.random() * 600) + 300;
    if (employmentType === "Salaried" && monthlyIncome > 60000) {
      creditScore = Math.floor(Math.random() * 200) + 700; // Salaried usually has better credit score
    } else if (employmentType === "Unemployed") {
      creditScore = Math.floor(Math.random() * 250) + 300; // lower credit score for unemployed
    }
    
    const dependents = Math.floor(Math.random() * 4);
    const propertyOwnership = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const cityTier = cityTiers[Math.floor(Math.random() * cityTiers.length)];
    const existingLoans = Math.random() < 0.4 ? "Yes" : "No";
    const loanPurpose = purposes[Math.floor(Math.random() * purposes.length)];

    // Calculate Default Risk mathematically so models can actually "learn" something realistic
    let riskFactor = 0;
    if (creditScore < 550) riskFactor += 50;
    else if (creditScore < 650) riskFactor += 25;
    else if (creditScore > 750) riskFactor -= 20;

    const dti = existingEMI / (monthlyIncome || 1);
    if (dti > 0.4) riskFactor += 30;
    else if (dti > 0.2) riskFactor += 15;

    const lti = loanAmount / ((monthlyIncome || 1) * 12);
    if (lti > 5) riskFactor += 25;
    else if (lti > 3) riskFactor += 10;

    if (employmentType === "Unemployed") riskFactor += 40;
    else if (employmentType === "Self-Employed") riskFactor += 10;

    if (interestRate > 12) riskFactor += 15;
    if (existingLoans === "Yes") riskFactor += 10;

    const defaultProb = 1 / (1 + Math.exp(-(riskFactor - 35) / 12));
    const defaultStatus = Math.random() < defaultProb ? 1 : 0;

    csvContent += `${customerId},${age},${gender},${maritalStatus},${education},${employmentType},${monthlyIncome},${existingEMI},${loanAmount},${loanTerm},${interestRate},${creditScore},${dependents},${propertyOwnership},${cityTier},${existingLoans},${loanPurpose},${defaultStatus}\n`;
  }

  fs.writeFileSync(CSV_PATH, csvContent);
  console.log("Successfully generated realistic dataset.csv!");
}

// Custom parser to parse local dataset CSV safely
function loadAndParseCSV(): LoanRecord[] {
  if (!fs.existsSync(CSV_PATH)) {
    generateDatasetCSV();
  }

  const fileContent = fs.readFileSync(CSV_PATH, "utf-8");
  const lines = fileContent.trim().split("\n");
  const headers = lines[0].split(",");

  const records: LoanRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    // Simple robust comma-splitter (since we have no nested commas or quotes)
    const cols = lines[i].split(",");
    if (cols.length < headers.length) continue;

    records.push({
      id: cols[0],
      age: parseInt(cols[1]),
      gender: cols[2],
      maritalStatus: cols[3],
      education: cols[4],
      employmentType: cols[5],
      monthlyIncome: parseInt(cols[6]),
      existingEMI: parseInt(cols[7]),
      loanAmount: parseInt(cols[8]),
      loanTerm: parseInt(cols[9]),
      interestRate: parseFloat(cols[10]),
      creditScore: parseInt(cols[11]),
      dependents: parseInt(cols[12]),
      propertyOwnership: cols[13],
      cityTier: cols[14],
      existingLoans: cols[15],
      loanPurpose: cols[16],
      defaultStatus: parseInt(cols[17])
    });
  }

  return records;
}

// Initial Train Routine
function trainModels() {
  console.log("Training machine learning models...");
  cachedData = loadAndParseCSV();

  // Fit label encoder on all categorical columns
  labelEncoder.fit(cachedData, [
    "gender", "maritalStatus", "education", "employmentType",
    "propertyOwnership", "cityTier", "existingLoans", "loanPurpose"
  ]);

  // Map to numeric array representation for features
  const X_raw = cachedData.map(r => labelEncoder.transformRecord(r));
  const y = cachedData.map(r => r.defaultStatus);

  // Train scaler
  scaler.fit(X_raw);
  const X = scaler.transform(X_raw);

  // Split into train/test for honest performance reporting (80% train, 20% test)
  const trainSize = Math.floor(X.length * 0.8);
  
  // Quick deterministic shuffle of indices
  const indices = Array.from({ length: X.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = (i * 7 + 13) % (i + 1); // Simple pseudo-random index
    const temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }

  const trainIndices = indices.slice(0, trainSize);
  const testIndices = indices.slice(trainSize);

  const X_train = trainIndices.map(i => X[i]);
  const y_train = trainIndices.map(i => y[i]);
  const X_test = testIndices.map(i => X[i]);
  const y_test = testIndices.map(i => y[i]);

  // 1. Train Decision Tree
  decisionTree.fit(X_train, y_train);
  const dtPreds = decisionTree.predict(X_test);
  dtMetrics = evaluateModel(dtPreds, y_test);

  // 2. Train Logistic Regression
  logisticReg.fit(X_train, y_train);
  const lrPreds = logisticReg.predict(X_test);
  lrMetrics = evaluateModel(lrPreds, y_test);

  // 3. Train Random Forest (and select the best)
  randomForest.fit(X_train, y_train);
  const rfPreds = randomForest.predict(X_test);
  rfMetrics = evaluateModel(rfPreds, y_test);

  // Choose best model based on accuracy
  const dtAcc = dtMetrics.accuracy;
  const lrAcc = lrMetrics.accuracy;
  const rfAcc = rfMetrics.accuracy;

  const maxAcc = Math.max(dtAcc, lrAcc, rfAcc);
  if (maxAcc === rfAcc) {
    bestModelName = "Random Forest Classifier";
  } else if (maxAcc === dtAcc) {
    bestModelName = "Decision Tree Classifier";
  } else {
    bestModelName = "Logistic Regression";
  }

  console.log(`Model training complete!`);
  console.log(`Random Forest Accuracy: ${rfMetrics.accuracy.toFixed(3)}`);
  console.log(`Decision Tree Accuracy: ${dtMetrics.accuracy.toFixed(3)}`);
  console.log(`Logistic Regression Accuracy: ${lrMetrics.accuracy.toFixed(3)}`);
  console.log(`Best Model: ${bestModelName}`);
}

// Initial boot-up training
trainModels();

// 1. DASHBOARD API
app.get("/api/dashboard", (req, res) => {
  try {
    const data = cachedData;
    const totalCustomers = data.length;
    const totalLoans = data.length; // Each record is a loan application
    const approvedLoans = data.filter(r => r.defaultStatus === 0).length;
    const defaultCases = data.filter(r => r.defaultStatus === 1).length;

    const totalLoanAmt = data.reduce((acc, r) => acc + r.loanAmount, 0);
    const avgLoanAmount = totalCustomers > 0 ? Math.round(totalLoanAmt / totalCustomers) : 0;

    const totalIncome = data.reduce((acc, r) => acc + r.monthlyIncome, 0);
    const avgMonthlyIncome = totalCustomers > 0 ? Math.round(totalIncome / totalCustomers) : 0;

    const recentApplications = data.slice(-5).reverse();

    res.json({
      totalCustomers,
      totalLoans,
      approvedLoans,
      defaultCases,
      avgLoanAmount,
      avgMonthlyIncome,
      recentApplications
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. DATASET API
app.get("/api/dataset", (req, res) => {
  try {
    const { search, sortBy, sortOrder, page = "1", limit = "10" } = req.query;
    let filtered = [...cachedData];

    // Search filter (searches ID, Gender, Marital Status, Purpose, Employment, etc)
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        r =>
          r.id.toLowerCase().includes(q) ||
          r.gender.toLowerCase().includes(q) ||
          r.maritalStatus.toLowerCase().includes(q) ||
          r.employmentType.toLowerCase().includes(q) ||
          r.loanPurpose.toLowerCase().includes(q) ||
          r.propertyOwnership.toLowerCase().includes(q) ||
          String(r.age).includes(q) ||
          String(r.creditScore).includes(q)
      );
    }

    // Sorting
    if (sortBy) {
      const col = String(sortBy) as keyof LoanRecord;
      const order = sortOrder === "desc" ? -1 : 1;
      filtered.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (typeof valA === "number" && typeof valB === "number") {
          return (valA - valB) * order;
        }
        return String(valA).localeCompare(String(valB)) * order;
      });
    }

    // Pagination
    const p = parseInt(String(page));
    const lim = parseInt(String(limit));
    const totalRecords = filtered.length;
    const paginated = filtered.slice((p - 1) * lim, p * lim);

    res.json({
      totalRecords,
      records: paginated,
      totalPages: Math.ceil(totalRecords / lim),
      currentPage: p
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Provide route to download CSV directly
app.get("/api/dataset/download", (req, res) => {
  try {
    if (fs.existsSync(CSV_PATH)) {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=dataset.csv");
      res.send(fs.readFileSync(CSV_PATH, "utf-8"));
    } else {
      res.status(404).json({ error: "CSV Dataset not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. MODEL PERFORMANCE API
app.get("/api/model-performance", (req, res) => {
  try {
    // Feature Importances from Random Forest (or DT)
    const importanceScores = randomForest.featureImportances;
    const featureImportance = FEATURE_COLS.map((col, idx) => ({
      feature: col
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, str => str.toUpperCase())
        .replace("I N R", "INR"),
      importance: parseFloat((importanceScores[idx] || 0).toFixed(4))
    })).sort((a, b) => b.importance - a.importance);

    res.json({
      bestModelName,
      rfMetrics,
      dtMetrics,
      lrMetrics,
      featureImportance
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PREDICT API WITH ROBUST SERVER-SIDE VALIDATION
app.post("/api/predict", (req, res) => {
  try {
    const {
      age,
      gender,
      maritalStatus,
      education,
      employmentType,
      monthlyIncome,
      existingEMI,
      loanAmount,
      loanTerm,
      interestRate,
      creditScore,
      dependents,
      propertyOwnership,
      cityTier,
      existingLoans,
      loanPurpose
    } = req.body;

    // Strict validation
    if (typeof monthlyIncome !== "number" || monthlyIncome <= 0) {
      return res.status(400).json({ error: "Monthly Income must be greater than 0" });
    }
    if (typeof loanAmount !== "number" || loanAmount <= 0) {
      return res.status(400).json({ error: "Loan Amount must be greater than 0" });
    }
    if (typeof creditScore !== "number" || creditScore < 300 || creditScore > 900) {
      return res.status(400).json({ error: "Credit Score must be between 300 and 900" });
    }
    if (typeof interestRate !== "number" || interestRate <= 0) {
      return res.status(400).json({ error: "Interest Rate must be greater than 0" });
    }
    if (typeof loanTerm !== "number" || loanTerm <= 0) {
      return res.status(400).json({ error: "Loan Term must be greater than 0" });
    }

    // Build standard record structure for encoding (defaultStatus dummy is 0)
    const rawRecord: LoanRecord = {
      id: "PRED-001",
      age: Number(age),
      gender,
      maritalStatus,
      education: education || "Graduate",
      employmentType,
      monthlyIncome: Number(monthlyIncome),
      existingEMI: Number(existingEMI),
      loanAmount: Number(loanAmount),
      loanTerm: Number(loanTerm),
      interestRate: Number(interestRate),
      creditScore: Number(creditScore),
      dependents: Number(dependents),
      propertyOwnership: propertyOwnership || "Owned",
      cityTier: cityTier || "Tier 1",
      existingLoans,
      loanPurpose,
      defaultStatus: 0
    };

    const encoded = labelEncoder.transformRecord(rawRecord);
    const scaled = scaler.transform([encoded])[0];

    // Predict using our best trained models
    const rfProb = randomForest.predictProb([scaled])[0];
    const dtPred = decisionTree.predict([scaled])[0];
    const lrProb = logisticReg.predictProb([scaled])[0];

    // Majority voting or Random Forest probability
    const finalProb = parseFloat(rfProb.toFixed(3));
    const riskScore = Math.round(finalProb * 100);

    let status = "Low Default Risk";
    let recommendation = "Recommended for approval.";
    let statusColor = "green";

    if (riskScore >= 70) {
      status = "High Default Risk";
      recommendation = "Loan approval not recommended.";
      statusColor = "red";
    } else if (riskScore >= 40) {
      status = "Medium Default Risk";
      recommendation = "Manual verification recommended.";
      statusColor = "yellow";
    }

    res.json({
      loanStatus: status,
      recommendation,
      statusColor,
      defaultProbability: finalProb,
      riskScore,
      modelPredictions: {
        randomForestProb: rfProb,
        decisionTreePred: dtPred,
        logisticRegressionProb: lrProb
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
