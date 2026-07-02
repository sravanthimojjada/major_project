/**
 * Machine Learning Utilities for Indian Loan Default Prediction System.
 * Contains pure TypeScript implementations of:
 * 1. Label Encoder & Feature Scaler
 * 2. Logistic Regression (via Gradient Descent)
 * 3. Decision Tree Classifier (using Gini Impurity)
 * 4. Random Forest Classifier (using Bagged Decision Trees)
 * 
 * Perfect for a college major project to demonstrate the inner workings of ML models!
 */

export interface LoanRecord {
  id: string;
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
  defaultStatus: number; // 0 or 1
}

// Features to use for training
export const FEATURE_COLS = [
  "age", "gender", "maritalStatus", "education", "employmentType",
  "monthlyIncome", "existingEMI", "loanAmount", "loanTerm",
  "interestRate", "creditScore", "dependents", "propertyOwnership",
  "cityTier", "existingLoans", "loanPurpose"
];

// Helper to encode categorical variables
export class SimpleLabelEncoder {
  private mappings: Record<string, Record<string, number>> = {};
  private reverseMappings: Record<string, Record<number, string>> = {};

  fit(data: LoanRecord[], columns: string[]) {
    columns.forEach(col => {
      const uniqueVals = Array.from(new Set(data.map(r => String((r as any)[col]))));
      this.mappings[col] = {};
      this.reverseMappings[col] = {};
      uniqueVals.forEach((val, idx) => {
        this.mappings[col][val] = idx;
        this.reverseMappings[col][idx] = val;
      });
    });
  }

  transformValue(column: string, value: any): number {
    const valStr = String(value);
    if (this.mappings[column] && this.mappings[column][valStr] !== undefined) {
      return this.mappings[column][valStr];
    }
    // Fallback for unseen values
    return 0;
  }

  transformRecord(r: LoanRecord): number[] {
    return FEATURE_COLS.map(col => {
      const val = (r as any)[col];
      if (typeof val === "number") {
        return val;
      }
      return this.transformValue(col, val);
    });
  }
}

// Standard Scaler for numerical columns
export class StandardScaler {
  private means: number[] = [];
  private stds: number[] = [];
  private numericalIndices: number[] = [];

  constructor(numericalIndices: number[]) {
    this.numericalIndices = numericalIndices;
  }

  fit(X: number[][]) {
    const numFeatures = X[0].length;
    this.means = new Array(numFeatures).fill(0);
    this.stds = new Array(numFeatures).fill(1);

    this.numericalIndices.forEach(idx => {
      let sum = 0;
      for (let i = 0; i < X.length; i++) {
        sum += X[i][idx];
      }
      const mean = sum / X.length;
      this.means[idx] = mean;

      let varianceSum = 0;
      for (let i = 0; i < X.length; i++) {
        varianceSum += Math.pow(X[i][idx] - mean, 2);
      }
      const std = Math.sqrt(varianceSum / X.length) || 1;
      this.stds[idx] = std;
    });
  }

  transform(X: number[][]): number[][] {
    return X.map(row => {
      const newRow = [...row];
      this.numericalIndices.forEach(idx => {
        newRow[idx] = (newRow[idx] - this.means[idx]) / this.stds[idx];
      });
      return newRow;
    });
  }
}

// 1. LOGISTIC REGRESSION
export class LogisticRegression {
  private weights: number[] = [];
  private bias: number = 0;
  private learningRate: number;
  private iterations: number;

  constructor(learningRate = 0.1, iterations = 1000) {
    this.learningRate = learningRate;
    this.iterations = iterations;
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
  }

  fit(X: number[][], y: number[]) {
    const numSamples = X.length;
    const numFeatures = X[0].length;
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    for (let iter = 0; iter < this.iterations; iter++) {
      let dw = new Array(numFeatures).fill(0);
      let db = 0;

      for (let i = 0; i < numSamples; i++) {
        let linearModel = this.bias;
        for (let j = 0; j < numFeatures; j++) {
          linearModel += X[i][j] * this.weights[j];
        }

        const yPred = this.sigmoid(linearModel);
        const error = yPred - y[i];

        db += error;
        for (let j = 0; j < numFeatures; j++) {
          dw[j] += error * X[i][j];
        }
      }

      this.bias -= (this.learningRate * db) / numSamples;
      for (let j = 0; j < numFeatures; j++) {
        this.weights[j] -= (this.learningRate * dw[j]) / numSamples;
      }
    }
  }

