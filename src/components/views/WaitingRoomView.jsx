import { useCallback, useEffect, useState } from "react";
import { useSnackbar } from "../../context/SnackbarContext";
import { useAuth } from "../../context/AuthContext";
import { getWaitingRoom } from "../../services/waitingRoomService";
import { useWebSocket } from "../../utils/useWebSocket";
import { completeAppointment } from "../../services/appointmentService";

import { Box, Button, Chip, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

const STATUS_CONFIG = {
    WAITING_FOR_DOCTOR: { label: "Čeka doktora", color: "warning" },
    READY_FOR_NURSE: { label: "Spreman za sestru", color: "success" },
    COMPLETED: { label: "Završen", color: "default" },
};

function WaitingRoomView() {
    const [entries, setEntries] = useState([]);

    const [loading, setLoading] = useState(true);

    const { showSnackbar } = useSnackbar();
    const { user } = useAuth();

    const fetchWaitingRoom = useCallback(async () => {
        try {
            const data = await getWaitingRoom();
            setEntries(data.filter((e) => e.status !== "COMPLETED"));
        } catch (err) {
            console.error("Error while loading waiting room", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWaitingRoom();
    }, [fetchWaitingRoom]);

    const handleWsMessage = useCallback((message) => {
        const { type, payload } = message;
        const ime = `${payload.patientFirstName} ${payload.patientLastName}`;

        switch (type) {
            case "PATIENT_ARRIVED":
                showSnackbar(`Pacijent ${ime} stigao (red. br. ${payload.queueNumber})`, "info");
                break;
            case "DOCTOR_FINISHED":
                showSnackbar(`Doktor završio pregled — ${ime} čeka sestru`, "success");
                break;
            case "APPOINTMENT_COMPLETED":
                showSnackbar(`Pregled pacijenta ${ime} je kompletiran`, "success");
                break;
            default:
                break;
        }
        fetchWaitingRoom();
    }, [fetchWaitingRoom, showSnackbar]);

    const topic = user?.teamId ? `/topic/waiting-room/${user.teamId}` : null;
    const { connected } = useWebSocket(topic ? [topic] : [], handleWsMessage);

    const handleComplete = async (appointmentId) => {
        try {
            await completeAppointment(appointmentId);
            showSnackbar("Pregled uspješno završen", "success");
            fetchWaitingRoom();
        } catch (err) {
            showSnackbar("Greska prilikom zavrsavanja pregleda", "error");
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Typography variant="h5">Čekaonica</Typography>
                <Chip
                    size="small"
                    label={connected ? "Live" : "No connection"}
                    color={connected ? "success" : "error"}
                    variant="outlined"
                />
            </Box>

            {entries.length === 0 ? (
                <Paper sx={{ p: 3 }}>
                    <Typography>
                        Čekaonica je trenutno prazna.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Red. br.</strong></TableCell>
                                <TableCell><strong>Pacijent.</strong></TableCell>
                                <TableCell><strong>Doktor</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Akcija</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...entries]
                                .sort((a, b) => a.queueNumber - b.queueNumber)
                                .map((entry) => {
                                    const conf = STATUS_CONFIG[entry.status] ?? { label: entry.status, color: "default" }

                                    return (
                                        <TableRow key={entry.id}>
                                            <TableCell>{entry.queueNumber}</TableCell>
                                            <TableCell>{entry.patientFirstName} {entry.patientLastName}</TableCell>
                                            <TableCell>{entry.doctorFirstName} {entry.doctorLastName}</TableCell>
                                            <TableCell>
                                                <Chip label={conf.label} color={conf.color} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                {entry.status === "READY_FOR_NURSE" && (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleComplete(entry.appointmentId)}
                                                    >
                                                        Završi pregled
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

export default WaitingRoomView;