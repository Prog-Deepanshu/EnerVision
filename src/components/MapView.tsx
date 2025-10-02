import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapViewProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
}

export default function MapView({ onLocationSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{name: string, lat: number, lon: number}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    setTimeout(() => {
      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [37.7749, -122.4194],
        zoom: 18,
        zoomControl: true,
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
      }).addTo(map);

      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        updateMarker(lat, lng);
        onLocationSelect(lat, lng);
      });

      mapInstanceRef.current = map;
      setMapReady(true);
    }, 100);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);

    markerRef.current = marker;
    mapInstanceRef.current.panTo([lat, lng]);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateMarker(lat, lng);
        mapInstanceRef.current?.setView([lat, lng], 18);
        onLocationSelect(lat, lng);
      },
      (error) => {
        alert('Unable to retrieve your location: ' + error.message);
      }
    );
  };

  const isCoordinates = (input: string): { lat: number; lng: number } | null => {
    const patterns = [
      /^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/,
      /^(-?\d+\.\d+)[\s]+(-?\d+\.\d+)$/,
      /^(-?\d+)[,\s]+(-?\d+)$/,
    ];

    for (const pattern of patterns) {
      const match = input.trim().match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }
    return null;
  };

  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || isCoordinates(query)) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setSuggestions(data.map((item: any) => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        })));
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.trim()) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: {name: string, lat: number, lon: number}) => {
    setSearchInput(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    updateMarker(suggestion.lat, suggestion.lon);
    mapInstanceRef.current?.setView([suggestion.lat, suggestion.lon], 18);
    onLocationSelect(suggestion.lat, suggestion.lon, suggestion.name);
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    const coords = isCoordinates(searchInput);
    if (coords) {
      updateMarker(coords.lat, coords.lng);
      mapInstanceRef.current?.setView([coords.lat, coords.lng], 18);
      onLocationSelect(coords.lat, coords.lng, `${coords.lat}, ${coords.lng}`);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        updateMarker(lat, lng);
        mapInstanceRef.current?.setView([lat, lng], 18);
        onLocationSelect(lat, lng, data[0].display_name);
        setShowSuggestions(false);
      } else {
        alert('Location not found. Please try coordinates (e.g., 37.7749, -122.4194) or a different address.');
      }
    } catch (error) {
      alert('Error searching for location. Please try again.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
        <div className="flex-1 relative">
          <div className="flex gap-2 bg-white rounded-lg shadow-lg p-2">
            <input
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter address or coordinates (e.g., 37.7749, -122.4194)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <MapPin size={20} />
              Search
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-[1001]">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-800 line-clamp-2">{suggestion.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleCurrentLocation}
          className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          title="Use current location"
        >
          <Navigation size={24} className="text-blue-600" />
        </button>
      </div>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
