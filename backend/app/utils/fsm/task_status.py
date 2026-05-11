from datetime import datetime, timezone
from sqlalchemy import select
from statemachine import StateMachine, State

from app.config import settings
from app.models import Task
from app.dependencies import SessionDep


class TaskStatus(StateMachine):
    draft = State("Draft", value=settings.TASK_STATUS_NAMES.DRAFT, initial=True)
    active = State("Active", value=settings.TASK_STATUS_NAMES.ACTIVE)
    submission_closed = State(
        "SubmissionClosed", value=settings.TASK_STATUS_NAMES.SUBMISSION_CLOSED
    )
    evaluated = State("Evaluated", value=settings.TASK_STATUS_NAMES.EVALUATED, final=True)

    start = draft.to(active)
    reset_to_draft = active.to(draft)
    close = active.to(submission_closed)
    evaluate = submission_closed.to(evaluated)

    def __init__(self, task: Task):
        self.task = task
        super().__init__(model=self.task, state_field="status_id")

    def update_by_time(self):

        now = datetime.now(timezone.utc)

        start = self.task.start_time.replace(tzinfo=timezone.utc)
        end = self.task.end_time.replace(tzinfo=timezone.utc)

        changed = False
        if self.current_state == self.active and now < start:
            self.reset_to_draft()
            changed = True

        elif self.current_state == self.draft and now >= start:
            self.start()
            changed = True

        elif self.current_state == self.active and now > end:
            self.close()
            changed = True

        return changed


async def update_tasks_status(session: SessionDep):
    statement = select(Task).where(Task.status_id != settings.TASK_STATUS_NAMES.EVALUATED)
    result = await session.execute(statement)
    tasks = result.scalars().all()

    changed = False

    for task in tasks:
        fsm = TaskStatus(task)
        if fsm.update_by_time():
            changed = True

    if changed:
        await session.commit()
