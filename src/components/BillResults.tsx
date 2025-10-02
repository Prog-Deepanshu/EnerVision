import { FileText, TrendingUp, TrendingDown, Minus, Sun, DollarSign, Lightbulb, AlertCircle } from 'lucide-react';
import { BillAnalysisResult } from '../types/bill';

interface BillResultsProps {
  result: BillAnalysisResult;
}

export default function BillResults({ result }: BillResultsProps) {
  const { billInfo, analysis, solarSuggestion, recommendations, savingsWithSolar } = result;

  const getTrendIcon = () => {
    if (!analysis.comparisonWithPrevious) return null;
    const { trend } = analysis.comparisonWithPrevious;
    if (trend === 'increase') return <TrendingUp className="text-red-600" size={20} />;
    if (trend === 'decrease') return <TrendingDown className="text-green-600" size={20} />;
    return <Minus className="text-gray-600" size={20} />;
  };

  const getTrendColor = () => {
    if (!analysis.comparisonWithPrevious) return 'text-gray-600';
    const { trend } = analysis.comparisonWithPrevious;
    if (trend === 'increase') return 'text-red-600';
    if (trend === 'decrease') return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">Bill Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Billing Period</p>
            <p className="text-lg font-semibold text-gray-800">{billInfo.billingPeriod}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Units Consumed</p>
            <p className="text-lg font-semibold text-gray-800">{billInfo.unitsConsumed} kWh</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-lg font-semibold text-gray-800">
              {billInfo.currency} {billInfo.totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Tariff Type</p>
            <p className="text-lg font-semibold text-gray-800">{billInfo.tariffType}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-800">Usage Analysis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Average Daily Usage</p>
            <p className="text-2xl font-bold text-gray-800">{analysis.averageDailyUsage.toFixed(1)}</p>
            <p className="text-xs text-gray-500">kWh per day</p>
          </div>
          {analysis.comparisonWithPrevious && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">vs Previous Month</p>
              <div className="flex items-center gap-2">
                {getTrendIcon()}
                <p className={`text-2xl font-bold ${getTrendColor()}`}>
                  {Math.abs(analysis.comparisonWithPrevious.change)}%
                </p>
              </div>
              <p className="text-xs text-gray-500 capitalize">{analysis.comparisonWithPrevious.trend}</p>
            </div>
          )}
          <div className="p-4 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Yearly Projection</p>
            <p className="text-2xl font-bold text-gray-800">
              {billInfo.currency} {analysis.yearlyProjection.cost.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{analysis.yearlyProjection.units.toLocaleString()} kWh/year</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-orange-200">
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl font-bold text-gray-800">Solar Panel Suggestion</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Recommended System Size</p>
            <p className="text-2xl font-bold text-orange-700">{solarSuggestion.recommendedSystemSize}</p>
            <p className="text-xs text-gray-500">kW</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Estimated Panels</p>
            <p className="text-2xl font-bold text-orange-700">{solarSuggestion.estimatedPanels}</p>
            <p className="text-xs text-gray-500">solar panels</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Estimated Cost</p>
            <p className="text-2xl font-bold text-orange-700">
              {billInfo.currency} {solarSuggestion.estimatedCost.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">initial investment</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <p className="text-sm text-gray-600 mb-1">Payback Period</p>
            <p className="text-2xl font-bold text-orange-700">{solarSuggestion.paybackPeriod}</p>
            <p className="text-xs text-gray-500">years</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-800">Cost Comparison: With vs Without Solar</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Current Monthly Bill</p>
            <p className="text-3xl font-bold text-red-700">
              {billInfo.currency} {savingsWithSolar.monthlyBillWithoutSolar.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Without Solar Panels</p>
          </div>
          <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Projected Monthly Bill</p>
            <p className="text-3xl font-bold text-green-700">
              {billInfo.currency} {savingsWithSolar.monthlyBillWithSolar.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">With Solar Panels</p>
          </div>
        </div>
        <div className="mt-4 p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-2">Your Potential Savings</p>
            <p className="text-4xl font-bold text-green-700 mb-1">
              {billInfo.currency} {savingsWithSolar.monthlySavings.toLocaleString()}/month
            </p>
            <p className="text-lg text-green-600 font-semibold">
              {billInfo.currency} {savingsWithSolar.annualSavings.toLocaleString()}/year
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl font-bold text-gray-800">Personalized Recommendations</h3>
        </div>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
