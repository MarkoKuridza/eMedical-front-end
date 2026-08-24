import { useState } from 'react';
import { Box, Button, Typography, TextField } from '@mui/material';

import { useSnackbar } from "../context/SnackbarContext";
import { finishAppointment } from "../services/medicalRecordService";

function ProcessPatientForm({ appointment, onBack, onProcessed }) {

  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [refferal, setRefferal] = useState("");

  const { showSnackbar } = useSnackbar();

  const handleSubmit = async () => {
    if (!diagnosis.trim()) {
      showSnackbar("Dijagnoza je obavezna", "warning");
      return;
    }

    try {
      await finishAppointment(
        appointment.id,
        {
          diagnosis,
          prescription,
          refferal,
          emergency: false
        }
      );
      showSnackbar("Pregled uspješno zabilježen", "success");
      if (onProcessed) onProcessed(appointment.id);
    } catch (err) {
      showSnackbar("Greska pri sacuvavanju", "error");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: "column", gap: 2, maxWidth: 600 }}>
      <Typography variant="h6">
        Procesiraj pacijenta:{" "}
        <strong>{appointment.patientFirstName} {appointment.patientLastName}</strong>
      </Typography>

      <TextField
        label="Dijagnoza *"
        value={diagnosis}
        onChange={(e) => setDiagnosis(e.target.value)}
        multiline minRows={2}
        required
      />
      <TextField
        label="Recept"
        value={prescription}
        onChange={(e) => setPrescription(e.target.value)}
        multiline minRows={2}
      />
      <TextField
        label="Uputnica"
        value={refferal}
        onChange={(e) => setRefferal(e.target.value)}
        multiline minRows={2}
      />

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Sačuvaj i završi
        </Button>
        <Button variant="outlined" onClick={onBack}>
          Nazad
        </Button>
      </Box>
    </Box>
  );

};

export default ProcessPatientForm;