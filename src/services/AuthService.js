import axios from 'axios'
import { jwtDecode } from 'jwt-decode';

const API_URL = "http://localhost:9000/auth/login"

const login = async (username, password) => {
    const response = await axios.post(API_URL, {username, password});

    const token = response.data.token;

    localStorage.setItem('token', token);

    const decodedToken = jwtDecode(token);

    const role = decodedToken.role?.[0]?.authority || '';

    return role;
};

const authService = {
    login,
};

export default authService;