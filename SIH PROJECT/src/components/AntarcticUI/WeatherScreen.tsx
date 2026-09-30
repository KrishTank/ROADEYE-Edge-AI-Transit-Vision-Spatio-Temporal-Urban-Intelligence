/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Antarctic Weather Screen (High Visibility Wind & Subzero Telemetry)
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState } from 'react';
import { StationId } from '../../types';
import { STATIONS_DATA } from '../../data/stationConstants';
import { 
  ArrowLeft, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  Compass, 
  Radio, 
  ShieldAlert,
  CloudSnow
} from 'lucide-react';
import { mqttClient } from '../../services/mqttService';

interface WeatherScreenProps {
  activeStation: StationId;
  temperature: number;
  windSpeed: number;
  onBack: () => void;
}

export const WeatherScreen: React.FC<WeatherScreenProps> = ({
  activeStation,
  temperature,
  windSpeed,
  onBack
}) => {
  const station = STATIONS_DATA[activeStation];
  const [alertSent, setAlertSent] = useState(false);

  // Wind chill formula for Antarctica
  const windChill = Math.round(
    13.12 + 0.6215 * temperature - 11.37 * Math.pow(Math.max(windSpeed, 5), 0.16) + 0.3965 * temperature * Math.pow(Math.max(windSpeed, 5), 0.16)
  );

  const forecast6h = [
    { time: '+1h', temp: temperature - 1, wind: windSpeed + 4, icon: 'BLIZZARD' },
    { time: '+2h', temp: temperature - 2, wind: windSpeed + 8, icon: 'KATABATIC' },
    { time: '+3h', temp: temperature - 3, wind: windSpeed + 12, icon: 'STORM' },
    { time: '+4h', temp: temperature - 2, wind: windSpeed + 6, icon: 'BLIZZARD' },
    { time: '+5h', temp: temperature - 1, wind: windSpeed + 2, icon: 'SNOW' },
    { time: '+6h', temp: temperature, wind: windSpeed, icon: 'OVERCAST' }
  ];

  const handleAlertCommand = async () => {
    setAlertSent(true);
    await mqttClient.publish(`dhruvatwin/alerts/${activeStation}/WEATHER_SURGE`, {
      type: 'WEATHER_SURGE_FIELD_TRIGGER',
      station: activeStation,
      windSpeed,
      temperature,
      timestamp: Date.now()
    }, 2);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-4 border-[#FFFFFF] pb-4">
        <button
          onClick={onBack}
          className="antarctic-button h-[64px] px-6 flex items-center gap-3"
        >
          <ArrowLeft className="w-8 h-8 text-[#FFD700]" />
          <span>BACK</span>
        </button>
        <h2 className="antarctic-text-heading text-[#FFFFFF]">METEOROLOGICAL TELEMETRY</h2>
      </div>

      {/* CURRENT CONDITIONS HERO: 2-COLUMN BIG NUMBERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* TEMPERATURE */}
        <div className="antarctic-card flex flex-col justify-between h-[200px] border-[#00FFFF]">
          <div className="flex items-center justify-between">
            <span className="antarctic-text-heading text-[#AAAAAA]">AMBIENT TEMP</span>
            <Thermometer className="w-12 h-12 text-[#00FFFF]" />
          </div>
          <div className="antarctic-text-giant text-[#00FFFF] text-[48pt] leading-none">
            {temperature}°C
          </div>
          <div className="antarctic-text-body text-[#FFD700]">
            WIND CHILL: <strong className="text-[#FF0000]">{windChill}°C (EXTREME FROSTBITE RISK)</strong>
          </div>
        </div>

        {/* WIND SPEED */}
        <div className={`antarctic-card flex flex-col justify-between h-[200px] ${
          windSpeed > 80 ? 'border-[#FF0000] animate-pulse' : 'border-[#FFD700]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="antarctic-text-heading text-[#AAAAAA]">KATABATIC WIND</span>
            <Wind className="w-12 h-12 text-[#FFD700]" />
          </div>
          <div className="antarctic-text-giant text-[#FFD700] text-[48pt] leading-none">
            {windSpeed} <span className="text-[24pt]">KM/H</span>
          </div>
          <div className="antarctic-text-body text-[#FFFFFF]">
            GUSTS: <strong className="text-[#FF0000]">{(windSpeed * 1.25).toFixed(0)} KM/H</strong> · DIR: 154° SSE
          </div>
        </div>
      </div>

      {/* WIND CHILL WARNING CARD */}
      <div className="antarctic-card border-[#FF0000] bg-[#FF0000]/10 flex items-center gap-6 p-6">
        <AlertTriangle className="w-16 h-16 text-[#FF0000] shrink-0" />
        <div>
          <h3 className="antarctic-text-heading text-[#FF0000]">
            OUTDOOR EXPOSURE RESTRICTION: LEVEL 2 BLIZZARD
          </h3>
          <p className="antarctic-text-body text-[#FFFFFF] mt-1">
            Flesh exposure risk under 5 minutes. High-visibility thermal goggles and harness lifeline mandatory outside station perimeter.
          </p>
        </div>
      </div>

      {/* 6-HOUR FORECAST STRIP */}
      <div>
        <label className="antarctic-text-body text-[#00FFFF] block mb-3">
          6-HOUR HOURLY PRECIPITATION & WIND STRIP:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {forecast6h.map(item => (
            <div key={item.time} className="antarctic-card flex flex-col items-center justify-center p-3 text-center">
              <span className="antarctic-text-body text-[#FFD700]">{item.time}</span>
              <CloudSnow className="w-10 h-10 my-2 text-[#00FFFF]" />
              <span className="antarctic-text-mono text-[20pt] text-[#FFFFFF]">{item.temp}°C</span>
              <span className="text-[14pt] text-[#AAAAAA] font-bold">{item.wind} km/h</span>
            </div>
          ))}
        </div>
      </div>

      {/* SATELLITE PASS COUNTDOWN */}
      <div className="antarctic-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Radio className="w-10 h-10 text-[#00FF00]" />
          <div>
            <div className="antarctic-text-body text-[#AAAAAA]">NEXT LEO PASS (OCEANSAT-3 / NOAA-20):</div>
            <div className="antarctic-text-heading text-[#00FF00]">IN 24 MINUTES · DURATION 11 MIN</div>
          </div>
        </div>
        <span className="antarctic-text-mono text-[#00FFFF] text-[22pt]">CARRIER 9.8 dB</span>
      </div>

      {/* "ALERT COMMAND" BUTTON */}
      <button
        type="button"
        onClick={handleAlertCommand}
        className={`antarctic-button w-full h-[90px] ${
          alertSent ? 'bg-[#00FF00] text-[#000000] border-[#00FF00]' : 'antarctic-button-danger'
        }`}
      >
        <ShieldAlert className="w-10 h-10 mr-4" />
        <span className="antarctic-text-heading">
          {alertSent ? 'COMMAND WEATHER ALERT TRANSMITTED' : 'ALERT COMMAND CENTER OF SEVERE SURGE'}
        </span>
      </button>
    </div>
  );
};
