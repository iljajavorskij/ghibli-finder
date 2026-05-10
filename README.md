# 🌿 GhibliFinder

Сервис для поиска AI Ghibli-видео на YouTube. Находит видео с верифицированных каналов, сортирует по популярности и скорости роста.

---

## 🚀 Деплой на Vercel (5 минут)

### Шаг 1 — GitHub
1. Зайди на [github.com](https://github.com) → войди или создай аккаунт
2. Нажми **+** → **New repository**
3. Назови `ghibli-finder` → **Create repository**
4. Загрузи все файлы из этой папки (кнопка **uploading an existing file**)

### Шаг 2 — Vercel
1. Зайди на [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Нажми **Add New → Project**
3. Найди репозиторий `ghibli-finder` → **Import**
4. Нажми **Deploy** (настройки менять не нужно!)

### Шаг 3 — Готово! 🎉
Vercel даст тебе ссылку вида `ghibli-finder.vercel.app`

---

## 🔑 Защита API ключа (рекомендуется)

Чтобы ключ не светился в коде:
1. В Vercel → Settings → **Environment Variables**
2. Добавь: `YT_KEY` = `AIzaSyAAI7rwRra19QFdkuSO81o8-IH_5Gu3Bac`
3. В `api/search.js` строка уже настроена: `process.env.YT_KEY`

---

## 📁 Структура проекта

```
ghibli-finder/
├── api/
│   └── search.js      ← бэкенд (YouTube API запросы)
├── public/
│   └── index.html     ← фронтенд (интерфейс)
├── vercel.json        ← конфиг Vercel
└── package.json
```

---

## ➕ Добавить новый канал

В файле `api/search.js` добавь запрос в массив `CHANNEL_SEARCH_QUERIES`:
```js
'"Название канала" ghibli',
```
