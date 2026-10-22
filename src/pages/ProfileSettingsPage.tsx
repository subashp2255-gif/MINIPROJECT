import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wheat,
  Factory,
  Landmark,
  Bell,
  Scale,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronUp,
  Check,
  Edit2,
  X,
  PhoneCall,
  Save,
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Tag } from '../components/ui/Tag';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const ProfileSettingsPage: React.FC = () => {
  const { user, role, setRole, language, setLanguage, isDemoMode, setIsDemoMode, showToast } = useApp();
  const isTa = language === 'ta';

  // Units preference state
  const [preferredUnit, setPreferredUnit] = useState<'kg' | 'quintal'>('quintal');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Edit profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Murugan S.',
    phone: user?.phone || '+91 94431 82341',
    location: user?.location || 'Oddanchatram, Dindigul',
  });
  const [editName, setEditName] = useState(user?.name || 'Murugan S.');
  const [editPhone, setEditPhone] = useState(user?.phone || '+91 94431 82341');
  const [editLocation, setEditLocation] = useState(user?.location || 'Oddanchatram, Dindigul');

  // Help modal state
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Developer & Demo Tools section state (collapsed by default)
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  // Backend configuration state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [aiApiUrl, setAiApiUrl] = useState('http://localhost:8000');
  const [hasFormChanged, setHasFormChanged] = useState(false);

  const handleSaveBackendConfig = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(isTa ? 'அமைப்புகள் சேமிக்கப்பட்டன' : 'Backend configuration saved successfully.', 'success');
    setHasFormChanged(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData({
      name: editName,
      phone: editPhone,
      location: editLocation,
    });
    setShowEditModal(false);
    showToast(isTa ? 'சுயவிவரம் புதுப்பிக்கப்பட்டது' : 'Profile updated successfully.', 'success');
  };

  return (
    <div className="w-full pb-28 pt-3 px-4 text-[#1C2420] select-none space-y-5">
      {/* 1. PROFILE CARD */}
      <div className="p-5 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] space-y-4">
        <div className="flex items-start gap-4">
          <Avatar name={profileData.name} size="xl" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-[#1C2420] truncate font-ui">
                {profileData.name}
              </h1>
              <Tag variant="success">
                {role === 'farmer' ? (isTa ? 'உழவர்' : 'Farmer') : role === 'owner' ? (isTa ? 'கிடங்கு உரிமையாளர்' : 'Storage Owner') : (isTa ? 'நிர்வாகி' : 'Admin')}
              </Tag>
            </div>
            <p className="text-xs text-[#5B6660] mt-0.5">{profileData.phone}</p>
            <p className="text-xs text-[#14532D] font-medium mt-0.5 truncate">{profileData.location}</p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="md"
          fullWidth
          icon={<Edit2 size={16} />}
          onClick={() => setShowEditModal(true)}
        >
          {isTa ? 'சுயவிவரம் திருத்துக' : 'Edit profile'}
        </Button>
      </div>

      {/* 2. LANGUAGE PREFERENCE (One segmented control, single-language heading) */}
      <div className="p-4 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] space-y-2.5">
        <h2 className="text-sm font-semibold text-[#1C2420] font-ui">
          {isTa ? 'மொழி' : 'Language'}
        </h2>
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F7F4EC] rounded-xl border border-[#DFE4DC]">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              language === 'en'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'text-[#5B6660] hover:text-[#14532D]'
            }`}
          >
            <span>English</span>
            {language === 'en' && <Check size={14} />}
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ta')}
            className={`h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              language === 'ta'
                ? 'bg-[#14532D] text-white shadow-xs'
                : 'text-[#5B6660] hover:text-[#14532D]'
            }`}
          >
            <span>தமிழ்</span>
            {language === 'ta' && <Check size={14} />}
          </button>
        </div>
      </div>

      {/* 3. SETTINGS ROWS: Notifications, Units, Help & Support, Logout */}
      <div className="p-2 rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] divide-y divide-[#DFE4DC]/60">
        {/* Notifications Row */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E7F5EE] text-[#14532D] flex items-center justify-center shrink-0">
              <Bell size={18} />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#1C2420] block">
                {isTa ? 'அறிவிப்புகள்' : 'Notifications'}
              </span>
              <span className="text-xs text-[#5B6660]">
                {isTa ? 'விழிப்பூட்டல் மற்றும் எச்சரிக்கைகள்' : 'Real-time telemetry and gate passes'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              notificationsEnabled ? 'bg-[#14532D]' : 'bg-[#DFE4DC]'
            }`}
            aria-label="Toggle notifications"
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Units Preference Row */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#8C5D17] flex items-center justify-center shrink-0">
              <Scale size={18} />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#1C2420] block">
                {isTa ? 'அளவீட்டு அலகு' : 'Measurement Units'}
              </span>
              <span className="text-xs text-[#5B6660]">
                {preferredUnit === 'quintal' ? 'Quintal / Bag' : 'Kilogram (kg)'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-[#F7F4EC] p-0.5 rounded-lg border border-[#DFE4DC]">
            <button
              type="button"
              onClick={() => setPreferredUnit('quintal')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                preferredUnit === 'quintal' ? 'bg-[#14532D] text-white' : 'text-[#5B6660]'
              }`}
            >
              Quintal
            </button>
            <button
              type="button"
              onClick={() => setPreferredUnit('kg')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                preferredUnit === 'kg' ? 'bg-[#14532D] text-white' : 'text-[#5B6660]'
              }`}
            >
              kg
            </button>
          </div>
        </div>

        {/* Help & Support Row */}
        <div
          onClick={() => setShowHelpModal(true)}
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#F7F4EC]/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E7F5EE] text-[#14532D] flex items-center justify-center shrink-0">
              <HelpCircle size={18} />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#1C2420] block">
                {isTa ? 'உதவி மையம்' : 'Help & Support'}
              </span>
              <span className="text-xs text-[#5B6660]">
                {isTa ? 'உழவர் உதவி எண்: 1800-425-1556' : 'Toll-free Kisan Helpline: 1800-425-1556'}
              </span>
            </div>
          </div>
          <Tag variant="info">
            {isTa ? 'அழைக்க' : 'Call'}
          </Tag>
        </div>

        {/* Logout Row (Destructive) */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FBEBE7] text-[#B5472B] flex items-center justify-center shrink-0">
              <LogOut size={18} />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#B5472B] block">
                {isTa ? 'வெளியேறு' : 'Log out'}
              </span>
              <span className="text-xs text-[#5B6660]">
                {isTa ? 'கணக்கிலிருந்து பாதுகாப்பாக வெளியேறவும்' : 'Sign out of this session'}
              </span>
            </div>
          </div>
          <Button
            variant="destructive"
            size="md"
            onClick={() => showToast(isTa ? 'வெளியேற்றப்பட்டது' : 'Logged out', 'info')}
          >
            {isTa ? 'வெளியேறு' : 'Logout'}
          </Button>
        </div>
      </div>

      {/* 4. COLLAPSED DEVELOPER & DEMO TOOLS SECTION */}
      <div className="rounded-2xl bg-white border border-[#DFE4DC] shadow-[0_2px_8px_rgba(15,61,46,0.05)] overflow-hidden">
        <button
          type="button"
          onClick={() => setDevToolsOpen(!devToolsOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F7F4EC]/40 transition-colors cursor-pointer"
        >
          <div>
            <h2 className="text-sm font-semibold text-[#1C2420] font-ui">
              {isTa ? 'டெவலப்பர் & டெமோ கருவிகள்' : 'Developer & Demo Tools'}
            </h2>
            <p className="text-xs text-[#5B6660]">
              {isTa ? 'பாத்திர மாற்றம் & சுபாபேஸ் கட்டமைப்பு' : 'Persona switcher & Supabase configuration'}
            </p>
          </div>
          {devToolsOpen ? (
            <ChevronUp size={18} className="text-[#5B6660]" />
          ) : (
            <ChevronDown size={18} className="text-[#5B6660]" />
          )}
        </button>

        {devToolsOpen && (
          <div className="p-4 pt-2 border-t border-[#DFE4DC] space-y-4">
            {/* Persona Switcher using Lucide Icons (NO Emoji) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1C2420]">
                {isTa ? 'செயலில் உள்ள பயனர் பாத்திரம்' : 'Active Persona'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRole('farmer');
                    showToast(isTa ? 'உழவர் முறைக்கு மாற்றப்பட்டது' : 'Switched to Farmer Persona', 'info');
                  }}
                  className={`h-11 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    role === 'farmer'
                      ? 'bg-[#14532D] text-white border-[#14532D]'
                      : 'bg-[#F7F4EC] text-[#5B6660] border-[#DFE4DC] hover:border-[#14532D]'
                  }`}
                >
                  <Wheat size={16} />
                  <span>{isTa ? 'உழவர்' : 'Farmer'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('owner');
                    showToast(isTa ? 'கிடங்கு உரிமையாளர் முறைக்கு மாற்றப்பட்டது' : 'Switched to Storage Owner Persona', 'info');
                  }}
                  className={`h-11 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    role === 'owner'
                      ? 'bg-[#14532D] text-white border-[#14532D]'
                      : 'bg-[#F7F4EC] text-[#5B6660] border-[#DFE4DC] hover:border-[#14532D]'
                  }`}
                >
                  <Factory size={16} />
                  <span>{isTa ? 'உரிமையாளர்' : 'Owner'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('admin');
                    showToast(isTa ? 'நிர்வாகி முறைக்கு மாற்றப்பட்டது' : 'Switched to Administrator Persona', 'info');
                  }}
                  className={`h-11 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    role === 'admin'
                      ? 'bg-[#14532D] text-white border-[#14532D]'
                      : 'bg-[#F7F4EC] text-[#5B6660] border-[#DFE4DC] hover:border-[#14532D]'
                  }`}
                >
                  <Landmark size={16} />
                  <span>{isTa ? 'நிர்வாகி' : 'Admin'}</span>
                </button>
              </div>
            </div>

            {/* Backend Data Mode Toggle */}
            <div className="pt-2 border-t border-[#DFE4DC] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#1C2420] block">
                  {isTa ? 'தரவு பயன்முறை' : 'Backend Data Mode'}
                </span>
                <span className="text-xs text-[#5B6660]">
                  {isDemoMode ? (isTa ? 'உள்ளமைக்கப்பட்ட டெமோ தரவு' : 'Demo mock data') : (isTa ? 'சுபாபேஸ் நேரலை' : 'Supabase live')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDemoMode(!isDemoMode)}
                className="cursor-pointer"
              >
                <Tag variant={isDemoMode ? 'warning' : 'success'}>
                  {isDemoMode ? 'Demo' : 'Connected'}
                </Tag>
              </button>
            </div>

            {/* Backend Fields with Human Labels & White Input Spec */}
            <form onSubmit={handleSaveBackendConfig} className="space-y-3 pt-2">
              <Input
                label="Supabase project URL"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => {
                  setSupabaseUrl(e.target.value);
                  setHasFormChanged(true);
                }}
                helperText="Project endpoint from Supabase dashboard"
              />

              <Input
                label="Supabase anonymous API key"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={supabaseAnonKey}
                onChange={(e) => {
                  setSupabaseAnonKey(e.target.value);
                  setHasFormChanged(true);
                }}
                helperText="Public anon key for client authentication"
              />

              <Input
                label="AI Service endpoint"
                placeholder="http://localhost:8000"
                value={aiApiUrl}
                onChange={(e) => {
                  setAiApiUrl(e.target.value);
                  setHasFormChanged(true);
                }}
                helperText="FastAPI price forecast & capacity service"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                disabled={!hasFormChanged}
                icon={<Save size={16} />}
              >
                {isTa ? 'அமைப்புகளைச் சேமி' : 'Save'}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#DFE4DC]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#14532D]">
                {isTa ? 'சுயவிவரம் திருத்துக' : 'Edit Profile'}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-[#5B6660] hover:text-[#1C2420] p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <Input
                label={isTa ? 'பெயர்' : 'Full Name'}
                value={editName}
                onChange={(e) => editName !== e.target.value && setEditName(e.target.value)}
              />

              <Input
                label={isTa ? 'கைபேசி எண்' : 'Phone Number'}
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />

              <Input
                label={isTa ? 'இருப்பிடம்' : 'Village / Location'}
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
              />

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => setShowEditModal(false)}
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </Button>
                <Button type="submit" variant="primary" size="md" fullWidth>
                  {isTa ? 'சேமி' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HELP & SUPPORT MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-[#DFE4DC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#E7F5EE] text-[#14532D] flex items-center justify-center">
                  <PhoneCall size={18} />
                </div>
                <h3 className="text-base font-bold text-[#14532D]">
                  {isTa ? 'உழவர் உதவி மையம்' : 'AgriSync Helpline'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-[#5B6660] hover:text-[#1C2420] p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#5B6660] leading-relaxed">
              {isTa
                ? 'தமிழ்நாடு சூரிய மின் குளிர்பதன கிடங்கு ஒதுக்கீடு, வாயில் எடைப்பதிவு மற்றும் தானிய இருப்பு ஆதரவுக்கு எங்களை அழைக்கவும்.'
                : 'Direct support for Tamil Nadu solar cold chain booking, weighing bridge gate pass, and dry inventory management.'}
            </p>

            <div className="p-3.5 rounded-xl bg-[#E7F5EE] border border-[#AFF2C2] text-xs font-semibold text-[#14532D] flex items-center justify-center gap-2">
              <PhoneCall size={16} />
              <span>Toll Free: 1800-425-1556 (Tamil / English)</span>
            </div>

            <div className="pt-1 flex gap-2">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setShowHelpModal(false)}
              >
                {isTa ? 'மூடுக' : 'Close'}
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  showToast(isTa ? 'அழைக்கப்படுகிறது: 1800-425-1556' : 'Dialing 1800-425-1556...', 'info');
                  setShowHelpModal(false);
                }}
              >
                {isTa ? 'அழைக்கவும்' : 'Call Now'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
