FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY backend ./backend
COPY shared ./shared

WORKDIR /app/backend

EXPOSE 8000

CMD ["sh", "-c", "alembic stamp head && python -m app.init_db && uvicorn app:socket_app --host 0.0.0.0 --port 8000"]
