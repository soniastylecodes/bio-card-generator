import { useState, useEffect } from "react";
import { Homepage } from "./components/Homepage.tsx";
import { CardForm } from "./components/CardForm.tsx";
import { CardViewPage } from "./components/CardViewPage.tsx";
import { CreditCard } from "lucide-react";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync state with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
  };

  // Extract Card ID from path if viewing a card
  const isViewingCard = currentPath.startsWith("/card/");
  const cardId = isViewingCard ? currentPath.split("/card/")[1] : "";

  // Check if current card is in user's created cards to decide whether to hide standard layout headers
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    if (isViewingCard && cardId) {
      const createdIds = JSON.parse(localStorage.getItem("bio_cards_created") || "[]");
      setIsAuthor(createdIds.includes(cardId));
    } else {
      setIsAuthor(false);
    }
  }, [isViewingCard, cardId, currentPath]);

  // If a visitor is viewing a shared card standalone, we render the immersive card 
  // directly without the standard global site shell, matching the PRD description.
  const isStandaloneSharedView = isViewingCard && !isAuthor;

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isStandaloneSharedView ? 'bg-slate-950 flex items-center justify-center p-4' : 'bg-slate-950 text-white'}`}>
      {/* Animated Mesh Background for Frosted Glass Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/25 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/25 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/15 blur-[100px] rounded-full"></div>
      </div>

      {/* Immersive Visitor View (No headers/footers) */}
      {isStandaloneSharedView ? (
        <main className="w-full max-w-md relative z-10">
          <CardViewPage cardId={cardId} onGoBack={() => navigate("/")} />
        </main>
      ) : (
        /* Standard Application Shell */
        <div className="flex flex-col min-h-screen relative z-10">
          {/* Header */}
          <header className="bg-white/5 border-b border-white/10 sticky top-0 z-40 backdrop-blur-2xl text-white">
            <div className="max-w-6xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
              <button 
                onClick={() => navigate("/")}
                className="flex flex-col text-left hover:opacity-85 transition-opacity cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/10 border border-white/20 rounded-lg text-white">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h1 className="text-xl font-black tracking-tighter uppercase font-display text-white">BIOCARD<span className="text-white/60">.GEN</span></h1>
                </div>
              </button>

              <div className="flex items-center gap-4">
                {currentPath !== "/create" && !isViewingCard && (
                  <button
                    onClick={() => navigate("/create")}
                    className="px-5 py-2.5 bg-white hover:bg-white/90 text-black font-bold font-display text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-white/5 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Create Your Card
                  </button>
                )}
                {currentPath !== "/" && (
                  <button
                    onClick={() => navigate("/")}
                    className="text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
                  >
                    Back to Home
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Main workspace area */}
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-10">
            {isViewingCard && cardId ? (
              <CardViewPage cardId={cardId} onGoBack={() => navigate("/")} />
            ) : currentPath === "/create" ? (
              <CardForm 
                onCardGenerated={(card) => {
                  const created = JSON.parse(localStorage.getItem("bio_cards_created") || "[]");
                  created.push(card.id);
                  localStorage.setItem("bio_cards_created", JSON.stringify(created));
                  navigate(`/card/${card.id}`);
                }} 
              />
            ) : (
              <Homepage onStartCreating={() => navigate("/create")} />
            )}
          </main>

          {/* Sleek Modern Footer */}
          <footer className="border-t border-white/5 py-8 mt-12 bg-slate-950/40 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
              <div>
                &copy; {new Date().getFullYear()} BIOCARD.GEN · Professional Identity Generator
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
                <span className="w-1 h-1 rounded-full bg-white/15"></span>
                <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
                <span className="w-1 h-1 rounded-full bg-white/15"></span>
                <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
