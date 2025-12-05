import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Collapse, TableBody, Paper, Table, IconButton, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Grid, Card, CardContent } from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import axios from 'axios';
import dayjs from "dayjs";
import "dayjs/locale/bs";
dayjs.locale("bs");

function DoctorsPatientsDetailsView({ patient, onBack }) {
    const [medicalRecord, setMedicalRecord] = useState([]);

    useEffect(() => {
        if (!patient?.id) {
            console.log("Patient nije proslijeđen!");
            return;
        }

        const token = localStorage.getItem("token");

        const API_URL = `http://localhost:9000/api/doctors/patients/${patient.id}/medical-records`

        axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setMedicalRecord(response.data);
            })
            .catch(error => {
                console.log("Greska pri dobavljanju zdravstvenog kartona", error)
            });
    }, [patient.id]);


    function Row({ row }) {
        const [open, setOpen] = useState(false);

        return (
            <Fragment>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} >
                    <TableCell>
                        <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                        {dayjs(row.createdAt).format("D. MMMM YYYY. HH:mm")}
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={2}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                    Detalji Pregleda
                                </Typography>
                                <Table size="small" aria-label="details">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Dijagnoza</TableCell>
                                            <TableCell>Recept</TableCell>
                                            <TableCell>Pregledao Doktor</TableCell>
                                            {/* poslije cu dodati poravnanja */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>{row.diagnosis}</TableCell>
                                            <TableCell>{row.prescription}</TableCell>
                                            <TableCell>{row.doctorFirstName} {row.doctorLastName}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            </Fragment>
        );
    }


    return (
        <Box>
            <Button variant="contained" onClick={onBack} sx={{ mb: 3 }}>
                Nazad
            </Button>

            <Grid container spacing={3}>
                <Grid>
                    <Card sx={{ p: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Osnovni podaci
                            </Typography>
                            <Typography><strong>Ime:</strong> {patient.first_name}</Typography>
                            <Typography><strong>Prezime:</strong> {patient.last_name}</Typography>
                            {/* JOS PODATAKA DODATI */}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid>
                    <Typography variant="h6" gutterBottom>
                        Medicinski karton
                    </Typography>

                    <TableContainer component={Paper}>
                        <Table aria-label="patients medical history">
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell variant="h6">Datum Pregleda</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {medicalRecord.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2}>Nema Podataka</TableCell>
                                    </TableRow>
                                ) : (medicalRecord.map((row) => (
                                    <Row key={row.createdAt} row={row} />
                                ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Box>
    );
}

export default DoctorsPatientsDetailsView;