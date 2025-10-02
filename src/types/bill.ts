export interface BillAnalysisResult {
  billInfo: {
    billingPeriod: string;
    unitsConsumed: number;
    totalAmount: number;
    currency: string;
    tariffType: string;
  };
  analysis: {
    averageDailyUsage: number;
    comparisonWithPrevious?: {
      change: number;
      trend: 'increase' | 'decrease' | 'stable';
    };
    yearlyProjection: {
      units: number;
      cost: number;
    };
  };
  solarSuggestion: {
    recommendedSystemSize: number;
    estimatedPanels: number;
    estimatedCost: number;
    paybackPeriod: number;
  };
  recommendations: string[];
  savingsWithSolar: {
    monthlyBillWithoutSolar: number;
    monthlyBillWithSolar: number;
    monthlySavings: number;
    annualSavings: number;
  };
}
