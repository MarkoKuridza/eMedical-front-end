import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import srLocale from "@fullcalendar/core/locales/sr"
import { useSnackbar } from "../context/SnackbarContext";
import ConfirmDialog from "../context/ConfirmDialog";
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';

axios.defaults.withCredentials = true;

const API_APPOINTMENT = "http://localhost:9000/api/appointment"
const API_PATIENTS = "http://localhost:9000/api/patient/patients"

const latinWeekdaysShort = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];

function NursePage() {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [openNewApptDialog, setOpenNewApptDialog] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        appointmentDate: null,
        patientId: null,
        doctorId: null,
        appointmentDetails: "",
    });
    const [updatedAppointment, setUpdatedAppointment] = useState(null);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const { showSnackbar } = useSnackbar();

    useEffect(() => {
        fetchAppointments();
        fetchPatients();
    }, [])

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`${API_APPOINTMENT}/appointments`, { withCredentials: true });

            setAppointments(
                response.data.map((a) => {
                    const startTime = dayjs(a.appointmentDate);
                    const endTime = startTime.add(15, "minute");

                    return {
                        id: a.id,
                        title: `${a.patient.first_name} ${a.patient.last_name}`,
                        start: startTime.toISOString(),
                        end: endTime.toISOString(),
                        backgroundColor: "#3788d8",
                        extendedProps: {
                            patientId: a.patientId,
                            doctorId: a.doctorId,
                            status: a.appointmentStatus,
                            details: a.appointmentDetails,
                        },
                    };
                })
            );
        } catch (error) {
            console.error("Greska pri ucitavanju termina", error);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await axios.get(`${API_PATIENTS}`, { withCredentials: true });
            setPatients(response.data);
        } catch (error) {
            console.log("Greska pri dobavljanju pacijenata", error);
        }
    };

    const handleDateClick = async (info) => {
        setNewAppointment({
            appointmentDate: dayjs(info.date).format("YYYY-MM-DDTHH:mm:ss"),
            appointmentDetails: "",
            patientId: null,
            doctorId: null,
        });
        setSelectedPatient(null);
        setOpenNewApptDialog(true);
    };

    const handlePatientSelect = (event, value) => {
        setSelectedPatient(value);
        if (value) {
            setNewAppointment((prev) => ({
                ...prev,
                patientId: value.id,
                doctorId: value.doctorId,
            }));
        } else {
            setNewAppointment((prev) => ({
                ...prev,
                patientId: null,
                doctorId: null,
            }));
        }
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setNewAppointment((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveNewAppointment = async () => {
        try {
            await axios.post(`${API_APPOINTMENT}/create`, newAppointment, { withCredentials: true });
            showSnackbar("Termin uspjesno kreiran", "success");
            setOpenNewApptDialog(false);
            fetchAppointments();
        } catch (error) {
            showSnackbar("Greska pri kreiranju termina", "error");
        }
    };

    const handleAppointmentDelete = async () => {
        try {
            await axios.delete(`${API_APPOINTMENT}/delete/${selectedAppointment.id}`);
            showSnackbar("Termin uspjesno obrisan", "success");
            fetchAppointments();
            setOpenDeleteDialog(false);
            setOpenDetailsDialog(false);
        } catch (error) {
            showSnackbar("Greska pri brisanju termina", "error");
        }
    }

    const handleAppointmentUpdate = async () => {
        try {
            const appt = {
                appointmentDate: updatedAppointment.appointmentDate,
                appointmentDetails: updatedAppointment.appointmentDetails,
                appointmentStatus: updatedAppointment.appointmentStatus,
            }
            await axios.put(`${API_APPOINTMENT}/update/${updatedAppointment.id}`, appt, { withCredentials: true });
            showSnackbar("Promjene uspjesno sacuvane", "success");
            fetchAppointments();
            setOpenUpdateDialog(false);
        } catch (error) {
            showSnackbar("Greska pri azuriranju termina", "error");
        }
    }

    const handleWaitingRoom = async () => {

    }

    const handleAppointmentClick = async (info) => {
        const appt = {
            id: info.event.id,
            appointmentDate: info.event.start,
            appointmentDetails: info.event.extendedProps.details,
            patient: info.event.extendedProps.patient,
            patientName: info.event.title,
            doctorId: info.event.extendedProps.doctorId,
            appointmentStatus: info.event.extendedProps.status,
        }
        setSelectedAppointment(appt);
        setOpenDetailsDialog(true);
    };

    const appointmentDetailsFields = [
        { label: "Vrijeme termina:", value: (appt) => dayjs(appt.appointmentDate).format("HH:mm") },
        { label: "Pacijent:", value: (appt) => appt.patientName },
        { label: "Doktor:", value: (appt) => appt.doctorId },
        { label: "Detalji termina:", value: (appt) => appt.appointmentDetails },
        { label: "Status:", value: (appt) => appt.appointmentStatus }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                locales={srLocale}
                locale="sr"
                editable={true}
                selectable={true}
                events={appointments}
                dateClick={handleDateClick}
                eventClick={handleAppointmentClick}
                height="90vh"
                dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'numeric', omitCommas: true }}
                //sugavu lokalizaciju nisu dobro implementirali...
                //prevod skracenih naziva dana
                dayHeaderContent={(args) => {
                    const weekday = args.date.getDay();
                    const dayNumber = args.date.getDate();
                    return `${latinWeekdaysShort[(weekday + 6) % 7]} ${dayNumber}.`;
                }}

                titleFormat={{ year: 'numeric', month: 'numeric', day: 'numeric' }}
                slotLabelFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }}
                slotMinTime="07:00:00"
                slotMaxTime="20:00:00"
                slotDuration="00:15:00"
                businessHours={[
                    {
                        daysOfWeek: [1, 2, 3, 4, 5],
                        startTime: "07:00",
                        endTime: "10:00",
                    },
                    {
                        daysOfWeek: [1, 2, 3, 4, 5],
                        startTime: "10:30",
                        endTime: "16:00",
                    },
                    {
                        daysOfWeek: [1, 2, 3, 4, 5],
                        startTime: "16:30",
                        endTime: "20:00",
                    }
                ]}
                allDaySlot={false}
                nowIndicator={true}
            />

            <Dialog open={!!selectedAppointment && openDetailsDialog} onClose={() => { setSelectedAppointment(null); setOpenDetailsDialog(false); }}>
                <DialogTitle>Detalji termina</DialogTitle>
                <DialogContent dividers>
                    {selectedAppointment && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {appointmentDetailsFields.map(({ label, value }) =>
                                <Typography key={label} variant="body1">
                                    <Typography component="span" fontWeight="bold">{label} </Typography>
                                    {value(selectedAppointment)}
                                </Typography>
                            )}
                        </Box>
                    )}

                    <DialogActions>
                        {/* proslijedi u queue da ne moram rucno kucati */}
                        <Button variant="contained" color="primary">
                            Dodaj u čekaonicu
                        </Button>
                        <Button onClick={() => {
                            setUpdatedAppointment(selectedAppointment);
                            setOpenDetailsDialog(false);
                            setOpenUpdateDialog(true);
                        }}
                            variant="contained"
                        >
                            Azuriraj
                        </Button>
                        <Button onClick={() => { setOpenDeleteDialog(true) }} variant="contained">
                            Obrisi
                        </Button>
                        <ConfirmDialog
                                open={openDeleteDialog}
                                title={"Obrisati termin?"}
                                content={"Da li ste sigurno da zelite obrisati termin?"}
                                onConfirm={() => handleAppointmentDelete(selectedAppointment)}
                                onCancel={() => setOpenDeleteDialog(false)}
                            />
                        <Button onClick={() => { setSelectedAppointment(null); setOpenDetailsDialog(false) }} variant="outlined" color="primary">
                            Zatvori
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>

            <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)}>
                <DialogTitle>Azuriraj termin</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopDateTimePicker
                                label="Datum i vrijeme termina"
                                value={updatedAppointment?.appointmentDate ? dayjs(updatedAppointment.appointmentDate) : null}
                                onChange={(value) => setUpdatedAppointment(prev => ({ ...prev, appointmentDate: value.format("YYYY-MM-DDTHH:mm:ss") }))}
                                ampm={false}
                                minutesStep={15}
                                format="DD.MM.YYYY HH:mm"
                            />
                        </LocalizationProvider>
                        <TextField
                            label="Detalji termina"
                            name="appointmentDetails"
                            multiline
                            value={updatedAppointment?.appointmentDetails ? `${updatedAppointment.appointmentDetails}` : ""}
                            onChange={(d) => setUpdatedAppointment(prev => ({ ...prev, appointmentDetails: d.target.value }))}
                        />

                        <TextField
                            label="Pacijent"
                            value={updatedAppointment?.patientName ? updatedAppointment.patientName : ""}
                            editable="false"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAppointmentUpdate} variant="contained">
                        Azuriraj
                    </Button>
                    <Button onClick={() => { setOpenUpdateDialog(false) && setUpdatedAppointment(null) }} variant="outline">
                        Otkazi
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openNewApptDialog} onClose={() => setOpenNewApptDialog(false)}>
                <DialogTitle>Kreiraj novi termin</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <TextField
                            label="Datum i vrijeme termina"
                            value={dayjs(newAppointment.appointmentDate).format("DD.MM.YYYY. HH:mm")}
                            onChange={handleFieldChange}
                            disabled
                        />

                        <Autocomplete
                            options={patients}
                            value={selectedPatient}
                            onChange={handlePatientSelect}
                            getOptionLabel={(options) => `${options.first_name} ${options.last_name}`}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Pacijent"
                                    placeholder="Pretrazi po imenu..."
                                />
                            )}
                            noOptionsText="Nema pacijenta"
                            clearOnEscape
                        />

                        <TextField
                            label="Detalji termina"
                            name="appointmentDetails"
                            multiline
                            value={newAppointment.appointmentDetails}
                            onChange={handleFieldChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleSaveNewAppointment} variant="contained" color="primary">
                        Sacuvaj
                    </Button>
                    <Button onClick={() => setOpenNewApptDialog(false)} variant="outlined" color="primary">
                        Otkazi
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>

    );
}
export default NursePage;