import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import { Box, Button, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TablePagination, TableRow, Typography } from "@mui/material";
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import "dayjs/locale/bs";
import ProcessPatientForm from "../ProcessPatientForm";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../../context/SnackbarContext";
import { getAppointmentsByDoctorId, startAppointment } from "../../services/appointmentService";
dayjs.locale("bs");

function TablePaginationActions({ count, page, rowsPerPage, onPageChange }) {
    const theme = useTheme();

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton onClick={(e) => onPageChange(e, 0)} disabled={page === 0}>
                {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton onClick={(e) => onPageChange(e, page - 1)} disabled={page === 0}>
                {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={(e) => onPageChange(e, page + 1)}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            >
                {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={(e) => onPageChange(e, Math.max(0, Math.ceil(count / rowsPerPage) - 1))}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
            >
                {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}

const STATUS_CONFIG = {
    SCHEDULED: { label: "Zakazan", color: "default" },
    WAITING: { label: "Čeka", color: "warning" },
    IN_PROGRESS: { label: "U toku", color: "info" },
    PENDING_NURSE_COMPLETION: { label: "Čeka sestru", color: "secondary" },
    COMPLETED: { label: "Završen", color: "success" },
    CANCELED: { label: "Otkazan", color: "error" },
    EMERGENCY: { label: "Hitno", color: "error" },
};

const FILTER_LABELS = {
    ALL: "Svi", SCHEDULED: "Zakazani", WAITING: "Čekaju",
    COMPLETED: "Završeni", CANCELED: "Otkazani",
};

function DoctorAppointmentView() {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [processFormOpen, setProcessFormOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { user } = useAuth();
    const { showSnackbar } = useSnackbar();

    const fetchAppointments = useCallback(async () => {
        if (!user?.id) return;
        try {
            const data = await getAppointmentsByDoctorId(user.id)
            setAppointments(data);
        } catch (err) {
            console.error("Error while fetching appointments", err);
        }
    }, [user?.id]);

    const filterAppointments = useCallback(() => {
        const filtered = appointments
            .filter((a) => filterStatus === "ALL" || a.appointmentStatus === filterStatus)
            .filter((a) => dayjs(a.appointmentDate).isSame(selectedDate, "day"))
            .sort((a, b) => dayjs(a.appointmentDate) - dayjs(b.appointmentDate));

        setFilteredAppointments(filtered);
        setPage(0);
    }, [appointments, selectedDate, filterStatus]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    useEffect(() => {
        filterAppointments();
    }, [filterAppointments])

    const handleRowClick = async (appt) => {
        const clickable = ["WAITING", "IN_PROGRESS"];
        if (!clickable.includes(appt.appointmentStatus)) return;

        try {
            let currentAppointment = appt;

            if (appt.appointmentStatus === "WAITING") {
                currentAppointment = await startAppointment(appt.id);

                setAppointments((prev) =>
                    prev.map((a) =>
                        a.id === currentAppointment.id
                            ? currentAppointment
                            : a
                    )
                );

                showSnackbar("Pregled pokrenut", "success");
            }

            setSelectedAppointment(currentAppointment);
            setProcessFormOpen(true);

        } catch (err) {
            console.error("Error while starting appointment", err);
            showSnackbar("Greška prilikom pokretanja pregleda", "error");
        }
    };

    const handlePatientProcessed = (appointmentId) => {
        setAppointments((prev) =>
            prev.map((a) =>
                a.id === appointmentId ? { ...a, appointmentStatus: "PENDING_NURSE_COMPLETION" } : a
            )
        );
        setProcessFormOpen(false);
        setSelectedAppointment(null);
    };

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredAppointments.length) : 0;

    if (processFormOpen && selectedAppointment) {
        return (
            <ProcessPatientForm
                appointment={selectedAppointment}
                onBack={() => { setProcessFormOpen(false); setSelectedAppointment(null) }}
                onProcessed={handlePatientProcessed}
            />
        );
    }

    return (
        <Box>
            <Box mb={2} display="flex" alignItems="center" gap={1} flexWrap="wrap">
                {Object.keys(FILTER_LABELS).map((s) => (
                    <Button
                        key={s}
                        size="small"
                        variant={filterStatus === s ? "contained" : "outlined"}
                        onClick={() => setFilterStatus(s)}
                    >
                        {FILTER_LABELS[s]}
                    </Button>
                ))}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Odaberi datum"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        format="DD.MM.YYYY."
                        sx={{ ml: "auto" }}
                    />
                </LocalizationProvider>
            </Box>

            <Typography variant="h5" mb={2}>
                Termini
            </Typography>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: '100%' }}>
                    <TableBody>
                        {(rowsPerPage > 0
                            ? filteredAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : filteredAppointments
                        ).map((appointment) => {
                            const conf =
                                STATUS_CONFIG[appointment.appointmentStatus] ??
                                {
                                    label: appointment.appointmentStatus,
                                    color: "default"
                                };

                            const clickable =
                                ["WAITING", "IN_PROGRESS"]
                                    .includes(appointment.appointmentStatus);

                            return (
                                <TableRow
                                    key={appointment.id}
                                    sx={{
                                        cursor: clickable ? "pointer" : "default",
                                        "&:hover": clickable
                                            ? { backgroundColor: "#f5f5f5" }
                                            : {}
                                    }}
                                    onClick={() => handleRowClick(appointment)}
                                >
                                    <TableCell style={{ width: 180 }}>
                                        {dayjs(appointment.appointmentDate)
                                            .format("D. MMMM YYYY. HH:mm")}
                                    </TableCell>

                                    <TableCell style={{ width: 250 }}>
                                        {appointment.appointmentDetails}
                                    </TableCell>

                                    <TableCell style={{ width: 180 }}>
                                        {appointment.patientFirstName}
                                        {" "}
                                        {appointment.patientLastName}
                                    </TableCell>

                                    <TableCell style={{ width: 140 }}>
                                        <Chip
                                            label={conf.label}
                                            color={conf.color}
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={4} />
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, { label: 'Svi', value: -1 }]}
                                colSpan={4}
                                count={filteredAppointments.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={(_, newPage) => setPage(newPage)}
                                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                                ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

        </Box >

    );
}



export default DoctorAppointmentView;