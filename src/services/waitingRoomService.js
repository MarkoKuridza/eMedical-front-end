import api from "../api/api"


export const getWaitingRoom = async () => {
    const response = await api.get("/api/nurses/waiting-room");
    return response.data;
};

export const getPendingAppointments = async () => {
    const response = await api.get("/api/nurses/pending");
    return response.data;
};  