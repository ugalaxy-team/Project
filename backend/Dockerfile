FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY backend ./backend

WORKDIR /app/backend

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && uvicorn app:socket_app --host 0.0.0.0 --port 8000"]
