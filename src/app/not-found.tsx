import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
      <div className="text-center px-6">
        <p className="font-accent tracking-[0.3em] uppercase text-wedding-muted text-xs mb-4">
          Приглашение не найдено
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-light mb-6">
          Упс...
        </h1>
        <p className="font-body text-lg text-wedding-muted max-w-md mx-auto">
          Такого приглашения не существует. Проверьте ссылку или свяжитесь с нами.
        </p>
      </div>
    </div>
  );
}
