# Student Management Frontend (React + Vite)

1. `npm install`
2. `npm run dev` → http://localhost:5173 (proxies `/api` to Django on port 8000)

Backend expectations:
- Your app's urls are mounted at `/api/` (e.g. `path("api/", include("students.urls"))`)
- JWT login at `/api/auth/token/` and `/api/auth/token/refresh/` (djangorestframework-simplejwt)
- Create a login user with `python manage.py createsuperuser`

If you don't use the proxy, copy `.env.example` to `.env`, set `VITE_API_URL`, and enable CORS (django-cors-headers).
