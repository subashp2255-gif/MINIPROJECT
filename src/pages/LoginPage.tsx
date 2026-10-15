import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';
import { Phone, CheckCircle2, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, language } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [phone, setPhone] = useState<string>('+91 98421 77301');
  const [password, setPassword] = useState<string>('agri123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const DEMO_PERSONAS = [
    {
      role: 'farmer' as UserRole,
      name: isTa ? 'முருகன் எஸ். (விவசாயி)' : 'Murugan S. (Farmer)',
      phone: '+91 98421 77301',
      desc: isTa ? 'ஒட்டன்சத்திரம் தக்காளி விவசாயி' : 'Oddanchatram Tomato Grower',
    },
    {
      role: 'owner' as UserRole,
      name: isTa ? 'ஆறுமுகம் பி. (கிடங்கு உரிமையாளர்)' : 'Arumugam P. (Storage Owner)',
      phone: '+91 94431 82910',
      desc: isTa ? 'உழவர் சோலார் ஹப் #14 மேலாளர்' : 'Uzhavar Solar Hub #14 Manager',
    },
    {
      role: 'admin' as UserRole,
      name: isTa ? 'டாக்டர் கே. ஜெயக்குமார் IAS (நிர்வாகி)' : 'Dr. K. Jayakumar IAS (Admin)',
      phone: '+91 94440 00122',
      desc: isTa ? 'வேளாண் வணிக வாரியம், சென்னை' : 'TN Agri Marketing Board',
    },
  ];

  const handlePersonaSelect = (p: typeof DEMO_PERSONAS[0]) => {
    setSelectedRole(p.role);
    setPhone(p.phone);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setErrorMsg(isTa ? 'தயவுசெய்து சரியான தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Please enter a valid phone number.');
      return;
    }

    login(phone, selectedRole);

    if (selectedRole === 'farmer') {
      navigate('/farmer/home');
    } else if (selectedRole === 'owner') {
      navigate('/owner/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F4FBF3] flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#DFE4DC] shadow-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#0F3D2E]/10 p-1 flex items-center justify-center shadow-xs">
              <img src="/agrisync-icon.png" alt="AgriSync" className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#134E35]">AgriSync</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
            {isTa ? 'கணக்கில் உள்நுழைக' : 'Sign in to AgriSync'}
          </h1>
          <p className="text-xs text-[#5B6660]">
            {isTa
              ? 'விவசாயி, கிடங்கு உரிமையாளர் அல்லது நிர்வாகி கணக்கைத் தேர்வு செய்யவும்'
              : 'Access your cold storage bookings, physical inventory, or facility console'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FFDAD6] text-[#93000A] text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Quick Demo Persona Switcher */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B6660] block">
            {isTa ? 'விரைவு உள்நுழைவு சுயவிவரங்கள் (டெமோ)' : 'Quick Login Personas (One-Click Demo)'}
          </span>
          <div className="grid grid-cols-1 gap-2">
            {DEMO_PERSONAS.map((p) => {
              const isSelected = selectedRole === p.role;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handlePersonaSelect(p)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#E7F5EE] border-[#14532D] text-[#14532D] shadow-2xs'
                      : 'bg-[#F7F4EC] border-[#DFE4DC] text-[#404941] hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="font-bold">{p.name}</div>
                    <div className="text-[10px] text-[#5B6660]">{p.desc}</div>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="text-[#14532D]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">
              {isTa ? 'மொபைல் எண்' : 'Mobile Phone Number'}
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-3.5 text-[#5B6660]" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98421 77301"
                className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3] focus:border-[#14532D] outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#404941]">
              {isTa ? 'கடவுச்சொல் (இயல்பு: agri123)' : 'Password (Default: agri123)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-3.5 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3] focus:border-[#14532D] outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>{isTa ? 'உள்நுழைக' : 'Sign In Now'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center text-xs text-[#5B6660]">
          {isTa ? 'புதிய பயனரா? ' : "Don't have an account? "}
          <Link to="/register" className="font-bold text-[#14532D] hover:underline">
            {isTa ? 'புதிய கணக்கை உருவாக்கவும்' : 'Register Here'}
          </Link>
        </div>
      </div>
    </div>
  );
};
