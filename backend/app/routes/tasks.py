from fastapi.routing import APIRouter

from app.schemas import 

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=)