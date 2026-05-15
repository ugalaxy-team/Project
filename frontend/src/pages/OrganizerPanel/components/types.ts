export interface Creator {
  id: number;
  full_name: string;
  email: string;
}

export interface TournamentStatus {
  name: string;
  display_name: string;
}

export interface Roles {
  name: string;
  display_name: string;
  description: string;
}

export interface User {
  full_name: string;
  id: number;
  email: string;
  firebase_uid: string;
  roles: Roles[];
  telegram: string;
  github: string;
  discord: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  requirements: string[];
}

export interface Team {
  id?: number;
  name: string;
  members?: User[];
}

export interface Tournament {
  id: number;
  title: string;
  description: string;

  creator: Creator;

  status: TournamentStatus;
  status_name: string;

  reg_start?: string;
  reg_end?: string;

  start_date?: string;
  end_date?: string;

  max_teams?: number;

  min_people_in_team?: number;
  max_people_in_team?: number;

  tasks?: Task[];

  juries?: User[];

  teams?: Team[];
}

export interface FormData {
  title: string;
  description: string;

  start_date: string;

  reg_start: string;
  reg_end: string;

  min_people_in_team: number;
  max_people_in_team: number;

  max_teams: number;

  juries: number[];
}