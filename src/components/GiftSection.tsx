"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { weddingConfig } from "@/data/wedding-config";

/**
 * Minimal QR Code generator — no external dependencies.
 * Encodes a URL string into a QR code and renders it as an SVG data URL.
 * Uses the qrcode canvas approach via dynamic import, or falls back
 * to a simple SVG-based QR using a tiny inline encoder.
 */

// Tiny QR matrix generator (alphanumeric mode, error correction L)
// For production URLs we use a proper library — this is the fallback.
async function generateQrDataUrl(text: string, size = 200): Promise<string> {
  // Dynamic import of qrcode library (installed via npm)
  try {
    const QRCode = (await import("qrcode")).default;
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 0,
      color: {
        dark: "#2C2C2C",
        light: "#00000000", // transparent background
      },
      errorCorrectionLevel: "M",
    });
  } catch {
    // Fallback: return empty — will show link instead
    return "";
  }
}

export function GiftSection() {
  const { gift } = weddingConfig;
  if (!gift?.enabled) return null;

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [qrSrc, setQrSrc] = useState<string>("");
  const [isRevealed, setIsRevealed] = useState(false);

  const paymentUrl = gift.tinkoffCollectUrl || "";

  useEffect(() => {
    if (isRevealed && paymentUrl) {
      generateQrDataUrl(paymentUrl, 280).then(setQrSrc);
    }
  }, [isRevealed, paymentUrl]);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="invite-section my-20"
    >
      <div className="text-center mb-8">
        <p className="font-accent tracking-[0.3em] uppercase text-wedding-muted text-xs mb-4">
          ✦
        </p>
        <h3 className="font-display text-3xl md:text-4xl font-light">
          {gift.heading}
        </h3>
      </div>

      <div className="glass-card rounded-2xl p-8 md:p-10 text-center">
        <p className="font-body text-lg text-wedding-muted leading-relaxed max-w-md mx-auto mb-8">
          {gift.text}
        </p>

        {!isRevealed ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsRevealed(true)}
            className="gold-button inline-block"
          >
            <span>Хочу поздравить</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* QR Code */}
            {qrSrc ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
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
                  {/* Tinkoff badge */}
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

            {/* Direct link button */}
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

            <p className="font-body text-xs text-wedding-muted/40 mt-4">
              Сумма — на ваше усмотрение
            </p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
