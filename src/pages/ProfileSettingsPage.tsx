import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ProfileSettingsPage: React.FC = () => {
  const { user, role, setRole, language, setLanguage, isDemoMode, setIsDemoMode, showToast } = useApp();

  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [aiApiUrl, setAiApiUrl] = useState('http://localhost:8000');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Saved environment settings. Supabase connected mode ready.', 'success');
  };

  return (
    <div className="flex flex-col relative w-full pt-28 pb-24 bg-[#f4fbf3] min-h-screen">
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#dfe4dc] space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#1e5e3a]/20"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-[#161d18]">{user.name}</h1>
              <p className="text-xs text-[#404941]">{user.phone}</p>
              <p className="text-xs text-[#1e5e3a] font-medium">{user.location}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#aff2c2] text-[#00210f] text-xs font-bold uppercase">
              {role}
            </span>
          </div>

          <div className="pt-2 border-t border-[#dde4dd]">
            <label className="block text-xs font-bold text-[#161d18] mb-2">Switch Active Persona</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRole('farmer')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                  role === 'farmer'
                    ? 'bg-[#1e5e3a] text-white border-[#1e5e3a]'
                    : 'bg-white text-[#404941] border-[#c0c9bf]/60'
                }`}
              >
                🌾 Farmer
              </button>
              <button
                onClick={() => setRole('owner')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                  role === 'owner'
                    ? 'bg-[#1e5e3a] text-white border-[#1e5e3a]'
                    : 'bg-white text-[#404941] border-[#c0c9bf]/60'
                }`}
              >
                🏭 Owner
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                  role === 'admin'
                    ? 'bg-[#1e5e3a] text-white border-[#1e5e3a]'
                    : 'bg-white text-[#404941] border-[#c0c9bf]/60'
                }`}
              >
                🏛️ Admin
              </button>
            </div>
          </div>
        </div>

        {/* Language Preference */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#dfe4dc] space-y-3">
          <h2 className="text-sm font-bold text-[#161d18]">Language Preference / மொழி தேர்வு</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-between ${
                language === 'en'
                  ? 'bg-[#eef6ed] border-[#1e5e3a] text-[#1e5e3a]'
                  : 'bg-white border-[#c0c9bf]/60 text-[#404941]'
              }`}
            >
              <span>English (Default)</span>
              {language === 'en' && <span>✓</span>}
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`p-3 rounded-xl text-xs font-bold border flex items-center justify-between ${
                language === 'ta'
                  ? 'bg-[#eef6ed] border-[#1e5e3a] text-[#1e5e3a]'
                  : 'bg-white border-[#c0c9bf]/60 text-[#404941]'
              }`}
            >
              <span>தமிழ் (Tamil)</span>
              {language === 'ta' && <span>✓</span>}
            </button>
          </div>
        </div>

        {/* Backend & Supabase Configuration */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#dfe4dc] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#161d18]">Backend Data Mode</h2>
              <p className="text-xs text-[#404941]">Demo simulated data vs Supabase connected mode</p>
            </div>
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isDemoMode ? 'bg-[#86f8c2] text-[#00210f]' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {isDemoMode ? 'Demo Mode' : 'Connected'}
            </button>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#404941] mb-1">
                VITE_SUPABASE_URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full h-11 px-3 text-xs bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#404941] mb-1">
                VITE_SUPABASE_ANON_KEY
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full h-11 px-3 text-xs bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#404941] mb-1">
                VITE_AI_API_URL (FastAPI Microservice)
              </label>
              <input
                type="text"
                value={aiApiUrl}
                onChange={(e) => setAiApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full h-11 px-3 text-xs bg-[#eef6ed] border border-[#c0c9bf] rounded-xl outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#1e5e3a] text-white text-xs font-bold hover:bg-[#16462b]"
            >
              Save Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
