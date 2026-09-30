/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * DhruvaTwin Login Page — Polar Operations Authentication
 * National Centre for Polar and Ocean Research (NCPOR) / MoES
 * Smart India Hackathon 2026 - PS 26060 - Team HackFinity007
 */

import React, { useState } from 'react';
import {
  Globe2,
  Lock,
  LogIn,
  Snowflake,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserRole } from '../types';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const DEMO_CREDENTIALS: Array<{ role: UserRole; desc: string; passcode: string }> = [
  { role: 'Admin', desc: 'Full SCADA overrides & system control', passcode: 'admin2026' },
  { role: 'Commander', desc: 'Mission overview & strategic command', passcode: 'commander' },
  { role: 'Scientist', desc: 'NPDC data exports & analysis', passcode: 'science' },
  { role: 'Field Staff', desc: 'Glove-friendly Antarctic Mode (auto)', passcode: 'field' },
  { role: 'User', desc: 'Station personnel read access', passcode: 'user' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulated auth delay (realistic UX)
    await new Promise(r => setTimeout(r, 600));

    const credential = DEMO_CREDENTIALS.find(c => c.role === selectedRole);
    const correctPasscode = credential?.passcode ?? 'admin2026';

    if (passcode === correctPasscode || passcode === 'dhruvatwin') {
      setIsLoading(false);
      onLogin(selectedRole);
    } else {
      setIsLoading(false);
      setError(`Incorrect passcode for ${selectedRole}. Hint: try "${correctPasscode}"`);
    }
  };

  const handleQuickAccess = (role: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(role);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#060B14] text-[#E8EEF4] flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#00E0C6] opacity-[0.04] blur-3xl" />
        <div className="absolute -bottom-20 right-0 w-[500px] h-[500px] rounded-full bg-[#4A9EFF] opacity-[0.04] blur-3xl" />
        {/* Subtle star field */}
        {[...Array(22)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: (i % 3 === 0 ? 2 : 1) + 'px',
              height: (i % 3 === 0 ? 2 : 1) + 'px',
              top: (i * 4.5) % 100 + '%',
              left: (i * 7.3) % 100 + '%',
              opacity: 0.06 + (i % 5) * 0.04,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div className="bg-[#0A121E] border border-[#1A2533] rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#00E0C6]/10 to-[#4A9EFF]/6 border-b border-[#1A2533] px-6 py-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E0C6] to-[#0A121E] p-[1.5px] flex items-center justify-center">
                <div className="w-full h-full bg-[#060B14] rounded-[9px] flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-[#00E0C6]" />
                </div>
              </div>
              <div className="text-left">
                <div className="text-xl font-extrabold uppercase tracking-wider font-heading text-white leading-none">
                  DhruvaTwin
                </div>
                <div className="text-[10px] text-[#6B7A8F] leading-none mt-0.5">Antarctic Stations Digital Twin</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00E0C6]/10 border border-[#00E0C6]/25 text-[#00E0C6] text-[10px] font-bold uppercase tracking-widest">
              <Snowflake className="w-3 h-3" />
              NCPOR · MoES · SIH 2026 · PS 26060
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-6">

            <h2 className="text-sm font-bold text-[#E8EEF4] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#00E0C6]" />
              Operational Role Authentication
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider mb-2">
                  Select Role
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {DEMO_CREDENTIALS.map(({ role, desc }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => { setSelectedRole(role); setError(''); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left text-xs transition-all ${
                        selectedRole === role
                          ? 'bg-[#00E0C6]/10 border-[#00E0C6] text-[#00E0C6]'
                          : 'bg-[#060B14] border-[#1A2533] text-[#6B7A8F] hover:border-[#2A3A4D] hover:text-[#E8EEF4]'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="font-bold">{role}</div>
                        <div className="text-[10px] opacity-70">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Passcode */}
              <div>
                <label htmlFor="passcode" className="block text-xs font-semibold text-[#6B7A8F] uppercase tracking-wider mb-2">
                  Passcode
                </label>
                <div className="relative">
                  <input
                    id="passcode"
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={e => { setPasscode(e.target.value); setError(''); }}
                    placeholder="Enter passcode for selected role…"
                    autoComplete="current-password"
                    className="w-full bg-[#060B14] border border-[#1A2533] focus:border-[#00E0C6] rounded-lg px-3 py-2.5 text-sm text-[#E8EEF4] placeholder-[#3A4A5A] outline-none transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A8F] hover:text-[#E8EEF4] transition-colors"
                    tabIndex={-1}
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#6B7A8F] mt-1">
                  Universal passcode: <code className="text-[#00E0C6] font-mono">dhruvatwin</code>
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-[#FF3B47]/10 border border-[#FF3B47]/30 rounded-lg px-3 py-2.5 text-xs text-[#FF3B47]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#00E0C6] hover:bg-[#00E0C6]/90 disabled:bg-[#00E0C6]/50 text-[#060B14] font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00E0C6]/20"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#060B14]/30 border-t-[#060B14] rounded-full animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Access DhruvaTwin
                  </>
                )}
              </button>
            </form>

            {/* Quick Access (Evaluator/Demo) */}
            <div className="mt-4 pt-4 border-t border-[#1A2533]">
              <p className="text-[10px] text-[#6B7A8F] uppercase tracking-wider font-bold mb-2">
                Quick Demo Access (No passcode)
              </p>
              <div className="flex flex-wrap gap-2">
                {(['Admin', 'Commander', 'Scientist'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => handleQuickAccess(role)}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-[#060B14] hover:bg-[#0A121E] border border-[#1A2533] hover:border-[#00E0C6]/40 text-xs font-semibold text-[#6B7A8F] hover:text-[#00E0C6] rounded-lg transition-all"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-[#060B14]/60 border-t border-[#1A2533] text-[10px] text-[#6B7A8F] text-center">
            Team HackFinity007 · SIH 2026 · PS&nbsp;26060 · NCPOR / MoES Govt. of India
          </div>
        </div>
      </div>
    </div>
  );
};
