import React from "react";
import { BioCard } from "../types.ts";
import { THEME_PRESETS } from "./ThemePresets.ts";
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  Globe, 
  Link as LinkIcon, 
  Youtube, 
  Instagram,
  User
} from "lucide-react";

interface CardPreviewProps {
  card: Partial<BioCard>;
  scale?: boolean;
}

// Helper to get initials from name
const getInitials = (name?: string) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

// Helper to resolve appropriate icon for URL
const getUrlIcon = (url: string) => {
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes("github.com")) return <Github className="w-5 h-5" />;
  if (lowercaseUrl.includes("linkedin.com")) return <Linkedin className="w-5 h-5" />;
  if (lowercaseUrl.includes("twitter.com") || lowercaseUrl.includes("x.com")) return <Twitter className="w-5 h-5" />;
  if (lowercaseUrl.includes("mailto:") || lowercaseUrl.includes("@")) return <Mail className="w-5 h-5" />;
  if (lowercaseUrl.includes("youtube.com") || lowercaseUrl.includes("youtu.be")) return <Youtube className="w-5 h-5" />;
  if (lowercaseUrl.includes("instagram.com")) return <Instagram className="w-5 h-5" />;
  if (lowercaseUrl.startsWith("http") || lowercaseUrl.startsWith("https")) return <Globe className="w-5 h-5" />;
  return <LinkIcon className="w-5 h-5" />;
};

export const CardPreview: React.FC<CardPreviewProps> = ({ card, scale = false }) => {
  const themeKey = card.theme || "slate";
  const theme = THEME_PRESETS[themeKey] || THEME_PRESETS.slate;

  const displayPhoto = card.photoUrl;

  return (
    <div 
      className={`w-full max-w-md mx-auto rounded-3xl p-8 transition-all duration-500 ${theme.cardBg} ${theme.fontFamily} ${scale ? 'hover:scale-[1.01]' : ''}`}
      style={{ contentVisibility: "auto" }}
    >
      {/* Profile Section */}
      <div className="flex flex-col items-center text-center">
        {/* Photo Container */}
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-white/30 blur-sm scale-105" />
          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt={card.name || "Profile"}
              referrerPolicy="no-referrer"
              className="relative w-28 h-28 rounded-full object-cover border-2 border-white/20 shadow-lg"
              onError={(e) => {
                // If local path fails to load, clear it to fallback to monogram
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className={`relative w-28 h-28 rounded-full flex items-center justify-center border-2 border-white/15 shadow-lg text-3xl font-bold tracking-wider ${theme.id === 'royal' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-white/10 text-white'}`}>
              {card.name ? getInitials(card.name) : <User className="w-10 h-10 opacity-60" />}
            </div>
          )}
        </div>

        {/* Name and Title */}
        <h1 className={`text-2xl font-bold tracking-tight mb-1.5 ${theme.textPrimary}`}>
          {card.name || "Your Name"}
        </h1>
        
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 tracking-wide uppercase ${theme.badgeBg}`}>
          {card.title || "Your Professional Title"}
        </span>

        {/* Divider line */}
        <div className={`w-12 h-0.5 rounded-full mb-5 bg-current opacity-25`} />

        {/* Bio */}
        <p className={`text-sm leading-relaxed mb-6 max-w-xs whitespace-pre-wrap ${theme.textSecondary}`}>
          {card.bio || "Write a brief bio about yourself, your skills, or what you are currently building..."}
        </p>
      </div>

      {/* Links Section */}
      <div className="space-y-3">
        {card.links && card.links.length > 0 ? (
          card.links.map((link) => {
            if (!link.url) return null;
            
            // Auto-format links: ensure http/https/mailto is present
            let formattedUrl = link.url;
            if (!/^https?:\/\//i.test(formattedUrl) && !/^mailto:/i.test(formattedUrl)) {
              if (formattedUrl.includes("@") && !formattedUrl.includes("/")) {
                formattedUrl = `mailto:${formattedUrl}`;
              } else {
                formattedUrl = `https://${formattedUrl}`;
              }
            }

            return (
              <a
                key={link.id}
                id={`link-item-${link.id}`}
                href={formattedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between w-full px-5 py-4 rounded-2xl font-medium transition-all duration-300 ${theme.linkBtn}`}
              >
                <div className="flex items-center gap-3">
                  {getUrlIcon(formattedUrl)}
                  <span className="text-sm tracking-wide">{link.title || "Link Title"}</span>
                </div>
                <span className="text-xs opacity-50 font-sans font-normal tracking-wide">Visit</span>
              </a>
            );
          })
        ) : (
          <div className="text-center py-4 border border-dashed rounded-2xl border-white/10 opacity-40">
            <span className="text-xs">No links added yet</span>
          </div>
        )}
      </div>

      {/* Mini signature */}
      <div className="text-center mt-8 opacity-25 hover:opacity-50 transition-opacity duration-300">
        <span className="text-[10px] uppercase tracking-widest font-sans font-medium">Bio Card Generator</span>
      </div>
    </div>
  );
};
