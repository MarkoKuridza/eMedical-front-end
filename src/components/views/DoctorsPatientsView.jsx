import React, {useEffect, useState} from 'react';
import { jwtDecode } from 'jwt-decode';
import ProcessPatientForm from '../ProcessPatientForm';
import { Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import axios from 'axios';


function DoctorsPatientsView(){
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const handleSelect = (patient) => {
        setSelectedPatient(patient);
    };

    useEffect( () => {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);

        const doctorId = decoded.doctorId;

        const API_URL = `http://localhost:9000/api/doctors/${doctorId}/patients`

        axios.get(API_URL, {
            headers : {
            Authorization : `Bearer ${token}`}
            })
            .then(response => {
                setPatients(response.data);
            })
            .catch(error => {
                console.error("Greska pri dobavljanju pacijenata", error);
            });
        }, []); 

    return (
    <div>
      {!selectedPatient ? (
        <>
          <Typography variant="h5">Lista pacijenata</Typography>
          <List>
            {patients.map(patient => (
              <ListItem key={patient.id} disablePadding>
                <ListItemButton onClick={() => handleSelect(patient)}>
                  <ListItemText primary={patient.first_name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <ProcessPatientForm patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
      )}
    </div>
  );

}

export default DoctorsPatientsView;