  predictProb(X: number[][]): number[] {
    return X.map(row => {
      let linearModel = this.bias;
      for (let j = 0; j < row.length; j++) {
        linearModel += row[j] * this.weights[j];
      }
      return this.sigmoid(linearModel);
    });
  }

  predict(X: number[][], threshold = 0.5): number[] {
    return this.predictProb(X).map(prob => (prob >= threshold ? 1 : 0));
  }

  getWeights(): number[] {
    return this.weights;
  }
}

// 2. DECISION TREE CLASSIFIER
interface TreeNode {
  featureIdx?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  value?: number; // Class label if leaf node
  isLeaf: boolean;
}

export class DecisionTreeClassifier {
  private maxDepth: number;
  private minSamplesSplit: number;
  private root: TreeNode | null = null;
  public featureImportances: number[] = [];

  constructor(maxDepth = 5, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  private calculateGini(y: number[]): number {
    if (y.length === 0) return 0;
    const counts = y.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    let impurity = 1;
    const total = y.length;
    for (const key in counts) {
      const p = counts[key] / total;
      impurity -= p * p;
    }
    return impurity;
  }

  private split(X: number[][], y: number[], featureIdx: number, threshold: number) {
    const leftX: number[][] = [];
    const leftY: number[] = [];
    const rightX: number[][] = [];
    const rightY: number[] = [];

    for (let i = 0; i < X.length; i++) {
      if (X[i][featureIdx] <= threshold) {
        leftX.push(X[i]);
        leftY.push(y[i]);
      } else {
        rightX.push(X[i]);
        rightY.push(y[i]);
      }
    }

    return { leftX, leftY, rightX, rightY };
  }

  private findBestSplit(X: number[][], y: number[]) {
    let bestGiniGain = -1;
    let bestFeatureIdx = -1;
    let bestThreshold = -1;

    const currentGini = this.calculateGini(y);
    const numFeatures = X[0].length;

    for (let featIdx = 0; featIdx < numFeatures; featIdx++) {
      // Collect unique values for threshold candidates
      const thresholds = Array.from(new Set(X.map(row => row[featIdx])));
      thresholds.forEach(thresh => {
        const { leftY, rightY } = this.split(X, y, featIdx, thresh);
        if (leftY.length === 0 || rightY.length === 0) return;

        const leftGini = this.calculateGini(leftY);
        const rightGini = this.calculateGini(rightY);

        const weightedGini = (leftY.length / y.length) * leftGini + (rightY.length / y.length) * rightGini;
        const giniGain = currentGini - weightedGini;

        if (giniGain > bestGiniGain) {
          bestGiniGain = giniGain;
          bestFeatureIdx = featIdx;
          bestThreshold = thresh;
        }
      });
    }

    return { bestFeatureIdx, bestThreshold, bestGiniGain };
  }

  private buildTree(X: number[][], y: number[], depth = 0): TreeNode {
    const numSamples = X.length;
    const numFeatures = X[0].length;
    const uniqueClasses = Array.from(new Set(y));

    // Base cases
    if (uniqueClasses.length === 1) {
      return { isLeaf: true, value: uniqueClasses[0] };
    }

    if (depth >= this.maxDepth || numSamples < this.minSamplesSplit) {
      const mostCommon = this.getMostCommonClass(y);
      return { isLeaf: true, value: mostCommon };
    }

    const { bestFeatureIdx, bestThreshold, bestGiniGain } = this.findBestSplit(X, y);

    if (bestGiniGain <= 0 || bestFeatureIdx === -1) {
      const mostCommon = this.getMostCommonClass(y);
      return { isLeaf: true, value: mostCommon };
    }

    // Accumulate feature importances
    this.featureImportances[bestFeatureIdx] = (this.featureImportances[bestFeatureIdx] || 0) + bestGiniGain;

    const { leftX, leftY, rightX, rightY } = this.split(X, y, bestFeatureIdx, bestThreshold);

    const leftChild = this.buildTree(leftX, leftY, depth + 1);
    const rightChild = this.buildTree(rightX, rightY, depth + 1);

    return {
      isLeaf: false,
      featureIdx: bestFeatureIdx,
      threshold: bestThreshold,
      left: leftChild,
      right: rightChild
    };
  }

  private getMostCommonClass(y: number[]): number {
    const counts = y.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    let maxCount = -1;
    let commonClass = 0;
    for (const key in counts) {
      if (counts[key] > maxCount) {
        maxCount = counts[key];
        commonClass = Number(key);
      }
    }
    return commonClass;
  }

  fit(X: number[][], y: number[]) {
    const numFeatures = X[0].length;
    this.featureImportances = new Array(numFeatures).fill(0);
    this.root = this.buildTree(X, y, 0);

    // Normalize feature importances
    const sum = this.featureImportances.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      this.featureImportances = this.featureImportances.map(v => v / sum);
    }
  }

