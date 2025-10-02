import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import MapView from '../components/MapView';
import SolarAnalysis from '../components/SolarAnalysis';
import { generateMockSolarData, SolarPotential } from '../services/solarApi';

export default function SolarAnalyzerPage() {
  const [solarData, setSolarData] = useState<SolarPotential | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<string | undefined>();

  const handleLocationSelect = async (lat: number, lng: number, selectedAddress?: string) => {
    setLoading(true);
    setError(null);
    setAddress(selectedAddress);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockData = generateMockSolarData(lat);
      setSolarData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSolarData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle size={20} />
          <p className="text-sm">
            <strong>Demo Mode:</strong> Using simulated solar data based on latitude
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-3/5 h-64 lg:h-full relative">
          <MapView onLocationSelect={handleLocationSelect} />
        </div>

        <div className="w-full lg:w-2/5 flex-1 bg-white border-l border-gray-200 overflow-hidden">
          <SolarAnalysis
            data={solarData}
            loading={loading}
            error={error}
            address={address}
          />
        </div>
      </div>
    </div>
  );
}
