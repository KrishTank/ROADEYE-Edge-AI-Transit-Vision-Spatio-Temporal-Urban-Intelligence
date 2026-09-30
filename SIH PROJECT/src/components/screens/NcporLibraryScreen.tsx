/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Screen 7: NCPOR Scientific & Operational Technical Library
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity
 */

import React, { useState, useEffect } from 'react';
import { NcporDocument } from '../../types';
import { db } from '../../db/dexieDb';
import { BookOpen, Download, ExternalLink, FileText, Filter, Search } from 'lucide-react';

export const NcporLibraryScreen: React.FC = () => {
  const [documents, setDocuments] = useState<NcporDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewDoc, setPreviewDoc] = useState<NcporDocument | null>(null);

  useEffect(() => {
    const loadDocs = async () => {
      const list = await db.documents.toArray();
      setDocuments(list);
      if (list.length > 0 && !previewDoc) {
        setPreviewDoc(list[0]);
      }
    };
    loadDocs();
  }, []);

  const categories = [
    'ALL',
    'Safety SOPs',
    'Engineering & HVAC',
    'Glaciology & Ice Radar',
    'Treaty & NPDC Compliance',
    'Polar Biology'
  ];

  const filteredDocs = documents.filter(doc => {
    const matchCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchQuery = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       doc.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleDownload = (doc: NcporDocument) => {
    // Generate simulated PDF text data download
    const blob = new Blob([
      `National Centre for Polar and Ocean Research (NCPOR)\nMinistry of Earth Sciences, Govt. of India\n\nTitle: ${doc.title}\nCategory: ${doc.category}\nAuthor: ${doc.author}\nDOI: ${doc.doi}\nPublished: ${doc.publishedAt}\n\n[DHRUVATWIN SCIENTIFIC ARCHIVE REPOSITORY]`
    ], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.slice(0, 30)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-[#E8EEF4]">
          NCPOR Polar Engineering & Science Repository
        </h2>
        <p className="text-xs text-[#6B7A8F] mt-0.5">
          Standard Operating Procedures (SOPs), glaciological surveys, microgrid specs, and ATS Madrid Protocol archives.
        </p>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0A121E] rounded-xl border border-[#1A2533]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7A8F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by title, author, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#060B14] border border-[#1A2533] rounded-lg text-xs text-[#E8EEF4] focus:border-[#00E0C6] focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#00E0C6] text-[#060B14]'
                  : 'bg-[#060B14] text-[#6B7A8F] hover:text-[#E8EEF4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN TWO COLUMN LAYOUT: LIST + PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredDocs.map(doc => {
            const isSelected = previewDoc?.id === doc.id;

            return (
              <div
                key={doc.id}
                onClick={() => setPreviewDoc(doc)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0E1B2D] border-[#00E0C6]'
                    : 'bg-[#0A121E] border-[#1A2533] hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#00E0C6] uppercase tracking-wider">
                      {doc.category}
                    </span>
                    <h3 className="text-sm font-bold text-[#E8EEF4] mt-1 leading-snug">
                      {doc.title}
                    </h3>
                    <div className="text-xs text-[#6B7A8F] mt-1.5">
                      {doc.author} · <span className="font-mono">{doc.publishedAt}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-[#6B7A8F] bg-[#060B14] px-2 py-0.5 rounded border border-[#1A2533]">
                      {doc.fileSize}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(doc);
                      }}
                      className="p-1.5 bg-[#00E0C6]/10 hover:bg-[#00E0C6]/20 text-[#00E0C6] rounded transition-colors"
                      title="Download Archive"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Document Preview Panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#0A121E] rounded-xl border border-[#1A2533] p-5 flex flex-col justify-between">
          {previewDoc ? (
            <div className="space-y-4">
              <div className="border-b border-[#1A2533] pb-3">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#00E0C6]">
                  <FileText className="w-4 h-4" />
                  <span>{previewDoc.category}</span>
                </div>
                <h3 className="text-base font-bold text-[#E8EEF4] mt-2 leading-snug">
                  {previewDoc.title}
                </h3>
                <div className="text-xs text-[#6B7A8F] mt-1">
                  Digital Object Identifier: <span className="font-mono text-[#E8EEF4]">{previewDoc.doi}</span>
                </div>
              </div>

              <div className="p-4 bg-[#060B14] rounded-lg border border-[#1A2533] space-y-3">
                <div className="text-xs font-bold text-[#E8EEF4] uppercase tracking-wider">
                  Document Metadata Summary
                </div>
                <div className="space-y-1.5 text-xs text-[#6B7A8F]">
                  <div className="flex justify-between">
                    <span>Issuing Body:</span>
                    <span className="text-[#E8EEF4] text-right font-medium">NCPOR, Vasco da Gama, Goa</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Principal Investigator:</span>
                    <span className="text-[#E8EEF4] text-right font-medium">{previewDoc.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Classification:</span>
                    <span className="text-[#3EE07F] font-bold">Unclassified / Open Access</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Repository Node:</span>
                    <span className="font-mono text-[#00E0C6]">DHRUVA-LIB-01</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#6B7A8F] leading-relaxed">
                This document is indexed under the National Polar Data Center (NPDC) metadata standard and complies with FAIR (Findable, Accessible, Interoperable, Reusable) polar research guidelines.
              </p>

              <div className="pt-4 border-t border-[#1A2533]">
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="w-full py-2.5 px-4 bg-[#00E0C6] hover:bg-[#00E0C6]/90 text-[#060B14] font-bold text-xs rounded transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document Archive ({previewDoc.fileSize})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-[#6B7A8F]">
              Select a technical manual to preview metadata
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
