from firebase_admin import credentials, initialize_app
from app.config import settings

cred = credentials.Certificate(settings.FIREBASE_CERT_PATH)
firebase = initialize_app(cred)
