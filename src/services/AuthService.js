import axios from 'axios'

axios.defaults.withCredentials = true;

const API_URL = "http://localhost:9000/auth"

const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, {username, password});

    return response.data.role;
};

const logout = async() => {
    await axios.post(`${API_URL}/logout`, {});
}

const authService = {
    login,
    logout
};



export default authService;