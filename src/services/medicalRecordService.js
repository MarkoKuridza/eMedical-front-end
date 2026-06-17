import api from "../api/api"

export const finishAppointment = async (appointmentId, data) => {
    const response = await api.post(`/api/medical-record/${appointmentId}/finish`, data);
    return response.data;
};

export const getMedicalRecordByPatientId = async (patientId) => {
    const response = await api.get(`/api/medical-record/${patientId}`);
    return response.data;
};

export const getMedicalRecordByAppointmentId = async (appointmentId) => {
    const response = await api.get(`/api/medical-record/appointment/${appointmentId}`);
    return response.data;
};