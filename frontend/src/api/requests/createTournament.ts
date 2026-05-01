import apiClient from "../client";
export interface TournamentData {
    title: string;
    description: string;
    start_date: string;
    reg_start: string;
    reg_end: string;
    max_teams: number;
}

export const createTournament = async (data: TournamentData) => {
    try {
        const resp = await apiClient.post("/tournaments", data);
        return resp.data;
    } catch (e) {
        console.error(`Error occurred:`, e);
        throw e; 
    }
}