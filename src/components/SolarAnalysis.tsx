import { Sun, Zap, DollarSign, TrendingUp, Loader2 } from 'lucide-react';

interface SolarData {
  maxSunshineHoursPerYear: number;
  maxArrayPanelsCount: number;
  maxArrayAreaMeters2: number;
  yearlyEnergyDcKwh: number;
  panelCapacityWatts: number;
  roofSegmentStats?: Array<{
    pitchDegrees: number;
    azimuthDegrees: number;
    stats: {
      areaMeters2: number;
      sunshineQuantiles: number[];
      groundAreaMeters2: number;
    };
  }>;
}

interface SolarAnalysisProps {
  data: SolarData | null;
  loading: boolean;
  error: string | null;
  address?: string;
}

export default function SolarAnalysis({ data, loading, error, address }: SolarAnalysisProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing solar potential...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Analysis Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center max-w-md">
          <Sun className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Select a Location
          </h3>
          <p className="text-gray-500">
            Click on the map, use your current location, or search for an address to analyze solar potential
          </p>
        </div>
      </div>
    );
  }

  const avgDailySunHours = (data.maxSunshineHoursPerYear / 365).toFixed(1);
  const estimatedAnnualSavings = (data.yearlyEnergyDcKwh * 0.13).toFixed(0);
  const co2OffsetTons = (data.yearlyEnergyDcKwh * 0.0004).toFixed(1);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="p-6 space-y-6">
        {address && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-500">Location</p>
            <p className="text-gray-800 font-medium">{address}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sun className="text-orange-500" />
            Solar Potential Analysis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="text-orange-600" size={24} />
                <p className="text-sm text-gray-600">Daily Sun Hours (Avg)</p>
              </div>
              <p className="text-3xl font-bold text-orange-700">{avgDailySunHours}</p>
              <p className="text-xs text-gray-500 mt-1">hours per day</p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="text-blue-600" size={24} />
                <p className="text-sm text-gray-600">Annual Sunshine</p>
              </div>
              <p className="text-3xl font-bold text-blue-700">
                {data.maxSunshineHoursPerYear.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">hours per year</p>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="text-green-600" size={24} />
                <p className="text-sm text-gray-600">Annual Energy Production</p>
              </div>
              <p className="text-3xl font-bold text-green-700">
                {data.yearlyEnergyDcKwh.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">kWh per year</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-emerald-600" size={24} />
                <p className="text-sm text-gray-600">Estimated Annual Savings</p>
              </div>
              <p className="text-3xl font-bold text-emerald-700">
                ${estimatedAnnualSavings}
              </p>
              <p className="text-xs text-gray-500 mt-1">at $0.13/kWh</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Rooftop Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Available Roof Area</p>
              <p className="text-2xl font-bold text-gray-800">
                {data.maxArrayAreaMeters2.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">square meters</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Max Panel Count</p>
              <p className="text-2xl font-bold text-gray-800">
                {data.maxArrayPanelsCount}
              </p>
              <p className="text-xs text-gray-500">solar panels</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Panel Capacity</p>
              <p className="text-2xl font-bold text-gray-800">
                {data.panelCapacityWatts}
              </p>
              <p className="text-xs text-gray-500">watts per panel</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" />
            Environmental Impact
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-gray-700 mb-2">
              Installing solar panels at this location would offset approximately:
            </p>
            <p className="text-3xl font-bold text-green-700 mb-1">
              {co2OffsetTons} tons
            </p>
            <p className="text-sm text-gray-600">
              of CO₂ emissions per year - equivalent to planting {Math.round(parseFloat(co2OffsetTons) * 45)} trees
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
