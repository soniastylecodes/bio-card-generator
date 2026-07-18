import React, { useEffect, useState, useRef } from "react";
import { BioCard } from "../types.ts";
import { CardPreview } from "./CardPreview.tsx";
import { THEME_PRESETS } from "./ThemePresets.ts";
import { Copy, Check, Download, Plus, AlertCircle, Share2, Sparkles, ArrowLeft } from "lucide-react";
import html2canvas from "html2canvas";

interface CardViewPageProps {
  cardId: string;
  onGoBack: () => void;
}

export const CardViewPage: React.FC<CardViewPageProps> = ({ cardId, onGoBack }) => {
  const [card, setCard] = useState<BioCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive UI Feedback
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch card on mount or ID change
  useEffect(() => {
    let active = true;
    
    async function loadCard() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/cards/${cardId}`);
        const data = await response.json();
        
        if (!active) return;

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Could not retrieve the requested card.");
        }

        setCard(data.data);
        
        // Determine if current user is the creator of this card
        const createdIds = JSON.parse(localStorage.getItem("bio_cards_created") || "[]");
        if (createdIds.includes(cardId)) {
          setIsCreator(true);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to load card. It may have expired or does not exist.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCard();
    return () => {
      active = false;
    };
  }, [cardId]);

  // Copy Link action
  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/card/${cardId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error("Failed to copy link:", err);
      // Fallback for iframe environments or insecure origins
      const tempInput = document.createElement("input");
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Download Card as Image action (Senior Question 1 Resilience)
  const handleDownloadImage = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      // Find the card container inside the wrapper
      const cardElement = cardRef.current.querySelector(".rounded-3xl");
      if (!cardElement) throw new Error("Card element not found for conversion.");

      // Configure high-resolution capture with html2canvas
      const canvas = await html2canvas(cardElement as HTMLElement, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2, // Double scale for ultra crisp export
        logging: false,
      });

      const imageURI = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = imageURI;
      downloadLink.download = `${card.name.replace(/\s+/g, "_")}_bio_card.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Image generation failed:", err);
      alert("Failed to export your card as a PNG image. You can take a screenshot instead, or retry in a moment.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative flex items-center justify-center">
          <div className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-indigo-400 opacity-20" />
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-400 border-t-transparent" />
        </div>
        <p className="text-xs font-bold text-white/40 mt-4 uppercase tracking-[0.2em]">Loading Bio Card...</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-6 bg-white/5 backdrop-blur-2xl rounded-[40px] border border-white/10 shadow-2xl mt-12 text-white">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-display text-white mb-2">Card Not Found</h3>
        <p className="text-xs text-white/40 mb-6 leading-relaxed">
          {error || "The digital business card you are looking for does not exist or has been removed."}
        </p>
        <button
          onClick={onGoBack}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Your Own Card
        </button>
      </div>
    );
  }

  const activeTheme = THEME_PRESETS[card.theme] || THEME_PRESETS.slate;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Creator Top Bar overlay */}
      {isCreator && (
        <div className="w-full max-w-4xl bg-indigo-500/10 backdrop-blur-2xl text-white p-5 rounded-[32px] mb-8 border border-indigo-500/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-display tracking-tight">Your Card is Published!</h4>
              <p className="text-xs text-white/40">Share your custom link with potential clients and employers.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center">
            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-white/90 text-indigo-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied URL!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Link
                </>
              )}
            </button>

            {/* Download Image Button */}
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold border border-indigo-400 transition-all shadow-lg shadow-indigo-500/15 cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Save PNG
                </>
              )}
            </button>

            {/* Create New Button */}
            <button
              onClick={onGoBack}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create New
            </button>
          </div>
        </div>
      )}

      {/* Visitor Navigation Backbar */}
      {!isCreator && (
        <button
          onClick={onGoBack}
          className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white mb-6 transition-colors self-start max-w-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:translate-x-[-2px]" />
          Make Your Own Card
        </button>
      )}

      {/* Main card presentation wrapper */}
      <div 
        ref={cardRef} 
        id="bio-card-preview-container"
        className="w-full flex justify-center py-4"
      >
        <CardPreview card={card} scale={false} />
      </div>

      {/* Clean external share info */}
      {!isCreator && (
        <div className="mt-8 text-center bg-white/5 backdrop-blur-xl border border-white/10 p-4 px-6 rounded-2xl shadow-2xl max-w-sm text-white">
          <div className="flex items-center gap-2 justify-center mb-1 text-indigo-300">
            <Share2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Meet {card.name}</span>
          </div>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
            This card was generated using Bio Card Generator.
          </p>
        </div>
      )}
    </div>
  );
};
