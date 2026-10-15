import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';
import { User, Phone, MapPin, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { registerUser, language } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const [role, setRole] = useState<UserRole>('farmer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Oddanchatram, Dindigul');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(isTa ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.' : 'Please enter your name.');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setErrorMsg(isTa ? 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Please enter a valid phone number.');
      return;
    }

    registerUser(name, phone, role, location);

    if (role === 'farmer') {
      navigate('/farmer/home');
    } else if (role === 'owner') {
      navigate('/owner/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F4FBF3] flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#DFE4DC] shadow-lg space-y-6">
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#0F3D2E]/10 p-1 flex items-center justify-center shadow-xs">
              <img src="/agrisync-icon.png" alt="AgriSync" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#134E35]">AgriSync</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
            {isTa ? 'புதிய கணக்கை உருவாக்கவும்' : 'Create an AgriSync Account'}
          </h1>
          <p className="text-xs text-[#5B6660]">
            {isTa ? 'உரிய பாத்திரத்தைத் தேர்ந்தெடுத்து உங்கள் விவரங்களை உள்ளிடவும்' : 'Choose your role to get started'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FFDAD6] text-[#93000A] text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#404941]">
            {isTa ? 'உங்கள் பங்கு (Role)' : 'Select Your Role'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                role === 'farmer'
                  ? 'bg-[#E7F5EE] border-[#14532D] text-[#14532D]'
                  : 'bg-[#F7F4EC] border-[#DFE4DC] text-[#5B6660] hover:bg-white'
              }`}
            >
              <div className="font-bold text-xs">{isTa ? 'விவசாயி' : 'Farmer'}</div>
              <div className="text-[10px] text-[#5B6660]">
                {isTa ? 'குளிர்சாதன அறை முன்பதிவு' : 'Book Cold Storage'}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                role === 'owner'
                  ? 'bg-[#E7F5EE] border-[#14532D] text-[#14532D]'
                  : 'bg-[#F7F4EC] border-[#DFE4DC] text-[#5B6660] hover:bg-white'
              }`}
            >
              <div className="font-bold text-xs">{isTa ? 'கிடங்கு உரிமையாளர்' : 'Storage Owner'}</div>
              <div className="text-[10px] text-[#5B6660]">
                {isTa ? 'இருப்பு & அறை மேலாண்மை' : 'Manage Inventory & Hub'}
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">
              {isTa ? 'முழு பெயர்' : 'Full Name'}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-[#5B6660]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isTa ? 'எ.கா. பழனிச்சாமி கே.' : 'e.g. Palanisamy K.'}
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3] focus:border-[#14532D] outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">
              {isTa ? 'மொபைல் எண்' : 'Mobile Phone'}
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-3.5 text-[#5B6660]" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98421 XXXXX"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3] focus:border-[#14532D] outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">
              {isTa ? 'வட்டம் / மாவட்டம்' : 'District / Market Area'}
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-3.5 text-[#5B6660]" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Oddanchatram, Dindigul"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3] focus:border-[#14532D] outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>{isTa ? 'கணக்கை உருவாக்கு' : 'Complete Registration'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center text-xs text-[#5B6660]">
          {isTa ? 'ஏற்கனவே கணக்கு உள்ளதா? ' : 'Already registered? '}
          <Link to="/login" className="font-bold text-[#14532D] hover:underline">
            {isTa ? 'உள்நுழையவும்' : 'Sign In'}
          </Link>
        </div>
      </div>
    </div>
  );
};
