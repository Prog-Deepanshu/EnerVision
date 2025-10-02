const GOOGLE_MAPS_API_KEY = 'AIzaSyDummyKeyForDemo';

export interface SolarPotential {
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

export async function getSolarPotential(
  lat: number,
  lng: number
): Promise<SolarPotential> {
  const apiKey = GOOGLE_MAPS_API_KEY;

  const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No solar data available for this location. Try a different address with visible rooftops.');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    const solarPotential = data.solarPotential;
    const panelCapacityWatts = solarPotential?.panelCapacityWatts || 250;

    const maxArrayPanelsCount =
      solarPotential?.maxArrayPanelsCount ||
      Math.floor(solarPotential?.maxArrayAreaMeters2 / 1.7);

    return {
      maxSunshineHoursPerYear: solarPotential?.maxSunshineHoursPerYear || 0,
      maxArrayPanelsCount,
      maxArrayAreaMeters2: solarPotential?.maxArrayAreaMeters2 || 0,
      yearlyEnergyDcKwh: solarPotential?.maxArrayPanelsCount
        ? solarPotential.maxArrayPanelsCount * panelCapacityWatts *
          (solarPotential.maxSunshineHoursPerYear / 1000)
        : 0,
      panelCapacityWatts,
      roofSegmentStats: solarPotential?.roofSegmentStats || [],
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch solar data. Please check your API key configuration.');
  }
}

export function generateMockSolarData(lat: number): SolarPotential {
  const baseHours = 1200 + (lat * 10);
  const maxSunshineHoursPerYear = Math.max(800, Math.min(2500, baseHours));
  const maxArrayAreaMeters2 = 50 + Math.random() * 100;
  const maxArrayPanelsCount = Math.floor(maxArrayAreaMeters2 / 1.7);
  const panelCapacityWatts = 350;
  const yearlyEnergyDcKwh = maxArrayPanelsCount * panelCapacityWatts * (maxSunshineHoursPerYear / 1000);

  return {
    maxSunshineHoursPerYear,
    maxArrayPanelsCount,
    maxArrayAreaMeters2,
    yearlyEnergyDcKwh,
    panelCapacityWatts,
    roofSegmentStats: [
      {
        pitchDegrees: 15 + Math.random() * 20,
        azimuthDegrees: 180 + Math.random() * 40 - 20,
        stats: {
          areaMeters2: maxArrayAreaMeters2 * 0.6,
          sunshineQuantiles: [800, 1000, 1200, 1400, 1600],
          groundAreaMeters2: maxArrayAreaMeters2 * 0.55,
        },
      },
    ],
  };
}
