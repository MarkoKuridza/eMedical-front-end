import api from "../api/api";

export const getDoctorFromTeamId = async (id) => {
    const response = await api.get(`/api/doctors/team/${id}`);
    return response.data;
}