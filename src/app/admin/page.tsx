"use client";

import { useState, useEffect } from "react";
import { weddingConfig } from "@/data/wedding-config";

interface GuestRow {
  id: number;
  slug: string;
  names: string;
  maxGuests: number;
  attending: boolean | null;
  guestCount: number | null;
  respondedAt: string | null;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?password=${encodeURIComponent(password)}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.guests);
        setAuthed(true);
      } else {
        alert("Неверный пароль");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div className="glass-card rounded-2xl p-10 max-w-sm w-full mx-4 text-center">
          <h1 className="font-display text-2xl mb-6">Админ-панель</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
            placeholder="Пароль"
            className="w-full px-4 py-3 rounded-lg border border-wedding-gold/30 bg-white/50 
                       font-body text-lg text-center focus:outline-none focus:border-wedding-gold 
                       transition-colors"
          />
          <button
            onClick={fetchData}
            disabled={loading}
            className="gold-button-filled mt-4 w-full"
          >
            {loading ? "..." : "Войти"}
          </button>
        </div>
      </div>
    );
  }

  const totalGuests = data.filter((g) => g.attending).reduce((sum, g) => sum + (g.guestCount ?? 0), 0);
  const confirmed = data.filter((g) => g.attending === true).length;
  const declined = data.filter((g) => g.attending === false).length;
  const pending = data.filter((g) => g.attending === null).length;

  return (
    <div className="min-h-screen bg-wedding-cream p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-light mb-2">
          Ответы гостей
        </h1>
        <p className="font-body text-wedding-muted mb-8">
          {weddingConfig.bride} & {weddingConfig.groom} — {weddingConfig.date}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Приходят", value: confirmed, color: "text-green-700" },
            { label: "Всего гостей", value: totalGuests, color: "text-wedding-sage-dark" },
            { label: "Не придут", value: declined, color: "text-red-400" },
            { label: "Без ответа", value: pending, color: "text-wedding-muted" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-5 text-center">
              <p className={`font-display text-3xl ${stat.color}`}>{stat.value}</p>
              <p className="font-body text-sm text-wedding-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-wedding-gold/20">
                  {["Гость", "Ссылка", "Статус", "Кол-во", "Дата ответа"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left font-accent text-xs tracking-[0.15em] uppercase text-wedding-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((guest) => (
                  <tr
                    key={guest.id}
                    className="border-b border-wedding-gold/10 hover:bg-wedding-gold/5 transition-colors"
                  >
                    <td className="px-5 py-4 font-body text-lg">{guest.names}</td>
                    <td className="px-5 py-4">
                      <code className="text-sm text-wedding-muted bg-wedding-gold/5 px-2 py-1 rounded">
                        /invite/{guest.slug}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      {guest.attending === null ? (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-body bg-gray-100 text-gray-500">
                          Ожидание
                        </span>
                      ) : guest.attending ? (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-body bg-green-50 text-green-700">
                          Придёт
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-body bg-red-50 text-red-400">
                          Не придёт
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-body text-center">
                      {guest.guestCount ?? "—"}
                    </td>
                    <td className="px-5 py-4 font-body text-sm text-wedding-muted">
                      {guest.respondedAt
                        ? new Date(guest.respondedAt).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
