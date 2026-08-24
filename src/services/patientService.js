import api from "../api/api"

export const getPatients = async () => {
    const response = await api.get("/api/patients/team-patients");
    return response.data;
};


// export const getPatientById = async (id) => {
//     const response = await api.get(`/api/patient/${id}`);
//     return response.data;
// };