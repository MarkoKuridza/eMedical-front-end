import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Collapse, TableBody, Paper, Table, IconButton, TableCell, TableContainer, TableHead, TableRow, Typography, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from "@mui/material";
import { Fragment, useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/bs";

import { getMedicalRecordByPatientId } from "../../services/medicalRecordService";
import { editDoctorNotice } from "../../services/patientService";
dayjs.locale("bs");

function DoctorsPatientsDetailsView({ patient, onBack }) {
    const [medicalRecord, setMedicalRecord] = useState([]);
    const [open, setOpen] = useState(false);
    const [notice, setNotice] = useState(patient.doctorNotice || "");
    const [saving, setSaving] = useState(false);

    const handleOpen = () => {
        setNotice(patient.doctorNotice || "");
        setOpen(true);
    };

    const handleClose = () => {
        if (!saving) {
            setOpen(false);
        }
    };

    const fetchMedicalRecords = useCallback(async () => {
        try {
            setMedicalRecord(await getMedicalRecordByPatientId(patient.id));
        } catch (err) {
            console.error("Error while fetching medical record", err);
        }
    }, [patient.id]);

    const handleSave = async () => {
        setSaving(true);

        try {
            await editDoctorNotice(patient.id, {
                doctorNotice: notice,
            });
            setOpen(false);
        } catch (error) {
            console.error("Failed to update notice:", error);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchMedicalRecords();
    }, [fetchMedicalRecords]);

    return (
        <Box>
            <Button variant="contained" onClick={onBack} sx={{ mb: 3 }}>
                Nazad
            </Button>

            <Grid container spacing={3}>
                <Grid size={4}>
                    <Card sx={{ p: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Osnovni podaci</Typography>
                            <Typography><strong>Ime:</strong> {patient.firstName}</Typography>
                            <Typography><strong>Prezime:</strong> {patient.lastName}</Typography>
                            <Typography><strong>JMB:</strong> {patient.jmb}</Typography>
                            <Typography><strong>PIO Karton:</strong> {patient.pioNumber}</Typography>
                            <Typography><strong>Telefon:</strong> {patient.phoneNumber}</Typography>
                            <Typography><strong>Adresa:</strong> {patient.address}</Typography>
                        </CardContent>
                    </Card>
                    <br></br>
                    <>
                        <Card sx={{p: 2}}>
                            <CardContent>
                                <Typography sx={{
                                    overflowWrap: "anywhere",
                                    wordBreak: "break-word",
                                    whiteSpace: "pre-wrap",
                                }}><strong>Napomena:</strong><br /><br /> {notice}</Typography>
                                
                                <hr />
                                <Button
                                    variant="contained"
                                    onClick={handleOpen}
                                    sx={{ mt: 1 }}
                                >
                                    Izmijeni
                                </Button>

                            </CardContent>
                        </Card>
                        <Dialog
                            open={open}
                            onClose={handleClose}
                            fullWidth
                            maxWidth="sm"
                        >
                            <DialogTitle>Izmijeni napomenu</DialogTitle>

                            <DialogContent>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    multiline
                                    minRows={5}
                                    value={notice}
                                    onChange={(e) => setNotice(e.target.value)}
                                    sx={{ mt: 1 }}
                                    disabled={saving}
                                />
                            </DialogContent>

                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    disabled={saving}
                                >
                                    Otkaži
                                </Button>

                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Čuvanje..." : "Sačuvaj"}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                </Grid>

                <Grid>
                    <Typography variant="h5" gutterBottom>Medicinski karton</Typography>

                    <TableContainer component={Paper}>
                        <Table aria-label="patients medical history">
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell><strong>Datum Pregleda</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {medicalRecord.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={2}>Nema Podataka</TableCell>
                                    </TableRow>
                                ) : (
                                    medicalRecord.map((row) => (
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


    function Row({ row }) {
        const [open, setOpen] = useState(false);

        return (
            <Fragment>
                <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} >
                    <TableCell>
                        <IconButton
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
                        <Collapse in={open} timeout="auto">
                            <Box sx={{ margin: 1 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                    Detalji Pregleda
                                </Typography>
                                <Table size="medium">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Dijagnoza</TableCell>
                                            <TableCell>Recept</TableCell>
                                            <TableCell>Uputnica</TableCell>
                                            <TableCell>Pregledao Doktor</TableCell>
                                            {/* poslije cu dodati poravnanja */}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>{row.diagnosis}</TableCell>
                                            <TableCell>{row.prescription ?? "-"}</TableCell>
                                            <TableCell>{row.refferal ?? "-"}</TableCell>
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
}

export default DoctorsPatientsDetailsView;