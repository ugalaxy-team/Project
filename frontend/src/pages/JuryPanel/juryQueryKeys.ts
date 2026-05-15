/** Stable React Query keys for jury panel (task id is always normalized to string). */
export const juryTaskQueryKey = (taskId: string | number) => ["jury-task", String(taskId)] as const;

export const juryTasksQueryKey = ["jury-tasks"] as const;
