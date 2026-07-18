import React, { useState, useRef } from "react";
import { BioCard, BioCardLink } from "../types.ts";
import { CardPreview } from "./CardPreview.tsx";
import { THEME_PRESETS } from "./ThemePresets.ts";
import { Plus, Trash2, Upload, AlertCircle, ArrowRight, UserPlus, HelpCircle } from "lucide-react";

interface CardFormProps {
  onCardGenerated: (card: BioCard) => void;
}

export const CardForm: React.FC<CardFormProps> = ({ onCardGenerated }) => {
  // Main form state
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [theme, setTheme] = useState("slate");
  const [photoUrl, setPhotoUrl] = useState("");
  const [links, setLinks] = useState<BioCardLink[]>([
    { id: "1", title: "My Portfolio", url: "" },
    { id: "2", title: "LinkedIn", url: "" }
  ]);

  // UI state
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate URL format
  const isValidUrl = (url: string) => {
    if (!url) return false;
    // Allow email addresses as mailto or pure strings, also allow localhost/local IPs
    if (url.includes("@") && !url.includes("/")) return true;
    
    // Standard URL regex
    try {
      // Add https if missing to run check
      const checkUrl = url.startsWith("http://") || url.startsWith("https://") ? url : "https://" + url;
      const parsed = new URL(checkUrl);
      return parsed.hostname.length > 0;
    } catch {
      return false;
    }
  };

  // Convert uploaded image file to Base64
  const handlePhotoFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("Image file is too large. Please select a photo under 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPhotoUrl(e.target.result as string);
        setPhotoName(file.name);
        setError(null);
      }
    };
    reader.onerror = () => {
      // Fallback: If FileReader fails, do not crash, just alert and proceed without photo
      setError("Failed to process profile image. Card can still be generated without it.");
      setPhotoUrl("");
      setPhotoName(null);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoFile(e.target.files[0]);
    }
  };

  // Links management
  const addLink = () => {
    if (links.length >= 4) return;
    const newId = Math.random().toString(36).substring(2, 9);
    setLinks([...links, { id: newId, title: "Custom Link", url: "" }]);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const updateLink = (id: string, field: keyof BioCardLink, value: string) => {
    setLinks(
      links.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  // Form submission / Generation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submissions
    if (isSubmitting) return;

    // Field validation
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter your professional title.");
      return;
    }
    if (!bio.trim()) {
      setError("Please write a brief bio.");
      return;
    }

    // Validate links
    const activeLinks = links.filter((l) => l.url.trim() !== "");
    for (const link of activeLinks) {
      if (!link.title.trim()) {
        setError(`Please provide a label for your link: "${link.url}"`);
        return;
      }
      if (!isValidUrl(link.url)) {
        setError(`The URL for "${link.title}" appears to be invalid. Please provide a standard URL or email address.`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim(),
          bio: bio.trim(),
          photoUrl,
          links: activeLinks,
          theme,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create your digital business card.");
      }

      // Success callback
      onCardGenerated(data.data);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An error occurred while generating your bio card.");
      setIsSubmitting(false);
    }
  };

  // Compile local state to represent active preview
  const previewCard: Partial<BioCard> = {
    name: name || undefined,
    title: title || undefined,
    bio: bio || undefined,
    photoUrl: photoUrl || undefined,
    links: links.filter((l) => l.title || l.url),
    theme,
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Creator Form (Take up 7 grid units on lg) */}
      <div className="lg:col-span-7 bg-white/5 backdrop-blur-2xl rounded-[40px] p-6 md:p-8 border border-white/10 shadow-2xl text-white">
        <div className="mb-6">
          <h2 className="text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-indigo-400" />
            Create Your Digital Business Card
          </h2>
          <p className="text-xs text-white/60 mt-1.5">
            Fill in your info below. Watch your business card update live on the right as you type.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl flex items-start gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5 text-red-300">Validation Error</span> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">1. Personal Profile</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="form-name" className="block text-xs font-bold text-white/80 mb-1.5">Full Name</label>
                <input
                  id="form-name"
                  type="text"
                  placeholder="e.g. Tega Freelancer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div>
                <label htmlFor="form-title" className="block text-xs font-bold text-white/80 mb-1.5">Professional Title</label>
                <input
                  id="form-title"
                  type="text"
                  placeholder="e.g. Lead Brand Designer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={60}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="form-bio" className="block text-xs font-bold text-white/80">Short Bio</label>
                <span className="text-[10px] text-white/40 font-mono">{bio.length}/180 chars</span>
              </div>
              <textarea
                id="form-bio"
                placeholder="Share your specialization, focus areas, or a brief greeting..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={180}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 2: Image Upload */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">2. Profile Image</h3>
              <span className="text-[10px] text-white/40">Optional</span>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragActive 
                  ? "border-indigo-500 bg-indigo-500/10" 
                  : photoUrl 
                    ? "border-emerald-500/40 bg-emerald-500/5" 
                    : "border-white/10 hover:border-white/20 bg-white/5"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="flex flex-col items-center justify-center">
                {photoUrl ? (
                  <div className="flex items-center gap-4">
                    <img 
                      src={photoUrl} 
                      alt="Thumbnail" 
                      className="w-12 h-12 rounded-full object-cover border border-emerald-500/30 shadow-lg"
                    />
                    <div className="text-left">
                      <span className="block text-xs font-bold text-white">Photo Attached</span>
                      <span className="block text-[10px] text-white/40 truncate max-w-[200px]">
                        {photoName || "image.png"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoUrl("");
                        setPhotoName(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="ml-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-white/40 mb-2" />
                    <span className="text-xs font-bold text-white/80">
                      Drag & drop your photo, or <span className="text-indigo-400">browse</span>
                    </span>
                    <span className="text-[10px] text-white/40 mt-1">PNG, JPG or WEBP under 4MB</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Visual Theme Selection */}
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">3. Visual Style Preset</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.values(THEME_PRESETS).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`group relative p-3.5 rounded-2xl border text-center transition-all ${
                    theme === t.id 
                      ? "border-indigo-500 bg-indigo-500/20 text-white font-bold shadow-lg shadow-indigo-500/10" 
                      : "border-white/10 hover:border-white/15 bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {/* Miniature swatch indicator */}
                  <div className="flex justify-center gap-1.5 mb-2.5">
                    {t.id === "slate" && (
                      <div className="flex gap-1">
                        <span className="w-3.5 h-3.5 rounded-full bg-slate-950 block border border-white/10" />
                        <span className="w-3.5 h-3.5 rounded-full bg-sky-400 block" />
                      </div>
                    )}
                    {t.id === "sunset" && (
                      <div className="flex gap-1">
                        <span className="w-3.5 h-3.5 rounded-full bg-indigo-950 block" />
                        <span className="w-3.5 h-3.5 rounded-full bg-orange-500 block" />
                      </div>
                    )}
                    {t.id === "emerald" && (
                      <div className="flex gap-1">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-900 block" />
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-50 block border border-white/10" />
                      </div>
                    )}
                    {t.id === "royal" && (
                      <div className="flex gap-1">
                        <span className="w-3.5 h-3.5 rounded-full bg-slate-50 block border border-white/10" />
                        <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 block" />
                      </div>
                    )}
                    {t.id === "cyberpunk" && (
                      <div className="flex gap-1">
                        <span className="w-3.5 h-3.5 rounded-full bg-black block border border-fuchsia-500/50" />
                        <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 block" />
                      </div>
                    )}
                  </div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider truncate">{t.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Links Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">4. Custom Link Tree</h3>
              <span className="text-[10px] text-white/40">{links.length}/4 Links</span>
            </div>

            <div className="space-y-3">
              {links.map((link, idx) => (
                <div key={link.id} className="flex gap-3 items-end bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4">
                      <label htmlFor={`label-${link.id}`} className="block text-[9px] font-black text-white/40 mb-1.5 uppercase tracking-wider">Button Label</label>
                      <input
                        id={`label-${link.id}`}
                        type="text"
                        placeholder="e.g. My Website"
                        value={link.title}
                        onChange={(e) => updateLink(link.id, "title", e.target.value)}
                        maxLength={24}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-8">
                      <label htmlFor={`url-${link.id}`} className="block text-[9px] font-black text-white/40 mb-1.5 uppercase tracking-wider">URL / Email address</label>
                      <input
                        id={`url-${link.id}`}
                        type="text"
                        placeholder="e.g. github.com/username or email@domain.com"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, "url", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeLink(link.id)}
                    className="p-2 py-2 text-white/40 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                    title="Remove Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {links.length < 4 && (
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center justify-center gap-1.5 w-full py-3 border-2 border-dashed border-white/10 hover:border-white/25 rounded-2xl text-xs font-bold text-white/60 hover:text-white transition-all bg-white/5 backdrop-blur-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Link
                </button>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4.5 px-6 rounded-2xl text-white font-black font-display text-xs tracking-wider uppercase shadow-xl flex items-center justify-center gap-2 transition-all ${
                isSubmitting 
                  ? "bg-white/5 border border-white/5 text-white/40 cursor-not-allowed shadow-none" 
                  : "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Professional Bio Card...
                </>
              ) : (
                <>
                  Generate Business Card
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Live Interactive Preview (Take up 5 grid units on lg) */}
      <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Preview (Interactive)
          </span>
          <span className="text-[10px] text-white/40 flex items-center gap-1 font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            Try clicking your buttons
          </span>
        </div>
        
        <div className="p-4 bg-white/5 backdrop-blur-2xl rounded-[36px] border border-white/10 shadow-2xl flex items-center justify-center min-h-[480px]">
          <CardPreview card={previewCard} scale={true} />
        </div>
      </div>
    </div>
  );
};
