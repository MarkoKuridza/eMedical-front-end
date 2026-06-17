import { useCallback, useEffect, useState } from 'react';
import { Typography, List, ListItem, ListItemButton, ListItemText, Box, TextField } from '@mui/material';

import DoctorsPatientsDetailsView from "./DoctorPatientsDetailsView";
import { getPatients } from "../../services/patientService";

function DoctorsPatientsView() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchPatients = useCallback(async () => {
    try {
      const response = await getPatients();
      setPatients(response);
    } catch (err) {
      console.error("Error while fetching patients", err);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter((p) =>
    `${p.firstName} ${p.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (selectedPatient) {
    return (
      <DoctorsPatientsDetailsView
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
      />
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Lista pacijenata
      </Typography>

      <Box mb={2}>
        <TextField
          variant="outlined"
          size="small"
          label="Pretrazi pacijenta"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      <List>
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <ListItem key={patient.id} disablePadding>
              <ListItemButton onClick={() => setSelectedPatient(patient)}>
                <ListItemText
                  primary={`${patient.firstName} ${patient.lastName}`}
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, ml: 1 }}
          >
            Nema pretraženog pacijenta
          </Typography>
        )}
      </List>
    </Box>
  );
}

export default DoctorsPatientsView;