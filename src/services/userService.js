import api from "../api/api";


export const getTeamName = async (id) => {
    const response = await api.get(`/api/teams/${id}`);
    return response.data;
}