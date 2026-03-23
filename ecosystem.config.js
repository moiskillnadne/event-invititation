module.exports = {
  apps: [
    {
      name: "wedding",
      script: ".next/standalone/server.js",
      cwd: "/var/www/wedding",
      env: {
        NODE_ENV: "production",
        HOSTNAME: "0.0.0.0",
        PORT: 3000,
        DATABASE_URL: "/var/www/wedding/data/wedding.db",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "256M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
