# Dadi Ki Rasoi

## Admin and Aaj Ka Menu

`/admin/` is enabled in the root URL configuration. The `Product` model is the
site's menu item model: its categories are Thali, Sabzi & Dal, Roti & Rice,
Snacks, and Meetha. In Django Admin, use **Is available** to control whether a
dish appears on the public **Aaj Ka Menu** page.

To connect your local copy to Neon, create `resturent/.env` from
`.env.example`, set the actual `DATABASE_URL` and `DJANGO_SECRET_KEY`, and load
those variables in your shell. Then, from this directory, run:

```bash
python manage.py migrate
python manage.py createsuperuser
```

Use the superuser credentials at `/admin/`. Do not commit `.env` or share the
Neon connection string.

## Vercel

Set `DATABASE_URL`, `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, and
`DJANGO_ALLOWED_HOSTS=dadikirasoi-snowy.vercel.app,.vercel.app` in Vercel for
the Production environment. The Vercel build command runs migrations and
`collectstatic`; WhiteNoise serves the collected Django Admin assets.
