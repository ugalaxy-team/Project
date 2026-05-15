from sqlalchemy import select
from app.db import AsyncSessionLocal
from app.models import User, Role
from app.config import settings


async def init_superuser(
    session,
    email: str = "admin@example.com",
    firebase_uid: str = "system-admin-uid",
    full_name: str = "System Admin",
):

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

    if user:
        if admin_role not in user.roles:
            user.roles.append(admin_role)
            print(f"User {email} promoted to Admin.")
    else:
        new_user = User(
            email=email,
            firebase_uid=firebase_uid,
            full_name=full_name,
            roles=[admin_role],
        )
        session.add(new_user)
        print(f"Superuser {email} created successfully.")
