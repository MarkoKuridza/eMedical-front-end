import { useEffect, useState } from 'react';
import DoctorsPatientsDetailsView from '../views/DoctorPatientsDetailsView';
import { Typography, List, ListItem, ListItemButton, ListItemText, Box, TextField } from '@mui/material';
import axios from 'axios';

axios.defaults.withCredentials = true;

const API_PATIENTS = "http://localhost:9000/api/patient/patients"


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
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
      try{
      const response = await axios.get(`${API_PATIENTS}`, {withCredentials: true});
      setPatients(response.data);
    } catch(err){
      console.log("Neuspjesno dobavljanje pacijentata", err);
    }
  };

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