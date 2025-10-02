import { useState } from 'react';
import { Sun, FileText, Menu, X } from 'lucide-react';
import SolarAnalyzerPage from './pages/SolarAnalyzerPage';
import BillAnalyzerPage from './pages/BillAnalyzerPage';

type Page = 'solar' | 'bill';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('solar');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg relative z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Sun className="w-8 h-8" />
              <h1 className="text-xl md:text-2xl font-bold">EnerVision Hub</h1>
            </div>
            <div className="text-xs md:text-sm bg-white/20 px-3 md:px-4 py-2 rounded-full backdrop-blur-sm">
              Energy Analysis Platform
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:relative z-10 w-64 bg-white border-r border-gray-200 transition-transform duration-300 h-full`}
        >
          <nav className="p-4 space-y-2">
            <button
              onClick={() => {
                setCurrentPage('solar');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'solar'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Sun size={20} />
              <span>Solar Potential Analyzer</span>
            </button>
            <button
              onClick={() => {
                setCurrentPage('bill');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'bill'
                  ? 'bg-orange-100 text-orange-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText size={20} />
              <span>Electricity Bill Analyzer</span>
            </button>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p className="font-semibold text-gray-700 mb-1">EnerVision Hub</p>
              <p>Your one-stop energy analysis platform</p>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-[5]"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-hidden">
          {currentPage === 'solar' && <SolarAnalyzerPage />}
          {currentPage === 'bill' && <BillAnalyzerPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
