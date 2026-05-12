<h1 align="center">Документація українською мовою</h1>
<p align="center">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/⬅_Повернутися_до_документації-grey?style=for-the-badge">
  </a>
</p>

## Огляд проекту

Це повнофункціональне застосування для **управління турнірами**: організатори можуть створювати і керувати турнірами, завданнями, командами та новинами; учасники проходять структурований процес; члени журі оцінюють роботи. Інтерфейс — це односторінкова React-програма, розташована на серверу **FastAPI** з **real-time сповіщеннями** через **Socket.IO**.

**Основні можливості**

- Профілі користувачів, пов'язані з **Firebase Authentication** (вхід через Google в інтерфейсі).
- Турніри з завданнями, командами, роботами та робочими процесами оцінювання.
- Запити на ролі (наприклад організатор/адміністратор) із сповіщеннями.
- Необов'язкова панель **SQLAdmin** на хостингу API для адміністрування даних.

**Архітектура (коротко)**

```text
Браузер (React + Vite)
    │  HTTPS / REST + WebSocket (Socket.IO клієнт)
    ▼
FastAPI + python-socketio ASGI-застосування (`app:socket_app`)
    │  SQLAlchemy (асинхронно) + Alembic міграції
    ▼
PostgreSQL
```

Загальна конфігурація для ролей, статусів та категорій розташована в `shared/app_config.json` і використовується як бекендом (`app.config`), так і фронтендом (`src/config/appConfig.ts`).

---

## Стек технологій

| Область | Технології |
|---------|----------------|
| **Фронтенд** | React 19, TypeScript, Vite 7, Tailwind CSS 4, Redux Toolkit, TanStack Query, React Router 7, Socket.IO client, Firebase JS SDK, Vitest, Testing Library |
| **Бекенд** | Python 3.12, FastAPI, Uvicorn, SQLAlchemy 2 (асинхронно), Alembic, Pydantic Settings, python-socketio, Firebase Admin SDK, SQLAdmin |
| **База даних** | PostgreSQL 16 (асинхронний драйвер: `asyncpg`; тести використовують SQLite через `aiosqlite`) |
| **Тестування** | Фронтенд: Vitest (`npm run test`, `npm run test:coverage`). Бекенд: pytest + pytest-asyncio (`pytest` з папки `backend/`) |
| **Docker / розробка** | Docker Compose (`db`, `backend`, `frontend`), багатоступеневі Dockerfile'и в папках `backend/` та `frontend/` |

---

## Швидкий старт (рекомендується): Docker Compose

Це найшвидший спосіб для розробників запустити **Postgres + API + Vite dev сервер** разом.

### Передумови

