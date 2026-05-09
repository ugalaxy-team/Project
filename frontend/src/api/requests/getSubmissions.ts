import type { User } from "firebase/auth";
import apiClient from "../client";
import type { TournamentData } from "./createTournament";
import type { ApiUserData } from "@/slices/user";

export interface TeamMember {
    full_name: string;
    email: string;
    telegram: string;
    educational_institution: string;
};

export interface Team {
    name: string;
    team_email: string;
    contact_info: string;
    tournament: TournamentData;
    members: TeamMember[];
    captain: ApiUserData;
};

export interface SubmissionUrl {
    url: string;
};

export interface SubmissionEvaluation {
    jury: ApiUserData;
};

export interface Submission {
    team: Team;
    urls: SubmissionUrl[];
    evaluations: SubmissionEvaluation[];
}

export const getSubmissions = async (id: string | number, user: User) => {
  try {
    const token = await user.getIdToken();
    const resp = await apiClient.get<Submission[]>(`/tournaments/${id}/submissions/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return resp.data;
  } catch (e) {
    console.log(`Error occured ${e}`);
  }
};
