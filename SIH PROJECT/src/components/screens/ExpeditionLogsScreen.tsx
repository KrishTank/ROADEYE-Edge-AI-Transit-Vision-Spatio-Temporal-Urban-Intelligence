/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Screen 9: Indian Scientific Expedition to Antarctica (ISEA) Logs
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState, useEffect } from 'react';
import { IseaExpedition } from '../../types';
import { db } from '../../db/dexieDb';
import { Calendar, Compass, Filter, Flag, MapPin, Search, Users } from 'lucide-react';

export const ExpeditionLogsScreen: React.FC = () => {
  const [expeditions, setExpeditions] = useState<IseaExpedition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [selectedExpedition, setSelectedExpedition] = useState<IseaExpedition | null>(null);

  useEffect(() => {
    const loadExpeditions = async () => {
      const list = await db.expeditions.orderBy('number').reverse().toArray();
      setExpeditions(list);
      if (list.length > 0 && !selectedExpedition) {
        setSelectedExpedition(list[0]);
      }
    };
    loadExpeditions();
  }, []);

  const filtered = expeditions.filter(exp => {
    const matchStation = selectedStation === 'ALL' || exp.stationBase === selectedStation;
    const matchQuery = exp.focus.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       exp.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       `ISEA-${exp.number}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStation && matchQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#E8EEF4]">
          Indian Scientific Expeditions to Antarctica (ISEA 1 – 46)
        </h2>
        <p className="text-xs text-[#6B7A8F] mt-0.5">
          Archival log of all 46 scientific campaigns since Dr. S.Z. Qasim’s first voyage in 1981 to the 46th ISEA (2026).
        </p>
      </div>

      {/* FILTER & SEARCH STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7A8F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by expedition number, science focus, or milestone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#060B14] border border-[#1A2533] rounded-lg text-xs text-[#E8EEF4] focus:border-[#00E0C6] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1">
          {['ALL', 'Dakshin Gangotri', 'Maitri', 'Bharati', 'Combined'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStation(st)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                selectedStation === st
                  ? 'bg-[#00E0C6] text-[#060B14]'
                  : 'bg-[#060B14] text-[#6B7A8F] hover:text-[#E8EEF4]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TWO COLUMN: TIMELINE + SELECTED EXPEDITION DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expedition Timeline List (7 cols) */}
        <div className="lg:col-span-7 space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {filtered.map(exp => {
            const isSelected = selectedExpedition?.id === exp.id;

            return (
              <div
                key={exp.id}
                onClick={() => setSelectedExpedition(exp)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0E1B2D] border-[#00E0C6]'
                    : 'bg-[#0A121E] border-[#1A2533] hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#00E0C6]">
                        ISEA-{exp.number}
                      </span>
                      <span className="text-xs text-[#6B7A8F]">· {exp.year}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#4A9EFF]/10 text-[#4A9EFF] border border-[#4A9EFF]/20">
                        {exp.stationBase}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#E8EEF4] mt-1.5 leading-snug">
                      {exp.focus}
                    </h3>
                    <div className="text-xs text-[#6B7A8F] mt-1 line-clamp-1">
                      {exp.keyMilestone}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-mono font-bold text-[#E8EEF4] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#6B7A8F]" />
                      {exp.teamSize}
                    </span>
                    <span className="text-[10px] text-[#6B7A8F]">Crew</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Expedition Detail Panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#0A121E] rounded-xl border border-[#1A2533] p-5 flex flex-col justify-between">
          {selectedExpedition ? (
            <div className="space-y-4">
              <div className="border-b border-[#1A2533] pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#00E0C6]">
                    ISEA #{selectedExpedition.number}
                  </span>
                  <span className="text-xs font-mono text-[#6B7A8F]">Year {selectedExpedition.year}</span>
                </div>
                <h3 className="text-base font-bold text-[#E8EEF4] mt-2">
                  {selectedExpedition.focus}
                </h3>
                <div className="text-xs text-[#6B7A8F] mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#00E0C6]" />
                  <span>Base: {selectedExpedition.stationBase} Station</span>
                </div>
              </div>

              {/* Milestone Box */}
              <div className="p-3 bg-[#060B14] rounded-lg border border-[#00E0C6]/30">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#00E0C6] uppercase">
                  <Flag className="w-3.5 h-3.5" />
                  <span>Key Expedition Milestone</span>
                </div>
                <p className="text-xs text-[#E8EEF4] mt-1.5 leading-relaxed">
                  {selectedExpedition.keyMilestone}
                </p>
              </div>

              {/* Summary */}
              <p className="text-xs text-[#6B7A8F] leading-relaxed">
                {selectedExpedition.summary}
              </p>

              {/* Mission Statistics Strip */}
              <div className="p-3 bg-[#060B14] rounded-lg border border-[#1A2533] space-y-2 text-xs">
                <div className="flex justify-between text-[#6B7A8F]">
                  <span>Total Scientific Personnel:</span>
                  <span className="font-mono text-[#E8EEF4] font-bold">{selectedExpedition.teamSize} researchers</span>
                </div>
                <div className="flex justify-between text-[#6B7A8F]">
                  <span>Expedition Leadership:</span>
                  <span className="text-[#E8EEF4]">{selectedExpedition.leader}</span>
                </div>
                <div className="flex justify-between text-[#6B7A8F]">
                  <span>Sponsoring Authority:</span>
                  <span className="text-[#00E0C6] font-medium">NCPOR / MoES, Govt of India</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-[#6B7A8F]">
              Select an expedition from the timeline to view historical logs
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
