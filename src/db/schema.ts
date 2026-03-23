import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const guests = sqliteTable("guests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  names: text("names").notNull(),
  description: text("description").notNull(),
  photo: text("photo"), // path relative to /public
  tableNumber: integer("table_number"),
  maxGuests: integer("max_guests").notNull().default(2),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const rsvpResponses = sqliteTable("rsvp_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  guestId: integer("guest_id")
    .notNull()
    .references(() => guests.id),
  attending: integer("attending", { mode: "boolean" }).notNull(),
  guestCount: integer("guest_count").notNull().default(1),
  respondedAt: text("responded_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type Guest = typeof guests.$inferSelect;
export type RsvpResponse = typeof rsvpResponses.$inferSelect;
