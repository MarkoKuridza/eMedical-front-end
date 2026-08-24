import api from "../api/api";


export const getAppointments = async () => {
    const response = await api.get("/api/appointment/appointments")
    return response.data;
};

export const getAppointmentsByDoctorId = async (doctorId) => {
    const response = await api.get(`/api/doctors/${doctorId}/appointments`);
    return response.data;
};

export const createAppointment = async (data) => {
    const response = await api.post("/api/appointment/create", data);
    return response.data;
};

export const updateAppointment = async (id, data) => {
    const response = await api.put(`/api/appointment/update/${id}`, data);
    return response.data;
};

export const deleteAppointment = async (id) => {
    await api.delete(`/api/appointment/delete/${id}`);
};

export const markPatientArrived = async (id) => {
    const response = await api.put(`/api/nurses/appointments/${id}/arrival`);
    return response.data;
};

export const completeAppointment = async (id) => {
    const response = await api.put(`/api/nurses/appointments/${id}/complete`);
    return response.data;
};

export const startAppointment = async (id) => {
    const response = await api.put(`/api/doctors/appointments/${id}/start`);
    return response.data;
}