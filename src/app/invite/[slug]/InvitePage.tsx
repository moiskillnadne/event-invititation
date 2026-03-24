"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { weddingConfig } from "@/data/wedding-config";
import type { Guest, RsvpResponse } from "@/db/schema";

async function generateQrDataUrl(
  text: string,
  size = 200
): Promise<string> {
  try {
    const QRCode = (await import("qrcode")).default;
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 0,
      color: {
        dark: "#2C2C2C",
        light: "#00000000",
      },
      errorCorrectionLevel: "M",
    });
  } catch {
    return "";
  }
}

interface Props {
  guest: Guest;
  existingRsvp: RsvpResponse | null;
}

/* ─── Animated Section Wrapper ─── */
function Section({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`invite-section ${className}`}
    >
      {children}
    </motion.section>
  );
}

/* ─── Ornamental Divider ─── */
function Divider() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="section-divider my-4">
      <motion.span
        initial={{ scale: 0, rotate: -180 }}
        animate={inView ? { scale: 1, rotate: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-wedding-gold text-2xl px-4"
      >
        ✦
      </motion.span>
    </div>
  );
}

/* ─── Main Component ─── */
export function InvitePage({ guest, existingRsvp }: Props) {
  const [rsvp, setRsvp] = useState<RsvpResponse | null>(existingRsvp);
  const [attending, setAttending] = useState<boolean | null>(
    existingRsvp?.attending ?? null
  );
  const [guestCount, setGuestCount] = useState(existingRsvp?.guestCount ?? 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingRsvp);
  const [qrSrc, setQrSrc] = useState<string>("");

  const { gift } = weddingConfig;
  const paymentUrl = gift?.tinkoffCollectUrl || "";

  useEffect(() => {
    if (submitted && paymentUrl && gift?.enabled) {
      generateQrDataUrl(paymentUrl, 280).then(setQrSrc);
    }
  }, [submitted, paymentUrl, gift?.enabled]);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const {
    brideGenitive, groomGenitive, groom, bride,
    date, time, venue, address, mapLink, schedule, dressCode,
  } = weddingConfig;

  async function handleSubmit() {
    if (attending === null) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: guest.id,
          attending,
          guestCount: attending ? guestCount : 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRsvp(data.rsvp);
        setSubmitted(true);
      }
    } catch (e) {
      console.error("RSVP error:", e);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="invite-sections min-h-screen">
      {/* ═══════ HERO ═══════ */}
      <div ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 bg-gradient-to-b from-wedding-blush via-wedding-cream to-wedding-cream"
        />

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] w-24 h-24 border border-wedding-gold/20 rounded-full"
          />
          <motion.div
            animate={{ y: [10, -10, 10], rotate: [0, -3, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-[15%] w-16 h-16 border border-wedding-sage/20 rounded-full"
          />
          <motion.div
            animate={{ y: [-5, 15, -5] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-32 left-[20%] w-32 h-32 border border-wedding-gold/10 rounded-full"
          />
        </div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-accent tracking-[0.4em] uppercase text-wedding-muted text-xs mb-8"
          >
            Приглашение на свадьбу
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display text-6xl md:text-8xl lg:text-9xl font-light text-wedding-charcoal leading-[0.9]"
          >
            {groomGenitive}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="block text-3xl md:text-4xl font-accent text-wedding-gold my-4 tracking-[0.3em]"
            >
              &
            </motion.span>
            {brideGenitive}
          </motion.h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
            className="h-px bg-wedding-gold mx-auto mt-10 mb-6"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="font-body text-xl md:text-2xl text-wedding-muted tracking-wider"
          >
            {date}
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-12 bg-gradient-to-b from-wedding-gold/0 via-wedding-gold to-wedding-gold/0"
            />
          </motion.div>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* ═══════ PERSONAL GREETING ═══════ */}
        <Section className="text-center mb-20">
          {guest.photo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-10 relative inline-block"
            >
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden mx-auto border-2 border-wedding-gold/30 shadow-xl">
                <img
                  src={guest.photo}
                  alt={guest.names}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -inset-3 rounded-full border border-wedding-gold/15 animate-[spin_30s_linear_infinite]" />
            </motion.div>
          )}

          <h2 className="font-display text-3xl md:text-4xl font-light mb-6">
            {guest.greeting || (/ и |,/.test(guest.names) ? "Дорогие" : "Дорогой")}{" "}
            <span className="text-wedding-sage-dark">{guest.names}</span>!
          </h2>

          <p className="font-body text-lg md:text-xl text-wedding-muted leading-relaxed max-w-lg mx-auto">
            {guest.description}
          </p>
        </Section>

        <Divider />

        {/* ═══════ INVITATION TEXT ═══════ */}
        <Section className="text-center my-20">
          <p className="font-accent tracking-[0.3em] uppercase text-wedding-muted text-xs mb-6">
            С радостью приглашаем вас
          </p>
          <p className="font-body text-xl md:text-2xl leading-relaxed text-wedding-charcoal/80 max-w-lg mx-auto">
            Разделить с нами радость в день нашей свадьбы, которая состоится
          </p>
          <div className="my-10 space-y-2">
            <p className="font-display text-4xl md:text-5xl font-light">{date}</p>
            <p className="font-accent text-3xl font-bold md:text-4xl tracking-[0.2em] text-wedding-gold">
              {time}
            </p>
          </div>
        </Section>

        <Divider />

        {/* ═══════ VENUE ═══════ */}
        <Section className="text-center my-20">
          <p className="font-accent tracking-[0.3em] uppercase text-wedding-muted text-xs mb-6">
            Место проведения
          </p>
          <h3 className="font-display text-3xl md:text-4xl font-light mb-4">
            {venue}
          </h3>
          <p className="font-body text-lg text-wedding-muted mb-8">{address}</p>
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="gold-button inline-block"
          >
            <span>Открыть карту</span>
          </a>
        </Section>

        <Divider />

        {/* ═══════ SCHEDULE ═══════ */}
        <Section className="my-20">
          <p className="font-accent tracking-[0.3em] uppercase text-wedding-muted text-xs mb-10 text-center">
            Программа
          </p>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[5px] top-0 bottom-0 w-px bg-wedding-gold/20" />

            {schedule.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative flex items-start gap-6 mb-10 last:mb-0"
              >
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0 w-[11px] pt-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-wedding-gold/40 border-2 border-wedding-cream" />
                </div>
                {/* Time */}
                <div className="flex-shrink-0">
                  <span className="font-accent text-md font-semibold tracking-wider text-wedding-gold">
                    {item.time}
                  </span>
                </div>
                {/* Event */}
                <div className="pt-0.5">
                  <p className="font-body text-xl font-semibold text-wedding-charcoal">
                    {item.event}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ═══════ DRESS CODE ═══════ */}
        {dressCode && (
          <>
            <Divider />
            <Section className="text-center my-20">
              <p className="font-accent tracking-[0.3em] uppercase text-wedding-muted text-xs mb-4">
                Дресс-код
              </p>
              <p className="font-display text-3xl font-light">{dressCode}</p>
            </Section>
          </>
        )}

        <Divider />

        {/* ═══════ RSVP ═══════ */}
        <Section className="my-20">
          <div className="text-center mb-10">
            <p className="font-accent tracking-[0.3em] uppercase text-wedding-muted text-xs mb-4">
              Подтверждение
            </p>
            <h3 className="font-display text-3xl md:text-4xl font-light">
              Ждём вашего ответа
            </h3>
          </div>

          {submitted && rsvp ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-4xl mb-4"
              >
                {rsvp.attending ? "🎉" : "💌"}
              </motion.div>
              <p className="font-display text-2xl mb-2">
                {rsvp.attending ? "Ура! Ждём вас!" : "Очень жаль!"}
              </p>

              {gift?.enabled ? (
                <p className="font-body text-lg text-wedding-muted leading-relaxed max-w-md mx-auto">
                  {rsvp.attending
                    ? "Это отличная новость! Мы будем рады вас видеть! А так же мы будем "
                      + "рады вашем подарку! Для подарка вы можете использовать ссылку "
                      + "или qr код ниже"
                    : "Это грустная новость! Нам будет вас не хватать! Если вы хотите "
                      + "восполнить ваше отсутствие небольшим подарком, то можете "
                      + "воспользоваться qr кодом или ссылкой"}
                </p>
              ) : (
                <p className="font-body text-wedding-muted">
                  {rsvp.attending
                    ? `Записано гостей: ${rsvp.guestCount}`
                    : "Надеемся увидеть вас в другой раз"}
                </p>
              )}

              {gift?.enabled && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-8 space-y-6"
                >
                  {qrSrc ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                      className="inline-block"
                    >
                      <div className="relative inline-block p-5 bg-white rounded-2xl shadow-sm">
                        <img
                          src={qrSrc}
                          alt="QR код для перевода"
                          width={200}
                          height={200}
                          className="block"
                        />
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-sm">
                          <span className="font-accent text-xs tracking-wider text-wedding-muted">
                            Тинькофф
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="w-[200px] h-[200px] rounded-xl bg-wedding-gold/5 animate-pulse" />
                    </div>
                  )}

                  <p className="font-body text-sm text-wedding-muted/70 max-w-xs mx-auto">
                    Отсканируйте QR-код камерой телефона или нажмите кнопку ниже
                  </p>

                  {paymentUrl && (
                    <a
                      href={paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gold-button-filled inline-block"
                    >
                      Открыть ссылку
                    </a>
                  )}

                  <p className="font-body text-xs text-wedding-muted/40">
                    Сумма — на ваше усмотрение
                  </p>
                </motion.div>
              )}

              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 font-accent text-sm tracking-wider text-wedding-gold underline underline-offset-4 hover:text-wedding-sage-dark transition-colors"
              >
                Изменить ответ
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="glass-card rounded-2xl p-8 md:p-10 space-y-8"
            >
              {/* Attending choice */}
              <div className="flex gap-4 justify-center">
                {[
                  { value: true, label: "С радостью приду!", icon: "✓" },
                  { value: false, label: "Не смогу", icon: "✕" },
                ].map((option) => (
                  <motion.button
                    key={String(option.value)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setAttending(option.value)}
                    className={`flex-1 max-w-[200px] py-5 px-4 rounded-xl border-2 transition-all duration-300 font-body text-lg ${
                      attending === option.value
                        ? option.value
                          ? "border-wedding-sage bg-wedding-sage/10 text-wedding-sage-dark"
                          : "border-wedding-muted/40 bg-wedding-muted/5 text-wedding-muted"
                        : "border-wedding-gold/20 hover:border-wedding-gold/40"
                    }`}
                  >
                    <span className="block text-2xl mb-1">{option.icon}</span>
                    {option.label}
                  </motion.button>
                ))}
              </div>

              {/* Guest count */}
              {attending && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-center space-y-4"
                >
                  <p className="font-body text-lg text-wedding-muted">
                    Количество гостей
                  </p>
                  <div className="flex items-center justify-center gap-6">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      className="w-12 h-12 rounded-full border-2 border-wedding-gold/30 text-wedding-gold text-xl hover:bg-wedding-gold/5 transition-colors"
                    >
                      −
                    </motion.button>
                    <span className="font-display text-4xl w-12 text-center">
                      {guestCount}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setGuestCount(Math.min(guest.maxGuests, guestCount + 1))
                      }
                      className="w-12 h-12 rounded-full border-2 border-wedding-gold/30 text-wedding-gold text-xl hover:bg-wedding-gold/5 transition-colors"
                    >
                      +
                    </motion.button>
                  </div>
                  {guestCount >= guest.maxGuests && (
                    <p className="text-sm text-wedding-muted/60 font-body">
                      Максимум: {guest.maxGuests}
                    </p>
                  )}
                </motion.div>
              )}

              {/* Submit */}
              {attending !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center pt-2"
                >
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gold-button-filled disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Отправляем..." : "Подтвердить"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </Section>

        {/* ═══════ FOOTER ═══════ */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center py-16 space-y-4"
        >
          <div className="ornament">✦ ✦ ✦</div>
          <p className="font-display text-2xl font-light mt-6">
            {groom} & {bride}
          </p>
          <p className="font-body text-wedding-muted">{date}</p>
          <p className="font-body text-sm text-wedding-muted/50 mt-8">
            С любовью и нетерпением ждём встречи
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
