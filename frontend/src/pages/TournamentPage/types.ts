export interface Role {
  name: string;
  display_name: string;
  description: string;
}

export interface User {
  full_name: string;
  id: number;
  email: string;
  firebase_uid: string;
  roles: Role[];
  telegram?: string;
  github?: string;
  discord?: string;
  is_jury: boolean;
}

export interface TaskInfo {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  requirements: string[];
  id: number;
  tournament_id: number;
  status_id: string;
}

export interface TeamMember {
  full_name: string;
  email: string;
  telegram?: string;
  educational_institution?: string;
}

export interface Team {
  name: string;
  team_email: string;
  contact_info: string;
  members: TeamMember[];
}

export interface TournamentStatus {
  name: string;
  display_name: string;
}

export interface TournamentData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  reg_start: string;
  reg_end: string;
  min_people_in_team: number;
  max_people_in_team: number;
  max_teams: number;
  id: number;
  creator: User;
  status: TournamentStatus;
  status_name: string;
  tasks: TaskInfo[];
  active_task?: TaskInfo | null;
  juries: User[];
  teams: Team[];
}

export type TabId = "desc" | "teams" | "calendar" | "task_desc";

export interface TabConfig {
  id: TabId;
  label: string;
}

export interface StatusConfig {
  label: string;
  className: string;
  icon: React.ReactNode;
}
