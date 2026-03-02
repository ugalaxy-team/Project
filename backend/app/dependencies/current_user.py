from typing import Annotated
from fastapi import Depends
from app.models import User

async def get_current_user():
    raise NotImplementedError('Authentication logic has to be implemented first!')

CurrentUserDep = Annotated[User, Depends(get_current_user)]