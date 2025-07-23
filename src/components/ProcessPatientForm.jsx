import React, {useState} from 'react';
import axios from 'axios';
import {Box, Button, Typography, TextField} from '@mui/material';

const API_URL = "http://localhost:9000/api/doctors/process-patient"

function ProcessPatientForm({patient, onBack}){
    const [patientId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [prescription, setPrescription] = useState('');

    const handleSubmit = async () => {
        const response = axios.post(API_URL, {
            patientId : patient.id,
            diagnosis,
            prescription
        }, {headers : {
            Authorization : `Bearer ${localStorage.getItem("token")}`
        }
    });

    
    console.log(response.data);
    onBack();
    };

    return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Procesiraj pacijenta</Typography>
      
      <TextField
        label="ID pacijenta"
        value={patientId}
      />
      <TextField
        label="Dijagnoza"
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
        required
      />
      <TextField
        label="Recept"
        value={prescription}
        onChange={(e) => setPrescription(e.target.value)}
      />

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mr: 2 }}>
          Sačuvaj
        </Button>
        <Button variant="outlined" onClick={onBack}>
          Nazad
        </Button>
      </Box>
    </Box>
);
    
};





export default ProcessPatientForm;