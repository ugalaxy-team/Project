import rawAppConfig from "../../../shared/app_config.json";

export interface AppRole {
  name: string;
  display_name: string;
  description: string;
}

export interface AppOption {
  name: string;
  display_name: string;
}

interface AppConfig {
  roles: AppRole[];
  tournament_statuses: AppOption[];
  task_statuses: AppOption[];
}

export const appConfig = rawAppConfig as AppConfig;

export const roles = appConfig.roles;
export const tournamentStatuses = appConfig.tournament_statuses;
export const taskStatuses = appConfig.task_statuses;

export const roleByName = Object.fromEntries(
  roles.map((role) => [role.name, role]),
) as Record<string, AppRole>;

export const tournamentStatusByName = Object.fromEntries(
  tournamentStatuses.map((status) => [status.name, status]),
) as Record<string, AppOption>;

export const taskStatusByName = Object.fromEntries(
  taskStatuses.map((status) => [status.name, status]),
) as Record<string, AppOption>;
