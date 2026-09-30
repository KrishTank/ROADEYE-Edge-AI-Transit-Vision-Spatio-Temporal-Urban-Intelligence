/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modular Polar Weather Widget Component
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React from 'react';
import { StationId } from '../../types';
import { STATIONS_DATA } from '../../data/stationConstants';
import { TemperatureChart } from './TemperatureChart';
import { WindChart } from './WindChart';
import { PressureChart } from './PressureChart';
import { ForecastStrip } from './ForecastStrip';
import { WindCompass } from './WindCompass';
import { KatabaticPrediction } from './KatabaticPrediction';

interface WeatherWidgetProps {
  activeStation: StationId;
  temperature: number;
  windSpeed: number;
  pressure?: number;
  windDirection?: number;
  forecast?: any[];
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  activeStation,
  temperature,
  windSpeed,
  pressure = 986.4,
  windDirection = 140,
  forecast
}) => {
  const station = STATIONS_DATA[activeStation];

  return (
    <div className="space-y-6">
      {/* 2x2 LIVE GRAPHS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TemperatureChart currentTemp={temperature} />
        <WindChart currentWind={windSpeed} />
        <PressureChart currentPressure={pressure} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WindCompass windDirection={windDirection} windSpeed={windSpeed} temperature={temperature} />
          <KatabaticPrediction windSpeed={windSpeed} pressure={pressure} />
        </div>
      </div>

      {/* 7-DAY FORECAST STRIP */}
      <ForecastStrip forecast={forecast} />
    </div>
  );
};
