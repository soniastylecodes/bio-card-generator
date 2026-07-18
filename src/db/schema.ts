import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const cards = pgTable("cards", {
  id: varchar("id", { length: 256 }).primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  theme: varchar("theme", { length: 50 }).default("slate").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const links = pgTable("links", {
  id: varchar("id", { length: 256 }).primaryKey(),
  cardId: varchar("card_id", { length: 256 })
    .notNull()
    .references(() => cards.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
});

export const cardsRelations = relations(cards, ({ many }) => ({
  links: many(links),
}));

export const linksRelations = relations(links, ({ one }) => ({
  card: one(cards, {
    fields: [links.cardId],
    references: [cards.id],
  }),
}));
