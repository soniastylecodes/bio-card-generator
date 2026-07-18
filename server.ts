import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { db } from "./src/db/index.ts";
import { cards, links } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";
import { uploadProfilePhoto } from "./src/services/githubStorage.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// 1. Helmet Security Headers (with CSP config for SPA and sandbox iframe rendering)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://raw.githubusercontent.com", "*"],
        connectSrc: ["'self'", "*"],
        frameAncestors: ["'self'", "*"], // Permits rendering the app inside parent sandboxed iframes
      },
    },
  })
);

// 2. CORS policy restricting to the live domain URL
const allowedOrigin = process.env.APP_URL;
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps/curl) or matching allowedOrigin, including localhost for local development
      if (
        !origin ||
        origin === allowedOrigin ||
        origin === "http://localhost:5173" ||
        origin === "http://localhost:3000" ||
        origin === "http://127.0.0.1:5173" ||
        origin === "http://127.0.0.1:3000"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Ensure storage directory for uploads exists (kept for local temp uploads or legacy views if any)
const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Increase payload limits for Base64 image transfers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. Rate Limiter (maximum of 10 card generation requests per hour per IP)
const cardCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: "Too many card creation requests from this IP. Please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 4. Zod input validation schemas
const cardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name cannot exceed 100 characters"),
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  bio: z.string().min(1, "Bio is required").max(500, "Bio cannot exceed 500 characters"),
  photoUrl: z.string().optional(),
  theme: z.string().default("slate"),
  links: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().min(1, "Link title is required").max(50, "Link title cannot exceed 50 characters"),
        url: z.string().url("Link must be a valid URL"),
      })
    )
    .max(4, "You can add a maximum of 4 links")
    .default([]),
});

// API Routes

// 1. Get a specific card
app.get("/api/cards/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const cardData = await db.query.cards.findFirst({
      where: eq(cards.id, id),
      with: {
        links: true,
      },
    });

    if (!cardData) {
      return res.status(404).json({ success: false, error: "Bio Card not found." });
    }

    res.json({ success: true, data: cardData });
  } catch (error: any) {
    console.error("Error retrieving bio card:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve card data from database." });
  }
});

// 2. Create a new card
app.post("/api/cards", cardCreationLimiter, async (req, res) => {
  try {
    // Validate request body
    const parseResult = cardSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      return res.status(400).json({ success: false, error: errorMsg });
    }

    const { name, title, bio, photoUrl, links: inputLinks, theme } = parseResult.data;

    const cardId = Math.random().toString(36).substring(2, 11);
    let finalPhotoUrl = "";

    // Handle photo Base64 data (Single Point of Failure Resilience - GitHub storage)
    if (photoUrl && photoUrl.startsWith("data:image")) {
      try {
        finalPhotoUrl = await uploadProfilePhoto(photoUrl, `photo_${cardId}`);
      } catch (uploadError) {
        console.error("Failed to upload photo to GitHub. Falling back to default monogram placeholder:", uploadError);
        // Fallback: Proceed with empty photo url (which renders as a default initials monogram on front-end)
        finalPhotoUrl = "";
      }
    } else if (photoUrl && photoUrl.startsWith("http")) {
      finalPhotoUrl = photoUrl;
    }

    const newCard = await db.transaction(async (tx) => {
      const [insertedCard] = await tx.insert(cards).values({
        id: cardId,
        name,
        title,
        bio,
        photoUrl: finalPhotoUrl,
        theme: theme || "slate",
      }).returning();

      let insertedLinks: any[] = [];
      if (Array.isArray(inputLinks) && inputLinks.length > 0) {
        insertedLinks = await tx.insert(links).values(
          inputLinks.map((link: any) => ({
            id: link.id || Math.random().toString(36).substring(2, 11),
            cardId: cardId,
            title: link.title,
            url: link.url,
          }))
        ).returning();
      }

      return {
        ...insertedCard,
        links: insertedLinks,
      };
    });

    res.status(201).json({ success: true, data: newCard });
  } catch (error: any) {
    console.error("Error creating bio card:", error);
    res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
});

// Serve uploaded photo files (Legacy static path)
app.use("/uploads", express.static(UPLOADS_DIR));

// Integrate Vite Middleware
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

initializeServer();
