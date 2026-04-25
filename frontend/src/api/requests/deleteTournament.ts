import apiClient from "../client";


export const deleteTournament = async (tournamentId: number,) => {
    try {
        const response = await apiClient.delete(`/tournaments/${tournamentId}`)

        return response.data;
    } catch (e) {
        console.error(`Error occurred: ${e}`);
        throw e
    }
}