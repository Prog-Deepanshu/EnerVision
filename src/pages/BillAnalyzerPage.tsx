import { useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import BillResults from '../components/BillResults';
import { BillAnalysisResult } from '../types/bill';
import { analyzeBill } from '../services/geminiApi';

export default function BillAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BillAnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a valid image (JPG, PNG) or PDF file');
        setFile(null);
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeBill(file);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while analyzing the bill');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-800">Electricity Bill Analyzer</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Upload your electricity bill (image or PDF) to get detailed analysis, personalized recommendations,
            and solar panel suggestions tailored to your consumption patterns.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-400 transition-colors">
            <input
              type="file"
              id="bill-upload"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="bill-upload"
              className="cursor-pointer flex flex-col items-center gap-4"
            >
              <Upload className="w-16 h-16 text-gray-400" />
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG or PDF (Max 10MB)
                </p>
              </div>
            </label>
          </div>

          {file && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="mt-6 w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Bill...
              </>
            ) : (
              'Analyze Bill'
            )}
          </button>
        </div>

        {result && <BillResults result={result} />}
      </div>
    </div>
  );
}
