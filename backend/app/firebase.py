import firebase_admin
from pathlib import Path
cert = Path('app/serviceAccountKey.json').resolve()
cred = firebase_admin.credentials.Certificate(str(cert))
firebase = firebase_admin.initialize_app(cred)