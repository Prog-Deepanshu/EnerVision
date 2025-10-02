/// <reference types="vite/client" />

interface Window {
  google: typeof google;
}

declare namespace google.maps {
  class Map {
    constructor(element: HTMLElement, options?: MapOptions);
    addListener(eventName: string, handler: Function): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
    setCenter(latLng: LatLng | LatLngLiteral): void;
  }

  interface MapOptions {
    center: LatLngLiteral;
    zoom: number;
    mapTypeId?: string;
    tilt?: number;
    mapTypeControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class LatLng {
    lat(): number;
    lng(): number;
  }

  class Marker {
    constructor(options?: MarkerOptions);
    setMap(map: Map | null): void;
  }

  interface MarkerOptions {
    position: LatLngLiteral;
    map?: Map;
    animation?: Animation;
  }

  enum Animation {
    BOUNCE,
    DROP,
  }

  interface MapMouseEvent {
    latLng: LatLng | null;
  }

  class Geocoder {
    geocode(
      request: GeocoderRequest,
      callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
    ): void;
  }

  interface GeocoderRequest {
    address?: string;
    location?: LatLng | LatLngLiteral;
  }

  interface GeocoderResult {
    formatted_address: string;
    geometry: {
      location: LatLng;
    };
  }

  type GeocoderStatus = 'OK' | 'ZERO_RESULTS' | 'ERROR';
}
