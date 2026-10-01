import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Autocomplete, CircularProgress } from '@mui/material';

import { useSnackbar } from "../context/SnackbarContext";
import { finishAppointment, getDiagnoses } from "../services/medicalRecordService";

function ProcessPatientForm({ appointment, onBack, onProcessed }) {

  const [diagnosis, setDiagnosis] = useState("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [description, setDescription] = useState("");
  const [prescription, setPrescription] = useState("");
  const [refferal, setRefferal] = useState("");

  const [loadingDiagnoses, setLoadingDiagnoses] = useState(true);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const loadDiagnoses = async () => {
      try {
        const data = await getDiagnoses();
        setDiagnosis(data);
      } catch (err) {
        showSnackbar("Greška pri učitavanju dijagnoza", "error");
      } finally {
        setLoadingDiagnoses(false);
      }
    };

    loadDiagnoses();
  }, [showSnackbar]);

  const handleSubmit = async () => {
    if (!selectedDiagnosis) {
      showSnackbar("Dijagnoza je obavezna", "warning");
      return;
    }

    try {
      await finishAppointment(
        appointment.id,
        {
          diagnosis: selectedDiagnosis.code,
          description,
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

      <Autocomplete
        options={diagnosis}
        value={selectedDiagnosis}
        onChange={(event, newValue) => {
          setSelectedDiagnosis(newValue);
        }}
        loading={loadingDiagnoses}
        getOptionLabel={(option) =>
          `${option.code} - ${option.name}`
        }
        isOptionEqualToValue={(option, value) =>
          option.code === value.code
        }
        filterOptions={(options, { inputValue }) => {
          const search = inputValue.toLowerCase().trim();

          const results = options
            .map((option) => {
              const code = option.code.toLowerCase();
              const name = option.name.toLowerCase();

              let score = 0;

              if (code === search) {
                score = 100;
              }
              else if (code.startsWith(search)) {
                score = 80;
              }
              else if (name.startsWith(search)) {
                score = 70;
              }
              else if (code.includes(search)) {
                score = 50;
              }
              else if (name.includes(search)) {
                score = 40;
              }

              return {option, score};
            }).filter((result) => result.score > 0).sort((a, b) => b.score - a.score).slice(0, 100);

          return results.map((result) => result.option);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Dijagnoza"
            placeholder="Unesite šifru ili naziv dijagnoze"
            required
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loadingDiagnoses ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />
      <TextField
        label="Opis"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        minRows={3}
      />
      <TextField
        label="Recept"
        value={prescription}
        onChange={(e) => setPrescription(e.target.value)}
        multiline minRows={2}
        required
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