import React, {use, useState} from "react";
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import {useNavigate} from 'react-router-dom'
import authService from '../services/AuthService';

function LogInForm() {
    const [credentials, setCredentials] = useState({username: '', password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const role = await authService.login(credentials.username, credentials.password);

            switch(role) {
              case 'ROLE_ADMIN':
                navigate('/admin');
                break;
              case 'ROLE_DOCTOR':
                navigate('/doctor');
                break;
              case 'ROLE_NURSE':
                navigate('/nurse');
                break;
              default:
                setError('Unknown user role');
            }
        } catch (err) {
            setError("Incorrect username or password");
        }
    };

    return (
    <Box maxWidth={400} mx="auto" mt={10} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" gutterBottom>
        Prijava
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField
          label="Korisničko ime"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Lozinka"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Prijavi se
        </Button>
      </form>
    </Box>
  );
}

export default LogInForm;