import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { guests } from "../db/schema";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "wedding.db");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");

// Create tables manually (simple approach without migrations)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    names TEXT NOT NULL,
    description TEXT NOT NULL,
    photo TEXT,
    table_number INTEGER,
    max_guests INTEGER NOT NULL DEFAULT 2,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS rsvp_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_id INTEGER NOT NULL REFERENCES guests(id),
    attending INTEGER NOT NULL,
    guest_count INTEGER NOT NULL DEFAULT 1,
    responded_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const db = drizzle(sqlite);

// ——— Пример гостей — замени своими ———
const sampleGuests = [
  {
    slug: "ivan-maria",
    names: "Иван и Мария",
    description:
      "Наши самые близкие друзья! Столько прекрасных моментов мы пережили вместе. Будет здорово видеть вас на нашем празднике!",
    photo: "/guests/ivan-maria.png",
    maxGuests: 2,
  },
  {
    slug: "aleksey",
    names: "Алексей",
    description:
      "Дорогой друг, мы очень хотим, чтобы ты разделил с нами этот особенный день!",
    photo: "/guests/aleksey.jpg",
    maxGuests: 2,
  },
  {
    slug: "petrov-family",
    names: "Семья Петровых",
    description:
      "Дорогие Сергей, Ольга и Настя! Будем рады видеть всю вашу замечательную семью!",
    photo: "/guests/petrov-family.jpg",
    maxGuests: 4,
  },
  {
    slug: "anna-k",
    names: "Анна Кузнецова",
    description:
      "Аня, ты всегда была рядом в важные моменты. Этот день не будет полным без тебя!",
    photo: null,
    maxGuests: 2,
  },
];

// Clear and re-seed
sqlite.exec("DELETE FROM rsvp_responses");
sqlite.exec("DELETE FROM guests");

for (const guest of sampleGuests) {
  db.insert(guests).values(guest).run();
}

console.log(`✅ Seeded ${sampleGuests.length} guests into ${DB_PATH}`);
console.log("\nGuest links:");
for (const g of sampleGuests) {
  console.log(`  ${g.names.padEnd(20)} → /invite/${g.slug}`);
}
