// TODO: Move the types to src/types
export interface TaskStatusOption {
  name: string;
  display_name: string;
}

export interface TournamentStatusOption {
  name: string;
  display_name: string;
}

export interface AppConfig {
  task_statuses: TaskStatusOption[];
  tournament_statuses: TournamentStatusOption[];
}

export interface TeamMember {
  id: number;
  full_name: string;
  email: string;
  telegram: string;
  educational_institution?: string | null;
}

export interface TournamentSummary {
  id: number;
  title: string;
  description: string;
}

export interface Team {
  id: number;
  name: string;
  team_email: string;
  contact_info: string;
  tournament: TournamentSummary;
  members: TeamMember[];
}

export interface SubmissionUrl {
  id: number;
  url_id: string;
  value: string;
  url: {
    name: string;
    display_name: string;
  };
}

export interface EvaluationCriterion {
  id: number;
  name: string;
  description?: string | null;
  weight: number;
  max_score: number;
}

export interface JuryTask {
  id: number;
  title: string;
  description?: string | null;
  status_id: string;
  start_time: string;
  end_time: string;
  min_reviews_per_submission: number;
  max_score: number;
  is_leaderboard_visible: boolean;
  criteria: EvaluationCriterion[];
}

export interface CriterionScore {
  id?: number;
  criterion_id: number;
  score: number;
}

export interface SubmissionEvaluation {
  id: number;
  assignment_id: number;
  submission_id: number;
  jury_id: number;
  comment?: string | null;
  created_at?: string | null;
  criterion_scores: CriterionScore[];
}

export interface Submission {
  id: number;
  team_id: number;
  task_id: number;
  team: Team;
  urls: SubmissionUrl[];
}

export interface JuryAssignment {
  id: number;
  task_id: number;
  submission_id: number;
  jury_id: number;
  status: string;
  submission: Submission;
  task: JuryTask;
  evaluation?: SubmissionEvaluation | null;
}
