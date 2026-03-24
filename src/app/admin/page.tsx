"use client";

import { useState } from "react";
import { weddingConfig } from "@/data/wedding-config";
import { transliterate } from "@/lib/transliterate";

interface GuestRow {
  id: number;
  slug: string;
  names: string;
  maxGuests: number;
  attending: boolean | null;
  guestCount: number | null;
  respondedAt: string | null;
}

interface GuestFormData {
  slug: string;
  names: string;
  description: string;
  photo: string;
  maxGuests: number;
}

interface FormErrors {
  slug?: string;
  names?: string;
  description?: string;
  maxGuests?: string;
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const EMPTY_FORM: GuestFormData = {
  slug: "",
  names: "",
  description: "",
  photo: "",
  maxGuests: 2,
};

const INPUT_CLASS = `w-full px-4 py-3 rounded-lg border border-wedding-gold/30 bg-white/50
  font-body text-base focus:outline-none focus:border-wedding-gold transition-colors`;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<GuestRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<GuestFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const apiUrl = (method?: string) =>
    `/api/admin?password=${encodeURIComponent(password)}`;

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(apiUrl());
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

  const handleNamesChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      names: value,
      slug: isSlugManual ? prev.slug : transliterate(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setIsSlugManual(true);
    setFormData((prev) => ({ ...prev, slug: value }));
  };

  const resetSlugToAuto = () => {
    setIsSlugManual(false);
    setFormData((prev) => ({
      ...prev,
      slug: transliterate(prev.names),
    }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.names.trim()) {
      errors.names = "Укажите имена";
    }
    if (!formData.slug.trim()) {
      errors.slug = "Укажите слаг";
    } else if (!SLUG_PATTERN.test(formData.slug)) {
      errors.slug = "Только латиница, цифры и дефисы";
    }
    if (!formData.description.trim()) {
      errors.description = "Укажите описание";
    }
    if (formData.maxGuests < 1 || formData.maxGuests > 20) {
      errors.maxGuests = "От 1 до 20";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateGuest = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(apiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: formData.slug.trim(),
          names: formData.names.trim(),
          description: formData.description.trim(),
          photo: formData.photo.trim() || null,
          maxGuests: formData.maxGuests,
        }),
      });

      if (res.status === 409) {
        setFormErrors({ slug: "Этот слаг уже занят" });
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Ошибка при создании");
        return;
      }

