import { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Box, Button, Typography, TextField } from '@mui/material';

const API_URL = "http://localhost:9000/api/doctors/process-patient"

function ProcessPatientForm({ appointment = null, patientId: propPatientId = null, onBack, onProcessed }) {

  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      const decoded = jwtDecode(token);
      const doctorId = decoded.doctorId;
      
      const appointmentId = appointment ? appointment.id : null;

      const patientId = appointment ? appointment.patient.id : propPatientId;

      if (!patientId) {
        console.error("Nije proslijeđen patientId!");
        return;
      }
            
      const response = await axios.post(API_URL, {
        diagnosis,
        prescription,
        appointmentId,
        doctorId,
        patientId
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(response.data);
      if(onProcessed && appointment) {
        onProcessed(appointment.id);
      }

      onBack();
    } catch (error) {
      console.error("Greška pri slanju podataka:", error.response || error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Procesiraj pacijenta</Typography>

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