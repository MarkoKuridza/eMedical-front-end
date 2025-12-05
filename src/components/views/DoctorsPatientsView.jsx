import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import DoctorsPatientsDetailsView from '../views/DoctorPatientsDetailsView';
import { Typography, List, ListItem, ListItemButton, ListItemText, Box, TextField } from '@mui/material';
import axios from 'axios';


function DoctorsPatientsView() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const filteredPatients = patients.filter((p) =>
    `${p.first_name} ${p.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);

    const doctorId = decoded.doctorId;

    const API_URL = `http://localhost:9000/api/doctors/${doctorId}/patients`

    axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(response => {
        setPatients(response.data);
      })
      .catch(error => {
        console.error("Greska pri dobavljanju pacijenata", error);
      });
  }, []);

  return !selectedPatient ? (
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
      <Box>
        <List>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <ListItem key={patient.id} disablePadding>
                <ListItemButton onClick={() => handleSelect(patient)}>
                  <ListItemText
                    primary={`${patient.first_name} ${patient.last_name}`}
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
              Nema pretrazenog pacijenta.
            </Typography>
          )}
        </List>
      </Box>
    </Box>
  ) : (
    <DoctorsPatientsDetailsView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
  );
}

export default DoctorsPatientsView;