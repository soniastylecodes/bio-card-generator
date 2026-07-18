export interface ThemeConfig {
  id: string;
  name: string;
  pageBg: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  linkBtn: string;
  accentBorder: string;
  badgeBg: string;
  fontFamily: string;
}

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  slate: {
    id: "slate",
    name: "Neo-Slate Minimal",
    pageBg: "bg-slate-950 text-slate-100",
    cardBg: "bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/40",
    textPrimary: "text-white font-display font-bold",
    textSecondary: "text-white/60 font-sans",
    linkBtn: "bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-indigo-500/5",
    accentBorder: "border-indigo-500/20 hover:border-indigo-500/40",
    badgeBg: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
    fontFamily: "font-sans",
  },
  sunset: {
    id: "sunset",
    name: "Sunset Dream",
    pageBg: "bg-gradient-to-br from-indigo-950 via-purple-900 to-orange-950 text-white",
    cardBg: "bg-orange-500/5 border border-orange-500/20 backdrop-blur-2xl shadow-2xl shadow-indigo-950/50",
    textPrimary: "text-white font-display font-black",
    textSecondary: "text-orange-200/60 font-sans",
    linkBtn: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-200 border border-orange-500/15 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-orange-500/10",
    accentBorder: "border-orange-500/20 hover:border-orange-500/50",
    badgeBg: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
    fontFamily: "font-sans",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Oasis",
    pageBg: "bg-stone-50 text-emerald-950",
    cardBg: "bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-2xl shadow-2xl shadow-emerald-950/20",
    textPrimary: "text-stone-100 font-display font-bold",
    textSecondary: "text-emerald-300/60 font-sans",
    linkBtn: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 border border-emerald-500/15 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-emerald-500/10",
    accentBorder: "border-emerald-500/20 hover:border-emerald-500/50",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    fontFamily: "font-sans",
  },
  royal: {
    id: "royal",
    name: "Royal Classic",
    pageBg: "bg-slate-50 text-slate-900",
    cardBg: "bg-indigo-500/5 border border-indigo-500/25 backdrop-blur-2xl shadow-2xl shadow-indigo-950/30",
    textPrimary: "text-white font-display font-bold",
    textSecondary: "text-indigo-200/60 font-sans",
    linkBtn: "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 border border-indigo-500/15 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-indigo-500/10",
    accentBorder: "border-indigo-500/20 hover:border-indigo-500/50",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    fontFamily: "font-sans",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyber Neon",
    pageBg: "bg-zinc-950 text-zinc-100 font-mono",
    cardBg: "bg-black/35 border-2 border-fuchsia-500/60 backdrop-blur-2xl shadow-[0_0_25px_rgba(217,70,239,0.15)]",
    textPrimary: "text-zinc-50 font-mono font-black tracking-tight",
    textSecondary: "text-cyan-300/70 font-mono text-xs",
    linkBtn: "bg-black/50 hover:bg-fuchsia-950/30 text-fuchsia-400 border border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.1)] transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-fuchsia-500/20",
    accentBorder: "border-cyan-500/30 hover:border-cyan-500/60",
    badgeBg: "bg-cyan-950/60 text-cyan-400 border border-cyan-500/30",
    fontFamily: "font-mono",
  },
};
