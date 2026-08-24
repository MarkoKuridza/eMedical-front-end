import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Autocomplete, Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Drawer, List, ListItem, ListItemButton, ListItemText, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import srLocale from "@fullcalendar/core/locales/sr"
import { useSnackbar } from "../context/SnackbarContext";
import ConfirmDialog from "../context/ConfirmDialog";
import { DesktopDateTimePicker } from '@mui/x-date-pickers/DesktopDateTimePicker';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../utils/useWebSocket";
import {
    getAppointments, createAppointment,
    updateAppointment, deleteAppointment, markPatientArrived
} from "../services/appointmentService";
import { getPatients } from "../services/patientService";
import authService from "../services/authService";
import WaitingRoomView from "./views/WaitingRoomView";
import { getTeamName } from "../services/userService";

const latinWeekdaysShort = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];
const VIEWS = { CALENDAR: "calendar", WAITING_ROOM: "waitingRoom" };

function NursePage() {
    const [currentView, setCurrentView] = useState(VIEWS.CALENDAR);
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
    const [openNewApptDialog, setOpenNewApptDialog] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openEmergencyDialog, setOpenEmergencyDialog] = useState(null);

    const [newAppointment, setNewAppointment] = useState({
        appointmentDate: null,
        patientId: null,
        doctorId: null,
        appointmentDetails: "",
    });
    const [updatedAppointment, setUpdatedAppointment] = useState(null);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [waitingRoomBadge, setWaitingRoomBadge] = useState(0);

    const [ teamName, setTeamName] = useState("");
    const { showSnackbar } = useSnackbar();
    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const fetchAppointments = useCallback(async () => {
        try {
            //samo da negdje dohvatim i naziv tima
            const name = await getTeamName(user.teamId);
            setTeamName(name);

            const data = await getAppointments();

            setAppointments(
                data.map((a) => {
                    const startTime = dayjs(a.appointmentDate);
                    const endTime = startTime.add(15, "minute");

                    return {
                        id: a.id,
                        title: `${a.patientFirstName} ${a.patientLastName}`,
                        start: startTime.toISOString(),
                        end: endTime.toISOString(),
                        backgroundColor: statusColor(a.appointmentStatus),
                        extendedProps: {
                            patientId: a.patientId,
                            doctorId: a.doctorId,
                            doctorFirstName: a.doctorFirstName,
                            doctorLastName: a.doctorLastName,
                            status: a.appointmentStatus,
                            details: a.appointmentDetails,
                        },
                    };
                })
            );
        } catch (error) {
            console.error("Greska pri ucitavanju termina", error);
        }
    }, [user.teamId]);

    const fetchPatients = useCallback(async () => {
        try {
            setPatients(await getPatients());
        } catch (error) {
            console.error("Greska pri dobavljanju pacijenata", error);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
        fetchPatients();
    }, [fetchAppointments, fetchPatients]);

    const handleWsMessage = useCallback((message) => {
        const { type, payload } = message;
        const name = `${payload.patientFirstName} ${payload.patientLastName}`;

        if (type === "DOCTOR_FINISHED") {
            showSnackbar(`Doktor završio pregled — ${name} čeka sestru`, "warning");
            if (currentView === VIEWS.CALENDAR) setWaitingRoomBadge((n) => n + 1);
        }
        if (type === "APPOINTMENT_COMPLETED") fetchAppointments();
    }, [currentView, fetchAppointments, showSnackbar]);

    const topic = user?.teamId ? `/topic/waiting-room/${user.teamId}` : null;
    useWebSocket(topic ? [topic] : [], handleWsMessage);

    const handleListItemClick = (_, index) => {
        switch (index) {
            case 0: setCurrentView(VIEWS.WAITING_ROOM); setWaitingRoomBadge(0); break;
            case 1: setCurrentView(VIEWS.CALENDAR); break;
            case 2: handleEmergencyClick(); break;
            case 3: handleLogOut(); break;
            default: break;
        }
    };

    const handleAddToWaitingRoom = async () => {
        if (!selectedAppointment) return;
        try {
            await markPatientArrived(selectedAppointment.id);
            showSnackbar("Pacijent dodat u čekaonicu", "success");
            setOpenDetailsDialog(false);
            setSelectedAppointment(null);
            fetchAppointments();
        } catch (err) {
            showSnackbar("Greška pri dodavanju u čekaonicu", "error");
        }
    };

    const handleDateClick = async (info) => {
        const minutes = info.date.getHours() * 60 + info.date.getMinutes();

        if (!(minutes < 10 * 60 ||
            (minutes >= 10 * 60 + 30 && minutes < 16 * 60) ||
            (minutes >= 16 * 60 + 30 && minutes < 20 * 60)
        )) {
            return;
        }

        setNewAppointment({
            appointmentDate: dayjs(info.date).format("YYYY-MM-DDTHH:mm:ss"),
            appointmentDetails: "",
            patientId: null,
            doctorId: null,
        });
        setSelectedPatient(null);
        setOpenNewApptDialog(true);
    };

    const handlePatientSelect = (_, value) => {
        setSelectedPatient(value);
        setNewAppointment((prev) => ({
            ...prev,
            patientId: value?.id ?? null,
            teamId: value?.teamId ?? null,
        }));
    };


    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setNewAppointment((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveNewAppointment = async (isEmergency = false) => {
        try {
            await createAppointment({
                ...newAppointment,
                appointmentStatus: isEmergency ? "EMERGENCY" : "SCHEDULED",
            });
            showSnackbar("Termin uspjesno kreiran", "success");
            setOpenNewApptDialog(false);
            setOpenEmergencyDialog(false);

            fetchAppointments();
        } catch (error) {
            showSnackbar("Greska pri kreiranju termina", "error");
        }
    };

    const handleAppointmentDelete = async () => {
        try {
            await deleteAppointment(selectedAppointment.id);
            showSnackbar("Termin uspjesno obrisan", "success");
            fetchAppointments();
            setOpenDeleteDialog(false);
            setOpenDetailsDialog(false);
        } catch (error) {
            showSnackbar("Greska pri brisanju termina", "error");
        }
    };

    const handleAppointmentUpdate = async () => {
        try {
            await updateAppointment(selectedAppointment.id, {
                appointmentDate: null
                    ? dayjs(selectedAppointment.appointmentDate).format("YYYY-MM-DDTHH:mm:ss")
                    : dayjs(updatedAppointment.appointmentDate).format("YYYY-MM-DDTHH:mm:ss"),
                appointmentDetails: null ? selectedAppointment.appointmentDetails : updatedAppointment.appointmentDetails,
                appointmentStatus: null ? selectedAppointment.appointmentStatus : updatedAppointment.appointmentStatus,
            });
            showSnackbar("Promjene uspjesno sacuvane", "success");
            fetchAppointments();
            setOpenUpdateDialog(false);
        } catch (error) {
            showSnackbar("Greska pri azuriranju termina", "error");
        }
    }

    const handleAppointmentClick = (info) => {
        setSelectedAppointment({
            id: info.event.id,
            appointmentDate: info.event.start,
            appointmentDetails: info.event.extendedProps.details,
            patient: info.event.extendedProps.patient,
            patientName: info.event.title,
            doctorFirstName: info.event.extendedProps.doctorFirstName,
            doctorLastName: info.event.extendedProps.doctorLastName,
            appointmentStatus: info.event.extendedProps.status,
        });
        setOpenDetailsDialog(true);
    };

    const handleEmergencyClick = () => {
        setNewAppointment({
            appointmentDate: null,
            appointmentDetails: "",
            patientId: null,
            doctorId: null,
        });
        setSelectedPatient(null);
        setOpenEmergencyDialog(true);
    }

    const handleLogOut = async () => {
        try {
            await authService.logout();
        } catch {
        }
        logout();
        navigate("/login")
    }

    const navItems = [
        { label: "Čekaonica", index: 0 },
        { label: "Termini", index: 1 },
        { label: "Dodaj nezakazan termin", index: 2 },
        { label: "Odjavi se", index: 3 },
    ];

    return (
        <Box sx={{ display: "flex" }}>
            <Drawer
                sx={{
                    width: 220,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": { width: 220, boxSizing: "border-box" }
                }}
                variant="permanent"
                anchor="left"
            >
                <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
                    <Typography variant="subtitle1" fontWeight={700}>eMedical - {teamName}</Typography>
                    <Typography variant="body2" color="text.secondary">Sestra</Typography>
                </Box>
                <List dense>
                    {navItems.map(({ label, index }) => (
                        <ListItem key={label} disablePadding>
                            <ListItemButton
                                selected={
                                    (index === 0 && currentView === VIEWS.WAITING_ROOM) ||
                                    (index === 1 && currentView === VIEWS.CALENDAR)
                                }
                                onClick={(e) => handleListItemClick(e, index)}
                                sx={index === 3 ? { color: "error.main" } : {}}
                            >
                                {index === 0 ? (
                                    <Badge badgeContent={waitingRoomBadge} color="error">
                                        <ListItemText primary={label} />
                                    </Badge>
                                ) : (
                                    <ListItemText primary={label} />
                                )}
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
                {currentView === VIEWS.WAITING_ROOM ? (
                    <WaitingRoomView />
                ) : (
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        locales={srLocale}
                        locale="sr"
                        editable
                        selectable
                        events={appointments}
                        dateClick={handleDateClick}
                        eventClick={handleAppointmentClick}
                        height="90vh"
                        headerToolbar={{
                            left: '',
                            center: 'title',
                            right: 'prev,next today timeGridWeek,timeGridDay'
                        }}

                        dayHeaderFormat={{ weekday: 'short', day: 'numeric', month: 'numeric', omitCommas: true }}
                        //sugavu lokalizaciju nisu dobro implementirali...
                        //prevod skracenih naziva dana
                        dayHeaderContent={(args) => {
                            const wd = args.date.getDay();
                            return `${latinWeekdaysShort[(wd + 6) % 7]} ${args.date.getDate()}.`;
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
                                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                                startTime: "07:00",
                                endTime: "10:00",
                            },
                            {
                                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                                startTime: "10:30",
                                endTime: "16:00",
                            },
                            {
                                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                                startTime: "16:30",
                                endTime: "20:00",
                            }
                        ]}
                        allDaySlot={false}
                        nowIndicator={true}
                    />
                )}
            </Box>

            <Dialog
                open={!!selectedAppointment && openDetailsDialog}
                onClose={() => { setSelectedAppointment(null); setOpenDetailsDialog(false); }}
            >
                <DialogTitle>Detalji termina</DialogTitle>
                <DialogContent dividers>
                    {selectedAppointment && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {[
                                { label: "Vrijeme:", value: dayjs(selectedAppointment.appointmentDate).format("HH:mm") },
                                { label: "Pacijent:", value: selectedAppointment.patientName },
                                { label: "Doktor:", value: `${selectedAppointment.doctorFirstName} ${selectedAppointment.doctorLastName}` },
                                { label: "Detalji:", value: selectedAppointment.appointmentDetails },
                                { label: "Status:", value: selectedAppointment.appointmentStatus },
                            ].map(({ label, value }) => (
                                <Typography key={label}>
                                    <strong>{label}</strong> {value}
                                </Typography>
                            ))}
                        </Box>
                    )}

                    <DialogActions sx={{ pt: 2, flexWrap: "wrap", gap: 1 }}>
                        <Button variant="contained" color="primary" onClick={handleAddToWaitingRoom}>
                            Dodaj u čekaonicu
                        </Button>
                        <Button variant="contained" onClick={() => {
                            setUpdatedAppointment(selectedAppointment);
                            setOpenDetailsDialog(false);
                            setOpenUpdateDialog(true);
                        }}                        >
                            Azuriraj
                        </Button>
                        <Button variant="contained" onClick={() => {
                            setUpdatedAppointment(selectedAppointment);
                            updatedAppointment.appointmentStatus = "CANCELED";
                            handleAppointmentUpdate();
                            setOpenDetailsDialog(false);
                        }
                        }>
                            Otkazi
                        </Button>
                        <Button variant="contained" onClick={() => { setOpenDeleteDialog(true) }}>
                            Obrisi
                        </Button>
                        <ConfirmDialog
                            open={openDeleteDialog}
                            title={"Obrisati termin?"}
                            content={"Da li ste sigurno da zelite obrisati termin?"}
                            onConfirm={() => handleAppointmentDelete(selectedAppointment)}
                            onCancel={() => setOpenDeleteDialog(false)}
                        />
                        <Button variant="outlined" onClick={() => { setSelectedAppointment(null); setOpenDetailsDialog(false) }}>
                            Zatvori
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>

            <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)}>
                <DialogTitle>Azuriraj termin</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                            multiline
                            value={updatedAppointment?.appointmentDetails ?? ""}
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

            <AppointmentFormDialog
                open={openNewApptDialog} title="Kreiraj novi termin"
                appointment={newAppointment}
                patients={patients}
                selectedPatient={selectedPatient}
                onPatientSelect={handlePatientSelect}
                onFieldChange={handleFieldChange}
                onSave={() => handleSaveNewAppointment(false)}
                onClose={() => setOpenNewApptDialog(false)}
            />

            <AppointmentFormDialog
                open={openEmergencyDialog} title="Dodaj nezakazan termin"
                appointment={newAppointment}
                patients={patients}
                selectedPatient={selectedPatient}
                onPatientSelect={handlePatientSelect}
                onFieldChange={handleFieldChange}
                onSave={() => handleSaveNewAppointment(true)}
                onClose={() => setOpenEmergencyDialog(false)}
            />
        </Box>
    );
}

function AppointmentFormDialog({ open, title, appointment, patients, selectedPatient,
    onPatientSelect, onFieldChange, onSave, onClose }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 320 }}>
                    <TextField
                        label="Datum i vrijeme termina"
                        value={appointment.appointmentDate
                            ? dayjs(appointment.appointmentDate).format("DD.MM.YYYY. HH:mm")
                            : dayjs(new Date()).format("DD.MM.YYYY. HH:mm")}
                        disabled
                    />

                    <Autocomplete
                        options={patients} value={selectedPatient} onChange={onPatientSelect}
                        getOptionLabel={(o) => `${o.firstName} ${o.lastName}`}
                        renderInput={(params) => (
                            <TextField {...params} label="Pacijent" placeholder="Pretraži po imenu..." />
                        )}
                        noOptionsText="Nema pacijenta" clearOnEscape
                    />
                    <TextField
                        label="Detalji termina" name="appointmentDetails" multiline
                        value={appointment.appointmentDetails} onChange={onFieldChange}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onSave} variant="contained">Sačuvaj</Button>
                <Button onClick={onClose} variant="outlined">Otkaži</Button>
            </DialogActions>
        </Dialog>
    );
}


function statusColor(status) {
    switch (status) {
        case "COMPLETED": return "#4caf50";
        case "CANCELED": return "#f44336";
        case "WAITING": return "#ff9800";
        case "EMERGENCY": return "#d32f2f";
        default: return "#1976d2";
    }
}

export default NursePage;