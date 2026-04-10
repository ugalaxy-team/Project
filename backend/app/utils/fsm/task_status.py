from datetime import datetime, timezone
from sqlalchemy import select
from statemachine import StateMachine, State

from app.models import Task
from app.dependencies import SessionDep


class TaskStatus(StateMachine):
    draft = State("Draft", value="draft", initial=True)
    active = State("Active", value="active")
    submission_closed = State("SubmissionClosed", value="submissionclosed")
    evaluated = State("Evaluated", value="evaluated", final=True)

    start = draft.to(active)
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

        if self.current_state == self.draft and now >= start:
            self.start()
            changed = True

        if self.current_state == self.active and now > end:
            self.close()
            changed = True

        return changed


async def update_tasks_status(session: SessionDep):
    result = await session.execute(select(Task))
    tasks = result.scalars().all()

    changed = False

    for task in tasks:
        fsm = TaskStatus(task)
        if fsm.update_by_time():
            changed = True

    if changed:
        await session.commit()
