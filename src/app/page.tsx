import { weddingConfig } from "@/data/wedding-config";

export default function HomePage() {
  const { bride, groom, date } = weddingConfig;

  return (
    <div className="min-h-screen flex items-center justify-center bg-wedding-cream">
      <div className="text-center px-6">
        <p className="font-accent tracking-[0.4em] uppercase text-wedding-muted text-xs mb-8">
          Свадьба
        </p>
        <h1 className="font-display text-5xl md:text-7xl font-light leading-[0.9]">
          {bride}
          <span className="block text-2xl font-accent text-wedding-gold my-3 tracking-[0.3em]">
            &
          </span>
          {groom}
        </h1>
        <div className="w-20 h-px bg-wedding-gold mx-auto mt-8 mb-4" />
        <p className="font-body text-xl text-wedding-muted">{date}</p>
        <p className="font-body text-sm text-wedding-muted/50 mt-12">
          Используйте персональную ссылку из приглашения
        </p>
      </div>
    </div>
  );
}