- [Docker](https://docs.docker.com/get-docker/) та Docker Compose v2 (`docker compose`).

### 1. Клонування репозиторію

```bash
git clone <repository-url>
cd Project
```

### 2. Файл середовища

```bash
cp .env.example .env
```

Відредагуйте `.env` і заповніть поля **Firebase** (див. [Змінні середовища](#змінні-середовища)). Стек може стартувати з порожніми рядками Firebase, але **вхід і аутентифіковані виклики API вимагають реальної конфігурації Firebase** та **ключа облікового запису служби** на бекенді (див. [Примітки для рецензентів](#примітки-для-рецензентів)).

### 3. Облік служби Firebase (обов'язково для справжнього входу)

Бекенд очікує ключ Admin SDK за адресою:

`backend/app/serviceAccountKey.json`

Цей шлях занесено в .gitignore. Завантажте JSON облікового запису служби з вашого проекту Firebase і збережіть його там. Якщо файл відсутній, застосування все ще стартує, але **перевірка ID-токену**, яка використовується захищеними маршрутами, не запрацює, поки не буде присутній дійсний ключ.

### 4. Запуск усіх сервісів

З **кореневої папки репозиторію** (де розташований `docker-compose.yml`):

```bash
docker compose up --build
```

Дочекайтеся, поки перевірка здоров'я бази даних буде пройдена, а бекенд завершить `alembic upgrade head` та `python -m app.init_db` перш ніж використовувати застосування.

### 5. Відкрийте застосування

| Сервіс | URL |
|--------|-----|
| Фронтенд (Vite) | [http://localhost:5173](http://localhost:5173) |
| Бекенд API | [http://localhost:8000](http://localhost:8000) |
| Документація API (Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs) |
| SQLAdmin (коли ви увійшли як адміністратор) | [http://localhost:8000/admin](http://localhost:8000/admin) |
| PostgreSQL (хост) | `localhost:5432` — база даних `tournament`, користувач `tournament`, пароль `tournament` |

### Перебудова після змін залежностей

```bash
docker compose build --no-cache
docker compose up
```

### Зупинка контейнерів

```bash
docker compose down
```

Також видаліть том бази даних (свіжа БД при наступному запуску):

```bash
docker compose down -v
```

---

## Ручне налаштування

Використовуйте це, коли ви віддаєте перевагу рідним Node/Python або розробляєте без Docker.

### База даних (PostgreSQL)

1. Встановіть PostgreSQL 16 (або сумісну версію) локально.
2. Створіть базу даних і користувача, які відповідають вашому рядку з'єднання, наприклад:

```sql
CREATE USER tournament WITH PASSWORD 'tournament';
CREATE DATABASE tournament OWNER tournament;
```

3. Встановіть `SQLALCHEMY_DATABASE_URI` в корневому `.env` (див. `.env.example`). Використовуйте схему `postgresql+asyncpg://`.

### Бекенд

З **кореневої папки репозиторію**:

```bash
python3.12 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Переконайтеся, що корневий `.env` існує (скопіюйте з `.env.example`) з `SECRET_KEY`, `SQLALCHEMY_DATABASE_URI`, `FRONTEND_URL` та усіма ключами, пов'язаними з Firebase (такими ж назвами, як у `.env.example`).

Поставте `serviceAccountKey.json` в папку `backend/app/`, якщо вам потрібна перевірка токену.

З папки **`backend/`**:

```bash
cd backend
alembic upgrade head
python -m app.init_db
python main.py
```

`python main.py` запускає **Uvicorn** з перезавантаженням на `http://127.0.0.1:8000` з використанням комбінованого застосування FastAPI + Socket.IO (`app:socket_app`).

Еквівалент без перезавантаження:

```bash
uvicorn app:socket_app --host 0.0.0.0 --port 8000
```

### Фронтенд

Вимагає **Node.js** (Docker-образ використовує Node 22; CI використовує Node 20).

```bash
cd frontend
npm ci
npm run dev
```

Vite налаштовано з `envDir: ".."`, тому він завантажує `.env` з **кореневої папки репозиторію**, не тільки з `frontend/`.

---

## Змінні середовища

Конфігурація керується **файлом `.env` в корені репозиторію** (див. `backend/app/config.py`: `ENV_PATH` та `Settings`).

| Змінна | Обов'язково | Призначення |
|--------|-----------|-----------|
| `SECRET_KEY` | Так | Ключ для підпису сеансів (наприклад, SQLAdmin). |
| `SQLALCHEMY_DATABASE_URI` | Так | URL асинхронного SQLAlchemy (`postgresql+asyncpg://...` для Postgres). |
| `FRONTEND_URL` | Так | Походження фронтенду (використання, пов'язане з CORS, посилання адміністративної панелі). |
| `VITE_BACKEND_URL` | Так (фронтенд) | Базовий URL для REST-викликів з браузера. |
| `VITE_SOCKETIO_SERVER_URL` | Так (фронтенд) | URL сервера Socket.IO (той же хост/порт, що й API, у типовому налаштуванні). |
| `VITE_FIREBASE_*` | Так для автентифікаційного інтерфейсу | Конфігурація веб-застосування Firebase; бекенд `Settings` читає такі ж назви (або альтернативи `FIREBASE_*`, де зазначено в коді). |

**Створення `.env`**

```bash
cp .env.example .env
```

Заповніть значення. Для Docker Compose змінні в `.env` підставляються в `docker-compose.yml` (наприклад, `${VITE_FIREBASE_API_KEY:-}`).

---

## Налаштування бази даних

- **Docker:** Postgres визначено в `docker-compose.yml` (`postgres:16-alpine`) з базою даних/користувачем/паролем `tournament`.
- **Міграції:** Керуються **Alembic** (`backend/alembic/`). Запустіть `alembic upgrade head` з папки `backend/` після налаштування `SQLALCHEMY_DATABASE_URI`.
- **Заповнення / статичні дані**: При запуску контейнера бекенд запускає `python -m app.init_db` після міграцій. Цей скрипт створює таблиці, якщо це необхідно, і запускає `init_static_data` (ролі, статуси, категорії тощо). Перехоплювач **lifespan** FastAPI також запускає `init_static_data` при запуску (`backend/app/__init__.py`). Визначення джерела керуються в кінцевому підсумку `shared/app_config.json` та `backend/app/core/seeds/`.
- **Заповнення користувачами:** **Немає стандартних паролів програми**; користувачі аутентифікуються через **Firebase**. Створюйте користувачів, зайшовши через інтерфейс після налаштування Firebase.

---

## Запуск тестів

Наведені нижче команди відповідають `.github/workflows/tests.yml` та `package.json`.

### Фронтенд (`frontend/`)

```bash
cd frontend
npm install   # або npm ci коли lockfile довіра
npm run test
```

Покриття (Vitest + v8):

```bash
npm run test:coverage
```

Інтерактивний інтерфейс:

```bash
npm run test:ui
```

### Бекенд (`backend/`)

CI встановлює `SQLALCHEMY_DATABASE_URI` на SQLite і запускає:

```bash
cd backend
pip install -r ../requirements.txt
pytest
```

**Немає** спеціального скрипту для покриття `pytest` в `requirements.txt`; додавайте інструменти на кшталт `pytest-cov` локально, якщо вам потрібні звіти про покриття.

---

## Корисні команди

| Завдання | Команда |
|----------|---------|
| Повний стек (Docker) | `docker compose up --build` |
| Зупинка стеку | `docker compose down` |
| Скидання тому БД | `docker compose down -v` |
| Міграції бекенду | `cd backend && alembic upgrade head` |
| Одноразовий ініціалізаційний скрипт бекенду | `cd backend && python -m app.init_db` |
| Девелопмент-сервер бекенду | `cd backend && python main.py` |
| Девелопмент-сервер фронтенду | `cd frontend && npm run dev` |
| Виробничі збірки фронтенду | `cd frontend && npm run build` |
| Лінтер фронтенду | `cd frontend && npm run lint` |
| Лінтер бекенду (Ruff) | `cd backend && ruff check .` |

---

## Усунення неполадок

| Проблема | Що спробувати |
|----------|-------------|
| **Docker збірка не вдається** | Переконайтеся, що Docker має достатньо дискового простору/RAM; запустіть `docker compose build --no-cache`. На Linux ваш користувач повинен бути в групі `docker` або використовувати `sudo` відповідно до вашої політики сайту. |
| **Контейнер бекенду завершується при запуску** | Перевірте журнали: `docker compose logs backend`. Переконайтеся, що `SQLALCHEMY_DATABASE_URI` використовує хост `db` у Compose (вже встановлено в `docker-compose.yml`). Переконайтеся, що існують усі необхідні змінні середовища (використовуйте `.env` з `.env.example`). |
| **Помилки Alembic / міграції** | Запустіть з папки `backend/` з такою ж `SQLALCHEMY_DATABASE_URI`, як у поточної БД. Якщо гілки були об'єднані неправильно, розв'яжіть головки Alembic відповідно до документації Alembic. Після помилок схеми використовуйте `down -v` лише в розробці, якщо ви можете дозволити собі втратити дані. |
| **Відмовлено в'єднання до бази даних** | Postgres не готовий: дочекайтеся перевірки здоров'я. Ручні запуски повинні використовувати `localhost` та правильний порт (за замовчуванням `5432`). |
| **`ModuleNotFoundError` (Python)** | Активуйте venv та запустіть `pip install -r requirements.txt` з кореня репозиторію. |
| **помилки `npm`** | Використовуйте версію Node близько до CI (20+) або Docker (22). Видаліть `node_modules` та запустіть `npm ci`. |
| **Порт уже використовується** | Змініть локальні порти в `docker-compose.yml` (наприклад, `5174:5173`) або зупиніть процес, який використовує `8000` / `5173` / `5432`. |
| **401 / Недійсний id token** | Бекенду потрібен `backend/app/serviceAccountKey.json` з **тією ж** Firebase проєкту, що й конфігурація фронтенду. |
| **Порожній або пошкоджений інтерфейс входу** | Встановіть усі значення `VITE_FIREBASE_*` в `.env` та перебудуйте/перезапустіть фронтенд, щоб Vite їх підібрав. |

---

## Примітки для рецензентів

- **Немає стандартних облікових записів:** Доступ здійснюється через **Firebase Authentication** (наприклад, Google). Налаштуйте проект Firebase, увімкніть потрібні вам постачальники входу, додайте облікові дані веб-застосування в `.env` та додайте JSON Admin SDK як `backend/app/serviceAccountKey.json`.
- **Адміністративна панель SQLAdmin:** Після того як користувач існує і має роль **адміністратор** в БД, він може увійти через адміністративний потік входу за адресою `/admin` (на основі Firebase; див. `backend/app/admin/__init__.py`).
- **Демо-подібні дані:** Деякі елементи інтерфейсу імпортують типи або приклади даних з `frontend/src/data/mockTournaments.ts`; списки живих турнірів надходять з API при аутентифікації.
- **Сфери для перевірки:** Аутентифікація та синхронізація профілів, CRUD операції турнірів (потоки організатора), потоки завдань та команд, подання журі, сповіщення (Socket.IO), запити ролей, новини.
- **Відомі обмеження:** Без Firebase та файлу облікового запису служби ви все ще можете переглянути статичні сторінки та документацію API, але **потоки аутентифікації не працюватимуть коректно**. Firebase Analytics ініціалізується в `frontend/src/firebase.ts`; використовуйте дійсний `appId` веб-застосування для поведінки, подібної до виробництва.

---

## Макет репозиторію (довідка)

```text
docker-compose.yml    # Управляє db, backend, frontend
requirements.txt      # Python залежності (корінь; використовується Dockerfile бекенду та CI)
backend/                # FastAPI застосування, Alembic, тести
frontend/               # Vite + React SPA
shared/                 # Загальна JSON конфігурація, яка використовується обома рівнями
.env.example            # Шаблон для кореневого `.env`
```

Для більш докладної інформації про стандарти шаблону Vite див. `frontend/README.md` (примітки висхідного шаблону).


## Швидкий процес оцінювання

1. Запустіть проект за допомогою Docker
2. Відкрийте http://localhost:5173
3. Увійдіть за допомогою Firebase
4. Створіть турнір
5. Додайте завдання та команди
6. Відкрийте панель організатора
7. Перевірте робочі процеси журі та сповіщення
