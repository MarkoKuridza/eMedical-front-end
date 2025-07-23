import React, {useEffect, useState} from 'react';
import ProcessPatientForm from '../ProcessPatientForm';
import { Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import axios from 'axios';

const API_URL = "http://localhost:9000/patients"

function PatientsView(){
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const handleSelect = (patient) => {
        setSelectedPatient(patient);
    };

    useEffect( () => {
        axios.get(API_URL, {
            headers : {
            Authorization : `Bearer ${localStorage.getItem("token")}`}
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

export default PatientsView;