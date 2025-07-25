import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useTheme } from "@emotion/react";
import { Box, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TablePagination, TableRow } from "@mui/material";
import PropTypes from "prop-types";
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

function TablePaginationActions(props){
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

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
};

export default function DoctorAppointmentPage() {
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState('');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    

    useEffect(() => {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const doctorId = decoded.doctorId;

        const API_URL = `http://localhost:9000/api/doctors/${doctorId}/appointments`;

        axios.get(API_URL, {
            headers : {
                Authorization : `Bearer ${token}`}
        })
        .then(response => {
            setAppointments(response.data);
        })
        .catch(error => {
            console.error("Greska pri dobavljanju termina", error);
        });
    }, []);

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - appointments.length) : 0; 

    const handleSelected = (appointment) => {
        setSelectedAppointment(appointment);
    };
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 500}} aria-label="Zakazani termini">
                <TableBody>
                    {(rowsPerPage > 0
                    ? appointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : appointments
            ).map((appointment) => (
                <TableRow key={appointment.id}>
                    <TableCell component="th" scope="appointment">
                        {appointment.id}
                    </TableCell>
                    <TableCell style={{ width: 160 }} align="right">
                        {appointment.appointmentDate}
                    </TableCell>
                    <TableCell style={{ width: 160 }} align="right">
                        {appointment.appointmentDetails}
                    </TableCell>
                    <TableCell style={{ width: 160 }} align="right">
                        {appointment.appointmentStatus}
                    </TableCell>
                    <TableCell style={{ width: 160 }} align="right">
                        {appointment.patient.first_name}
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
                            count={appointments.length}
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
                            />
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    );
}