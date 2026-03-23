# 💍 Wedding Invite

Персональные свадебные приглашения с уникальными ссылками и RSVP.

## Стек

- **Next.js 14** (standalone mode) — SSR + API
- **SQLite + Drizzle ORM** — хранение гостей и ответов
- **Tailwind CSS + Framer Motion** — стилизация и анимации
- **PM2 + nginx** — продакшен на VPS

## Быстрый старт

```bash
# 1. Установка
npm install

# 2. Настрой данные свадьбы
#    → src/data/wedding-config.ts

# 3. Добавь гостей
#    → src/scripts/seed.ts

# 4. Инициализируй БД
npm run db:seed

# 5. Запуск dev
npm run dev
```

Открой: `http://localhost:3000/invite/ivan-maria`

## Как добавить гостей

Отредактируй массив `sampleGuests` в `src/scripts/seed.ts`:

```ts
{
  slug: "ivan-maria",           // → URL: /invite/ivan-maria
  names: "Иван и Мария",       // отображается на странице
  description: "Дорогие ...",   // персональный текст
  photo: "/guests/ivan-maria.jpg",  // фото в public/guests/
  maxGuests: 2,                 // максимум +N
}
```

Фотографии гостей положи в `public/guests/`.

После изменений: `npm run db:seed`

## Админ-панель

Открой `/admin` и введи пароль из `wedding-config.ts`.

Показывает: кто подтвердил, сколько гостей, кто ещё не ответил.

## Деплой на VPS (РФ)

### Подготовка сервера

```bash
# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx

# PM2
sudo npm install -g pm2
```

### Деплой

```bash
# Клонируй проект на сервер
git clone <repo> ~/wedding-invite
cd ~/wedding-invite

# Настрой wedding-config.ts и seed.ts, добавь фото

# Запусти деплой
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

### Nginx + SSL

```bash
# Скопируй конфиг (замени домен внутри файла)
sudo cp deploy/nginx.conf /etc/nginx/sites-available/wedding
sudo ln -s /etc/nginx/sites-available/wedding /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL
sudo certbot --nginx -d wedding.example.ru
```

### Автозапуск PM2

```bash
pm2 startup
pm2 save
```

## Структура проекта

```
src/
├── app/
│   ├── invite/[slug]/
│   │   ├── page.tsx          # Server: загрузка данных гостя
│   │   └── InvitePage.tsx    # Client: UI с анимациями
│   ├── admin/page.tsx        # Админка с таблицей ответов
│   ├── api/
│   │   ├── rsvp/route.ts     # POST: сохранение RSVP
│   │   └── admin/route.ts    # GET: данные для админки
│   ├── layout.tsx
│   ├── page.tsx              # Главная (заглушка)
│   └── globals.css
├── db/
│   ├── schema.ts             # Drizzle schema
│   └── index.ts              # DB connection
├── data/
│   └── wedding-config.ts     # Настройки свадьбы
└── scripts/
    └── seed.ts               # Заполнение БД гостями
```

## Бэкап БД

```bash
# БД — один файл, бэкапится просто:
cp /var/www/wedding/data/wedding.db ~/backup/wedding-$(date +%F).db
```
