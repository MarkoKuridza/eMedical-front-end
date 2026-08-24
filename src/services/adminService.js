import api from "../api/api";

//get metode
export const getDoctors = async () => {
    const response = await api.get("/api/doctors/all");
    return response.data;
};

export const getNurses = async () => {
    const response = await api.get("/api/nurses/all");
    return response.data;
};

export const getPatients = async () => {
    const response = await api.get("/api/patients/all");
    return response.data;
}

export const getTeams = async () => {
    const response = await api.get("/api/teams/all");
    return response.data;
};

export const getAdminSummary = async () => {
    const response = await api.get("/api/admin/summary");
    return response.data;
};

//post metode
export const registerDoctor = async (payload) => {
    const response = await api.post("/api/doctors/register", payload);
    return response.data;
};

export const registerNurse = async (payload) => {
    const response = await api.post("/api/nurses/register", payload);
    return response.data;
};

export const registerPatient = async (payload) => {
    const response = await api.post("/api/patients/register", payload);
    return response.data;
};

export const createTeam = async (payload) => {
    const response = await api.post("/api/teams/register", payload);
    return response.data;
};

//put metode
export const updateDoctor = async (id, payload) => {
    const response = await api.put(`/api/doctors/${id}`, payload);
    return response.data;
};

export const updateNurse = async (id, payload) => {
    const response = await api.put(`/api/nurses/${id}`, payload);
    return response.data;
};

export const updatePatient = async (id, payload) => {
    const response = await api.put(`/api/patients/${id}`, payload);
    return response.data;
};

export const updateTeam = async (id, payload) => {
    const response = await api.put(`/api/teams/${id}`, payload);
    return response.data;
};

//delete metode
export const deleteDoctor = async (id) => {
    await api.delete(`/api/doctors/${id}`);
};

export const deleteNurse = async (id) => {
    await api.delete(`/api/nurses/${id}`);
};

export const deletePatient = async (id) => {
    await api.delete(`/api/patients/${id}`);
};

export const deleteTeam = async (id) => {
    await api.delete(`/api/teams/${id}`);
};
