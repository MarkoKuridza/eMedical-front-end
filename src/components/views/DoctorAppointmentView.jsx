import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useTheme } from "@emotion/react";
import { Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TablePagination, TableRow, Typography } from "@mui/material";
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
dayjs.locale("bs");

function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    // ovo je za footer
    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}

function DoctorAppointmentView() {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const doctorId = decoded.doctorId;

        const API_URL = `http://localhost:9000/api/doctors/${doctorId}/appointments`;

        axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setAppointments(response.data);
            })
            .catch(error => {
                console.error("Greska pri dobavljanju termina", error);
            });
    }, []);

    useEffect(() => {
        const filtered = appointments
            .filter((a) => filterStatus === "ALL" || a.appointmentStatus === filterStatus)
            .filter((a) => dayjs(a.appointmentDate).isSame(selectedDate, "day"))
            .sort((a, b) => dayjs(a.appointmentDate) - dayjs(b.appointmentDate));

        setFilteredAppointments(filtered);
    }, [appointments, selectedDate, filterStatus]);


    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - appointments.length) : 0;

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getRowStyle = (status) => {
        switch (status) {
            case "COMPLETED":
                return { backgroundColor: "#d0f0c0", cursor: "pointer" };
            case "CANCELED":
                return { backgroundColor: "#f8d7da", cursor: "not-allowed" };
            default:
                return { cursor: "pointer" };
        }
    };

    const handlePatientProcessed = (appointmentId) => {
        setAppointments((prev) =>
            prev.map((a) =>
                a.id === appointmentId ? { ...a, appointmentStatus: "COMPLETED" } : a
            )
        );
    };

    const handleRowClick = (appointment) => {
        if (appointment.appointmentStatus !== "CANCELED") {
            setSelectedAppointment(appointment);
        }
    }

    if (selectedAppointment) {
        console.log(selectedAppointment);

        return (
            <ProcessPatientForm
                appointment={selectedAppointment}
                onBack={() => setSelectedAppointment(null)}
                onProcessed={handlePatientProcessed}
            />
        );
    }

    return (
        <Box>
            <Box mb={2} display="flex" alignItems="center">
                <Button onClick={() => setFilterStatus("ALL")}>Svi</Button>
                <Button onClick={() => setFilterStatus("SCHEDULED")}>Zakazani</Button>
                <Button onClick={() => setFilterStatus("COMPLETED")}>Završeni</Button>
                <Button sx={{ mr: 2 }} onClick={() => setFilterStatus("CANCELED")}>Otkazani</Button>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Obaderi datum"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        format="DD.MM.YYYY."
                        sx={{ marginLeft: "auto" }}
                    />
                </LocalizationProvider>
            </Box>

            <Box mb={2}>
                <Typography variant="h5" gutterBottom>
                    Termini
                </Typography>
            </Box>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: '100%' }} aria-label="Zakazani termini">
                    <TableBody>
                        {(rowsPerPage > 0
                            ? filteredAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            : filteredAppointments
                        ).map((appointment) => (
                            <TableRow
                                key={appointment.id}
                                sx={getRowStyle(appointment.appointmentStatus)}
                                onClick={() => handleRowClick(appointment)}
                            >
                                <TableCell style={{ width: 100 }} align="left">
                                    {dayjs(appointment.appointmentDate).format("D. MMMM YYYY. HH:mm")}
                                </TableCell>
                                <TableCell style={{ width: 250 }} align="left">
                                    {appointment.appointmentDetails}
                                </TableCell>
                                <TableCell style={{ width: 160 }} align="left">
                                    {appointment.patient.first_name} {appointment.patient.last_name}
                                </TableCell>
                                <TableCell style={{ width: 100 }} align="left">
                                    {appointment.appointmentStatus}
                                </TableCell>
                            </TableRow>
                        ))}

                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={6} />
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                colSpan={3}
                                count={filteredAppointments.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                slotProps={{
                                    select: {
                                        inputProps: {
                                            'aria-label': 'rows per page',
                                        },
                                        native: true,
                                    },
                                }}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActions}
                                sx={{ ml: "auto" }}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>

    );
}

export default DoctorAppointmentView;