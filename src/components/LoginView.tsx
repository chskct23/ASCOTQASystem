import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  HardDrive,
  KeyRound,
} from 'lucide-react';

export interface AuthUser {
  email: string;
  name: string;
  role: string;
  title: string;
  loginTime: string;
}

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AUTHORIZED_USERS = [
  {
    name: 'QA Admin',
    email: 'admin@ascot.edu.ph',
    role: 'QA Admin',
    title: 'Quality Assurance Administrator',
    defaultPassword: 'ascot',
    identifiers: ['admin@ascot.edu.ph', 'qa.admin@ascot.edu.ph', 'qaadmin@ascot.edu.ph', 'admin', 'qaadmin', 'qa admin', 'cheskacate18@gmail.com'],
  },
  {
    name: 'Staff',
    email: 'staff@ascot.edu.ph',
    role: 'Staff',
    title: 'DICADI Survey Staff',
    defaultPassword: 'ascot',
    identifiers: ['staff@ascot.edu.ph', 'staff', 'enumerator@ascot.edu.ph'],
  },
];

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError('Please provide an email address or username.');
      return;
    }

    if (!trimmedPassword) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    // Authenticate against authorized users (QA Admin or Staff)
    setTimeout(() => {
      const normalizedInput = trimmedEmail.toLowerCase();
      const matched = AUTHORIZED_USERS.find(
        (u) =>
          u.email.toLowerCase() === normalizedInput ||
          u.name.toLowerCase() === normalizedInput ||
          u.identifiers.some((id) => id.toLowerCase() === normalizedInput)
      );

      if (!matched) {
        setIsSubmitting(false);
        setError('Invalid username or email address.');
        return;
      }

      if (trimmedPassword !== matched.defaultPassword && trimmedPassword !== 'ascot') {
        setIsSubmitting(false);
        setError('Invalid password. Please check your credentials.');
        return;
      }

      const user: AuthUser = {
        email: matched.email,
        name: matched.name,
        role: matched.role,
        title: matched.title,
        loginTime: new Date().toISOString(),
      };

      if (rememberMe) {
        localStorage.setItem('ascot_fss_session', JSON.stringify(user));
      } else {
        sessionStorage.setItem('ascot_fss_session', JSON.stringify(user));
      }

      setIsSubmitting(false);
      onLoginSuccess(user);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 selection:bg-[#f5a623] selection:text-[#070b14]">
      {/* Background Decorative Rings in Palette Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#f5a623]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#ffc857]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Institutional Branding Header */}
        <div className="text-center space-y-2">
          <img
            src="/ascot-logo.png"
            alt="Aurora State College of Technology seal"
            className="w-32 h-32 sm:w-36 sm:h-36 object-contain mx-auto mb-3"
          />

          <div className="text-xs font-bold uppercase tracking-widest text-[#f5a623]">
            Republic of the Philippines
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            AURORA STATE COLLEGE OF TECHNOLOGY
          </h1>
          <div className="inline-block bg-[#0a1220] border border-[#94a3b8]/20 text-[#94a3b8] text-xs px-3 py-1 rounded-full font-medium">
            Feasibility Study System (Ascot FSS)
          </div>
          <p className="text-xs text-[#94a3b8] max-w-xs mx-auto">
            ASCOT QA Committee • DICADI Catchment Feasibility
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0a1220]/95 backdrop-blur-md border border-[#94a3b8]/20 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-[#070b14] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <KeyRound className="w-4 h-4 text-[#f5a623]" />
              <span>Sign in to access Ascot FSS</span>
            </div>
            <span className="text-[10px] text-[#ffc857] bg-[#070b14] border border-[#f5a623]/30 px-2.5 py-0.5 rounded font-mono">
              Local Storage Mode
            </span>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Email Address or Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or username"
                  className="w-full text-sm pl-10 pr-3.5 py-2.5 bg-[#070b14] border border-[#94a3b8]/30 rounded-xl text-white placeholder-[#94a3b8]/60 focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] font-mono transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full text-sm pl-10 pr-10 py-2.5 bg-[#070b14] border border-[#94a3b8]/30 rounded-xl text-white placeholder-[#94a3b8]/60 focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#94a3b8] hover:text-slate-200 select-none transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#94a3b8]/40 bg-[#070b14] text-[#f5a623] focus:ring-[#f5a623]"
                />
                <span>Remember session on this device</span>
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#f5a623] hover:bg-[#ffc857] text-[#070b14] font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#f5a623]/25 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#070b14] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Open Ascot FSS Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & System Info Footer */}
        <div className="text-center text-[11px] text-[#94a3b8] space-y-1">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ffc857]" />
            <span>Authorized Personnel Only</span>
            <span>•</span>
            <HardDrive className="w-3.5 h-3.5 text-[#f5a623]" />
            <span>Local Database Store</span>
          </div>
          <p>© {new Date().getFullYear()} Aurora State College of Technology • Baler, Aurora, Philippines</p>
        </div>
      </div>
    </div>
  );
};
