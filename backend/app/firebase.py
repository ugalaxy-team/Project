from pathlib import Path
from firebase_admin import credentials, initialize_app
from app.config import settings

firebase = None

cert_path = Path(settings.FIREBASE_CERT_PATH)
if cert_path.exists():
    try:
        cred = credentials.Certificate(settings.FIREBASE_CERT_PATH)
        firebase = initialize_app(cred)
    except Exception:
        pass
