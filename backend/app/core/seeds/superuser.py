from firebase_admin import auth
from sqlalchemy import select
from app.models import User, Role
from app.config import settings


async def init_superuser(
    session,
    email: str = "admin@example.com",
    password: str = "Admin_Password_123",
    full_name: str = "System Admin",
):

    firebase_uid = None
    try:
        fb_user = auth.get_user_by_email(email)
        firebase_uid = fb_user.uid
        print(f"User {email} already exists in Firebase. UID: {firebase_uid}")
    except auth.UserNotFoundError:

        fb_user = auth.create_user(
            email=email, password=password, display_name=full_name
        )
        firebase_uid = fb_user.uid
        print(f"Created new Firebase user: {email} with UID: {firebase_uid}")
    except Exception as e:
        print(f"Firebase error: {e}. Check if serviceAccountKey.json is valid.")
        return

    admin_role_name = settings.ROLE_NAMES.ADMIN
    role_result = await session.execute(
        select(Role).where(Role.name == admin_role_name)
    )
    admin_role = role_result.scalar_one_or_none()

    if not admin_role:
        print(f"Error: Role '{admin_role_name}' not found. Run init_db first.")
        return

    user_result = await session.execute(select(User).where(User.email == email))
    user = user_result.scalar_one_or_none()

    if not user:
        new_user = User(
            email=email,
            firebase_uid=firebase_uid,
            full_name=full_name,
            roles=[admin_role],
        )
        session.add(new_user)
        print(f"Superuser {email} added to local database.")
    else:

        user.firebase_uid = firebase_uid
        if admin_role not in user.roles:
            user.roles.append(admin_role)
        print(f"User {email} updated in local database.")

    await session.commit()