      setFormData(EMPTY_FORM);
      setIsSlugManual(false);
      setIsFormOpen(false);
      setFormErrors({});
      await fetchData();
    } catch {
      alert("Ошибка сети");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGuest = async (guestId: number, guestName: string) => {
    if (!confirm(`Удалить гостя "${guestName}"? Это действие нельзя отменить.`)) {
      return;
    }

    setDeletingId(guestId);
    try {
      const res = await fetch(apiUrl(), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });

      if (res.ok) {
        await fetchData();
      } else {
        alert("Ошибка при удалении");
      }
    } catch {
      alert("Ошибка сети");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = async (slug: string) => {
    const url = `${window.location.origin}/invite/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1500);
  };

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
            className={`${INPUT_CLASS} text-lg text-center`}
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

  const totalGuests = data
    .filter((g) => g.attending)
    .reduce((sum, g) => sum + (g.guestCount ?? 0), 0);
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

        {/* Add guest button / form */}
        {!isFormOpen ? (
          <button
            onClick={() => setIsFormOpen(true)}
            className="gold-button-filled w-full mb-10"
          >
            Добавить гостя
          </button>
        ) : (
          <div className="glass-card rounded-xl p-6 mb-10">
            <h2 className="font-display text-2xl mb-6">Новый гость</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Names */}
              <div>
                <label className="font-accent text-xs tracking-wider text-wedding-muted
                  uppercase block mb-1">
                  Имена
                </label>
                <input
                  type="text"
                  value={formData.names}
                  onChange={(e) => handleNamesChange(e.target.value)}
                  placeholder="Иван и Мария"
                  className={INPUT_CLASS}
                />
                {formErrors.names && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.names}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="font-accent text-xs tracking-wider text-wedding-muted
                  uppercase block mb-1">
                  Слаг
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="ivan-i-maria"
                  className={INPUT_CLASS}
                />
                <div className="flex items-center justify-between mt-1">
                  <code className="text-xs text-wedding-muted">
                    /invite/{formData.slug || "..."}
                  </code>
                  {isSlugManual && (
                    <button
                      type="button"
                      onClick={resetSlugToAuto}
                      className="text-xs text-wedding-gold hover:underline"
                    >
                      Сгенерировать
                    </button>
                  )}
                </div>
                {formErrors.slug && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.slug}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="font-accent text-xs tracking-wider text-wedding-muted
                  uppercase block mb-1">
                  Описание
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Персональное приветствие для гостя..."
                  rows={3}
                  className={INPUT_CLASS}
                />
                {formErrors.description && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Photo */}
              <div>
                <label className="font-accent text-xs tracking-wider text-wedding-muted
                  uppercase block mb-1">
                  Фото (необязательно)
                </label>
                <input
                  type="text"
                  value={formData.photo}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, photo: e.target.value }))
                  }
                  placeholder="/guests/photo.jpg"
                  className={INPUT_CLASS}
                />
              </div>

              {/* Max guests */}
              <div>
                <label className="font-accent text-xs tracking-wider text-wedding-muted
                  uppercase block mb-1">
                  Макс. гостей
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.maxGuests}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxGuests: parseInt(e.target.value, 10) || 2,
                    }))
                  }
                  className={INPUT_CLASS}
                />
                {formErrors.maxGuests && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.maxGuests}</p>
                )}
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  setFormData(EMPTY_FORM);
                  setFormErrors({});
                  setIsSlugManual(false);
                }}
                className="font-accent text-sm tracking-wider text-wedding-muted
                  hover:text-wedding-charcoal transition-colors px-4 py-2"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateGuest}
                disabled={isSubmitting}
                className="gold-button-filled"
              >
                {isSubmitting ? "..." : "Создать"}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-wedding-gold/20">
                  {["Гость", "Ссылка", "Статус", "Кол-во", "Дата ответа", ""].map(
                    (h, i) => (
                      <th
                        key={`${h}-${i}`}
                        className="px-5 py-4 text-left font-accent text-xs tracking-[0.15em]
                          uppercase text-wedding-muted"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((guest) => (
                  <tr
                    key={guest.id}
                    className="border-b border-wedding-gold/10 hover:bg-wedding-gold/5
                      transition-colors"
                  >
                    <td className="px-5 py-4 font-body text-lg">{guest.names}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleCopyLink(guest.slug)}
                        className="text-sm text-wedding-muted bg-wedding-gold/5 px-2 py-1
                          rounded hover:bg-wedding-gold/10 transition-colors cursor-pointer"
                        title="Нажмите, чтобы скопировать ссылку"
                      >
                        {copiedSlug === guest.slug ? (
                          <span className="text-green-600">Скопировано!</span>
                        ) : (
                          <code>/invite/{guest.slug}</code>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      {guest.attending === null ? (
                        <span className="inline-block px-3 py-1 rounded-full text-sm
                          font-body bg-gray-100 text-gray-500">
                          Ожидание
                        </span>
                      ) : guest.attending ? (
                        <span className="inline-block px-3 py-1 rounded-full text-sm
                          font-body bg-green-50 text-green-700">
                          Придёт
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-sm
                          font-body bg-red-50 text-red-400">
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
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleDeleteGuest(guest.id, guest.names)}
                        disabled={deletingId === guest.id}
                        className="font-accent text-xs tracking-wider text-red-400
                          hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        {deletingId === guest.id ? "..." : "Удалить"}
                      </button>
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