  private predictRow(node: TreeNode, row: number[]): number {
    if (node.isLeaf) {
      return node.value!;
    }
    const val = row[node.featureIdx!];
    if (val <= node.threshold!) {
      return this.predictRow(node.left!, row);
    } else {
      return this.predictRow(node.right!, row);
    }
  }

  predict(X: number[][]): number[] {
    if (!this.root) throw new Error("Model not trained!");
    return X.map(row => this.predictRow(this.root!, row));
  }
}

// 3. RANDOM FOREST CLASSIFIER
export class RandomForestClassifier {
  private numTrees: number;
  private maxDepth: number;
  private minSamplesSplit: number;
  private trees: DecisionTreeClassifier[] = [];
  public featureImportances: number[] = [];

  constructor(numTrees = 10, maxDepth = 6, minSamplesSplit = 2) {
    this.numTrees = numTrees;
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  fit(X: number[][], y: number[]) {
    this.trees = [];
    const numFeatures = X[0].length;
    this.featureImportances = new Array(numFeatures).fill(0);

    for (let t = 0; t < this.numTrees; t++) {
      // Bootstrap sampling (sampling with replacement)
      const XSample: number[][] = [];
      const ySample: number[] = [];
      for (let i = 0; i < X.length; i++) {
        const randIdx = Math.floor(Math.random() * X.length);
        XSample.push(X[randIdx]);
        ySample.push(y[randIdx]);
      }

      const tree = new DecisionTreeClassifier(this.maxDepth, this.minSamplesSplit);
      tree.fit(XSample, ySample);
      this.trees.push(tree);

      // Accumulate feature importance
      for (let f = 0; f < numFeatures; f++) {
        this.featureImportances[f] += tree.featureImportances[f] || 0;
      }
    }

    // Normalize feature importances
    const sum = this.featureImportances.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      this.featureImportances = this.featureImportances.map(v => v / sum);
    }
  }

  predictProb(X: number[][]): number[] {
    return X.map(row => {
      let votesForDefault = 0;
      this.trees.forEach(tree => {
        const pred = tree.predict([row])[0];
        if (pred === 1) votesForDefault++;
      });
      return votesForDefault / this.numTrees;
    });
  }

  predict(X: number[][], threshold = 0.5): number[] {
    return this.predictProb(X).map(p => (p >= threshold ? 1 : 0));
  }
}

// Calculate confusion matrix and metrics
export function evaluateModel(predictions: number[], targets: number[]) {
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (let i = 0; i < targets.length; i++) {
    const p = predictions[i];
    const t = targets[i];
    if (p === 1 && t === 1) tp++;
    else if (p === 1 && t === 0) fp++;
    else if (p === 0 && t === 0) tn++;
    else if (p === 0 && t === 1) fn++;
  }

  const accuracy = (tp + tn) / targets.length;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    accuracy,
    precision,
    recall,
    f1Score,
    confusionMatrix: [
      [tn, fp],
      [fn, tp]
    ]
  };
}
