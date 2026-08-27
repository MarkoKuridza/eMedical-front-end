import { useCallback, useEffect, useState } from 'react';
import { useTheme } from "@emotion/react";
import { Typography , Box, TextField, Paper, IconButton, Table, TableBody, TableCell, TableContainer, TableFooter, TablePagination, TableRow } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import DoctorsPatientsDetailsView from "./DoctorPatientsDetailsView";
import { getPatients } from "../../services/patientService";

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

function DoctorsPatientsView() {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchPatients = useCallback(async () => {
    try {
      const response = await getPatients();
      setPatients(response);
    } catch (err) {
      console.error("Error while fetching patients", err);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter((p) =>
    `${p.jmb} ${p.pioNumber} ${p.firstName} ${p.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (selectedPatient) {
    return (
      <DoctorsPatientsDetailsView
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
      />
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Lista pacijenata
      </Typography>

      <Box mb={2}>
        <TextField
          variant="outlined"
          size="small"
          label="Pretraga pacijenta"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: "100%" }}>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredPatients.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
              : filteredPatients
            ).map((patient) => (
              <TableRow
                key={patient.id}
                hover
                sx={{
                  cursor: "pointer",
                }}
                onClick={() => setSelectedPatient(patient)}
              >
                <TableCell style={{ width: 250 }}>
                  {patient.firstName} {patient.lastName}
                </TableCell>

                <TableCell style={{ width: 180 }}>
                  JMB: {patient.jmb}
                </TableCell>

                <TableCell style={{ width: 180 }}>
                  PIO: {patient.pioNumber}
                </TableCell>
              </TableRow>
            ))}

            {filteredPatients.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 1 }}
                  >
                    Nema pretraženog pacijenta
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[
                  5,
                  10,
                  25,
                  { label: "Svi", value: -1 },
                ]}
                colSpan={3}
                count={filteredPatients.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

    </Box>
  );
}

export default DoctorsPatientsView;