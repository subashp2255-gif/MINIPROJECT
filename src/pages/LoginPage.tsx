import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';
import { Phone, CheckCircle2, ArrowRight, KeyRound, Shield, HelpCircle, X, RefreshCw } from 'lucide-react';
import { AppLogo } from '../components/AppLogo';

export const LoginPage: React.FC = () => {
  const { login, language, showToast } = useApp();
  const navigate = useNavigate();
  const isTa = language === 'ta';

  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [phone, setPhone] = useState<string>('+91 98421 77301');
  const [password, setPassword] = useState<string>('agri123');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const DEMO_PERSONAS = [
    {
      role: 'farmer' as UserRole,
      name: isTa ? 'முருகன் எஸ். (விவசாயி)' : 'Murugan S. (Farmer)',
      phone: '+91 98421 77301',
      desc: isTa ? 'ஒட்டன்சத்திரம் தக்காளி & தானிய விவசாயி' : 'Oddanchatram Tomato & Grain Farmer',
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

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const handlePersonaSelect = (p: typeof DEMO_PERSONAS[0]) => {
    setSelectedRole(p.role);
    setPhone(p.phone);
    setErrorMsg(null);
  };

  const handleSendOtp = () => {
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setErrorMsg(isTa ? 'தயவுசெய்து சரியான 10-இலக்க மொபைல் எண்ணை உள்ளிடவும்.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg(null);
    setOtpSent(true);
    setCountdown(30);
    setOtp('4892'); // Pre-fill mock OTP for farmer demo
    showToast(isTa ? `சரிபார்ப்புக் குறியீடு (OTP: 4892) ${phone} எண்ணிற்கு அனுப்பப்பட்டது!` : `Verification OTP (4892) dispatched to ${phone}!`, 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!phone || phone.replace(/\D/g, '').length < 8) {
      setErrorMsg(isTa ? 'தயவுசெய்து சரியான தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Please enter a valid phone number.');
      return;
    }

    if (authMethod === 'otp') {
      if (!otpSent) {
        handleSendOtp();
        return;
      }
      if (otp.length < 4) {
        setErrorMsg(isTa ? 'தயவுசெய்து 4-இலக்க OTP குறியீட்டை உள்ளிடவும்.' : 'Please enter the 4-digit OTP code.');
        return;
      }
    } else {
      if (!password || password.length < 4) {
        setErrorMsg(isTa ? 'கடவுச்சொல் குறைந்தது 4 எழுத்துக்கள் இருக்க வேண்டும்.' : 'Password must be at least 4 characters.');
        return;
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      login(phone, selectedRole);
      localStorage.setItem('srs_onboarded', 'true');
      localStorage.setItem('srs_user_phone', phone);
      setIsSubmitting(false);

      if (selectedRole === 'farmer') {
        navigate('/farmer/home');
      } else if (selectedRole === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }, 400);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone || forgotPhone.replace(/\D/g, '').length < 10) {
      showToast(isTa ? 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்' : 'Enter a valid phone number', 'error');
      return;
    }
    setForgotSent(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F4EC] flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#DFE4DC] shadow-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center mb-1">
            <AppLogo size={44} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F3D2E]">
            {isTa ? 'கணக்கில் உள்நுழைக' : 'Sign in to AgriSync'}
          </h1>
          <p className="text-xs text-[#5B6660]">
            {isTa
              ? 'விவசாயி அல்லது கிடங்கு உரிமையாளர் கணக்கைத் தேர்வு செய்து தொடரவும்'
              : 'Access your cold storage bookings, dry inventory, and alerts'}
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
            {isTa ? 'விரைவு உள்நுழைவு சுயவிவரங்கள் (1-கிளிக் டெமோ)' : 'Quick Login Personas (One-Click Demo)'}
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

        {/* Auth Method Selector */}
        <div className="flex bg-[#F7F4EC] p-1 rounded-xl border border-[#DFE4DC]">
          <button
            type="button"
            onClick={() => { setAuthMethod('password'); setOtpSent(false); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authMethod === 'password' ? 'bg-white text-[#134E35] shadow-xs' : 'text-[#5B6660]'
            }`}
          >
            {isTa ? 'கடவுச்சொல் முறை' : 'Password Login'}
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('otp')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authMethod === 'otp' ? 'bg-white text-[#134E35] shadow-xs' : 'text-[#5B6660]'
            }`}
          >
            {isTa ? 'SMS OTP முறை' : 'SMS OTP Login'}
          </button>
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

          {authMethod === 'password' ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#404941]">
                  {isTa ? 'கடவுச்சொல் (இயல்பு: agri123)' : 'Password (Default: agri123)'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-bold text-[#14532D] hover:underline cursor-pointer"
                >
                  {isTa ? 'மறந்துவிட்டதா?' : 'Forgot Password?'}
                </button>
              </div>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-3.5 text-[#5B6660]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#C0C9BF] text-xs font-semibold bg-[#F4FBF3] focus:border-[#14532D] outline-hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#404941]">
                {isTa ? 'OTP சரிபார்ப்புக் குறியீடு' : 'Verification Code (OTP)'}
              </label>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full py-2.5 rounded-xl bg-[#E7F5EE] border border-[#14532D] text-[#14532D] text-xs font-bold hover:bg-[#14532D] hover:text-white transition-all cursor-pointer"
                >
                  {isTa ? 'OTP அனுப்புக' : 'Send Verification OTP'}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Shield size={16} className="absolute left-3.5 top-3.5 text-[#5B6660]" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="4892"
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#C0C9BF] text-xs font-bold tracking-widest bg-[#F4FBF3] focus:border-[#14532D] outline-hidden text-center"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#5B6660]">
                    <span>
                      {isTa ? 'குறியீடு காலாவதி:' : 'Code expires in:'} <strong className="text-[#14532D]">{countdown}s</strong>
                    </span>
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={handleSendOtp}
                      className={`font-bold hover:underline ${
                        countdown > 0 ? 'text-[#94A3B8] cursor-not-allowed' : 'text-[#14532D] cursor-pointer'
                      }`}
                    >
                      {isTa ? 'மீண்டும் அனுப்புக' : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <>
                <span>{isTa ? 'உள்நுழைக' : 'Sign In Now'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-[#DFE4DC] text-xs text-[#5B6660]">
          <div>
            {isTa ? 'புதிய பயனரா? ' : "Need an account? "}
            <Link to="/register" className="font-bold text-[#14532D] hover:underline">
              {isTa ? 'பதிவு செய்க' : 'Register Here'}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1 text-[#5B6660] hover:text-[#14532D] cursor-pointer"
          >
            <HelpCircle size={14} />
            <span>{isTa ? 'உதவி' : 'Help & Support'}</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal (Screen 5 Safe Reset Flow) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F3D2E]">
                {isTa ? 'கடவுச்சொல் மீட்டமைப்பு' : 'Account Recovery & Reset'}
              </h3>
              <button
                type="button"
                onClick={() => { setShowForgotModal(false); setForgotSent(false); }}
                className="w-8 h-8 rounded-full bg-[#F4FBF3] flex items-center justify-center text-[#5B6660]"
              >
                <X size={16} />
              </button>
            </div>

            {!forgotSent ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-[#5B6660] leading-relaxed">
                  {isTa
                    ? 'உங்கள் பதிவு செய்யப்பட்ட மொபைல் எண்ணை உள்ளிடவும். உங்கள் அடையாளத்தை சரிபார்க்க OTP குறியீடு அனுப்பப்படும்.'
                    : 'Enter your registered mobile number. A secure one-time verification link will be dispatched.'}
                </p>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#404941]">
                    {isTa ? 'மொபைல் எண்' : 'Mobile Number'}
                  </label>
                  <input
                    type="text"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    placeholder="+91 98421 77301"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#C0C9BF] text-xs font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#14532D] text-white text-xs font-bold hover:bg-[#0F3D2E] transition-all cursor-pointer"
                >
                  {isTa ? 'மீட்டமைப்பு குறியீட்டை அனுப்புக' : 'Dispatch Recovery Code'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-[#E7F5EE] text-[#14532D] mx-auto flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#14532D]">
                    {isTa ? 'கோரிக்கை அனுப்பப்பட்டது' : 'Request Processed Safely'}
                  </h4>
                  <p className="text-xs text-[#5B6660] leading-relaxed">
                    {isTa
                      ? 'இந்த எண்ணுடன் கணக்கு இணைக்கப்பட்டிருந்தால், OTP குறியீடு SMS மூலம் அனுப்பப்பட்டுள்ளது.'
                      : 'If an active account is linked to this phone number, recovery instructions have been sent via SMS.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(false); setForgotSent(false); }}
                  className="w-full py-2.5 rounded-xl bg-[#F4FBF3] border border-[#C0C9BF] text-xs font-bold text-[#14532D] cursor-pointer"
                >
                  {isTa ? 'உள்நுழைவுக்குத் திரும்பு' : 'Back to Login'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-[#DFE4DC] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F3D2E]">
                {isTa ? 'விவசாயி உதவி & ஆதரவு மையம்' : 'AgriSync Farmer Helpdesk'}
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4FBF3] flex items-center justify-center text-[#5B6660]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#5B6660]">
              <div className="p-3.5 rounded-2xl bg-[#E7F5EE] text-[#14532D] space-y-1">
                <span className="font-bold block">{isTa ? 'கிசான் அழைப்பு மையம் (இலவசம்)' : 'Kisan Call Centre (Toll-Free)'}</span>
                <span className="text-lg font-black block">1800-180-1551</span>
                <span className="text-[10px] text-[#5B6660]">{isTa ? '24 மணி நேரமும் செயல்படுகிறது' : 'Available 24x7 in Tamil & English'}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F4EC] space-y-1">
                <span className="font-bold text-[#1C2420] block">{isTa ? 'திண்டுக்கல் & ஒட்டன்சத்திரம் உதவி மையம்' : 'Dindigul & Oddanchatram Cluster Support'}</span>
                <span className="font-bold text-[#14532D] block">+91 94431 82910 / +91 98421 77301</span>
                <span className="text-[10px]">{isTa ? 'காலை 06:00 முதல் இரவு 10:00 வரை' : 'Hours: 06:00 AM - 10:00 PM'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#14532D] text-white text-xs font-bold cursor-pointer"
            >
              {isTa ? 'மூடுக' : 'Close Helpdesk'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
