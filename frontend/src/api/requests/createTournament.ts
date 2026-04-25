import apiClient from "../client";
export interface TournamentData {
    title: string;
    description: string;
    start_date: string;
    reg_start: string;
    reg_end: string;
    max_teams: number;
}

export const createTournament = async (
    title: string, 
    description: string, 
    start_date: string, 
    reg_end: string,
    reg_start: string, 
    max_teams: number
) => {
    try {
        const data: TournamentData = {
            title,
            description,
            start_date,
            reg_start,
            reg_end,
            max_teams,
        };
        
        const resp = await apiClient.post("/tournaments", data);
        return resp.data;
    } catch (e) {
        console.error(`Error occurred:`, e);
        throw e; 
    }
}