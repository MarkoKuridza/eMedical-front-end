import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Badge, Card, CardContent, Chip, Divider, Drawer, Grid, Typography } from '@mui/material';
import DoctorsPatientsView from './views/DoctorsPatientsView';
import DoctorAppointmentView from './views/DoctorAppointmentView';
import { useWebSocket } from "../utils/useWebSocket";
import { useSnackbar } from "../context/SnackbarContext";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import { getAppointmentsByDoctorId } from "../services/appointmentService";
import { getPatients } from "../services/patientService";
import { useEffect } from "react";
import dayjs from "dayjs";
import { getTeamName } from "../services/userService";

const VIEWS = { HOME: 0, PATIENTS: 1, APPOINTMENTS: 2 };
const navItems = [
  { label: "Početna", view: VIEWS.HOME },
  { label: "Pacijenti", view: VIEWS.PATIENTS },
  { label: "Termini", view: VIEWS.APPOINTMENTS },
  { label: "Odjavi se", view: null },
];

function DoctorSummary({ user, appointments, patients }) {
  const today = dayjs();

  const todayAppts = appointments.filter(a =>
    dayjs(a.appointmentDate).isSame(today, "day")
  );
  const scheduled = todayAppts.filter(a => a.appointmentStatus === "SCHEDULED").length;
  const waiting = todayAppts.filter(a => a.appointmentStatus === "WAITING").length;
  const inProgress = todayAppts.filter(a => a.appointmentStatus === "IN_PROGRESS").length;
  const completed = todayAppts.filter(a => a.appointmentStatus === "COMPLETED").length;

  const nextAppt = [...appointments]
    .filter(a => dayjs(a.appointmentDate).isAfter(today) && a.appointmentStatus === "SCHEDULED")
    .sort((a, b) => dayjs(a.appointmentDate) - dayjs(b.appointmentDate))[0];

  const cards = [
    { label: "Ukupno pacijenata", value: patients.length, color: "#1976d2" },
    { label: "Termini danas", value: todayAppts.length, color: "#7b1fa2" },
    { label: "Završeni danas", value: completed, color: "#388e3c" },
    { label: "Zakazani danas", value: scheduled, color: "#f57c00" },
  ];

  return (
    <Box>
      <Box>
        <Typography color="text.secondary" mb={3}>
          {today.format("dddd, D. MMMM YYYY.")}
        </Typography>

        <Grid container spacing={3} mb={4}>
          {cards.map(c => (
            <Grid sm={6} md={3} key={c.label}>
              <Card sx={{ borderTop: `4px solid ${c.color}` }}>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">{c.label}</Typography>
                  <Typography variant="h3" sx={{ color: c.color, fontWeight: 700 }}>
                    {c.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Aktivni termini */}
          <Grid md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>Aktivni termini danas</Typography>
                {waiting === 0 && inProgress === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    Nema aktivnih termina.
                  </Typography>
                ) : (
                  <Box display="flex" flexDirection="column" gap={1}>
                    {todayAppts
                      .filter(a => ["WAITING", "IN_PROGRESS"].includes(a.appointmentStatus))
                      .sort((a, b) => dayjs(a.appointmentDate) - dayjs(b.appointmentDate))
                      .map(a => (
                        <Box key={a.id} display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" sx={{ minWidth: 45 }}>
                            {dayjs(a.appointmentDate).format("HH:mm")}
                          </Typography>
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>
                            {a.patientFirstName} {a.patientLastName}
                          </Typography>
                          <Chip
                            size="small"
                            label={a.appointmentStatus === "WAITING" ? "Čeka" : "U toku"}
                            color={a.appointmentStatus === "WAITING" ? "warning" : "info"}
                          />
                        </Box>
                      ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sljedeci termin */}
          <Grid>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>Sljedeći zakazani termin</Typography>
                {nextAppt ? (
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Typography variant="h6" color="primary">
                      {dayjs(nextAppt.appointmentDate).format("D. MMM, HH:mm")}
                    </Typography>
                    <Typography>
                      <strong>Pacijent:</strong> {nextAppt.patientFirstName} {nextAppt.patientLastName}
                    </Typography>
                    {nextAppt.appointmentDetails && (
                      <Typography color="text.secondary" variant="body2">
                        {nextAppt.appointmentDetails}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography color="text.secondary" variant="body2">
                    Nema nadolazećih termina.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Raspored za danas */}
          <Grid>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>Raspored za danas</Typography>
                {todayAppts.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    Nema termina za danas.
                  </Typography>
                ) : (
                  <Box display="flex" flexDirection="column" gap={1}>
                    {[...todayAppts]
                      .sort((a, b) => dayjs(a.appointmentDate) - dayjs(b.appointmentDate))
                      .map((a, i) => {
                        const statusMap = {
                          SCHEDULED: { label: "Zakazan", color: "default" },
                          WAITING: { label: "Čeka", color: "warning" },
                          IN_PROGRESS: { label: "U toku", color: "info" },
                          PENDING_NURSE_COMPLETION: { label: "Čeka sestru", color: "secondary" },
                          COMPLETED: { label: "Završen", color: "success" },
                          CANCELED: { label: "Otkazan", color: "error" },
                        };
                        const conf = statusMap[a.appointmentStatus] ?? { label: a.appointmentStatus, color: "default" };
                        return (
                          <Box key={a.id}>
                            {i > 0 && <Divider sx={{ my: 0.5 }} />}
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" sx={{ minWidth: 45, color: "text.secondary" }}>
                                {dayjs(a.appointmentDate).format("HH:mm")}
                              </Typography>
                              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                {a.patientFirstName} {a.patientLastName}
                              </Typography>
                              <Chip size="small" label={conf.label} color={conf.color} />
                            </Box>
                          </Box>
                        );
                      })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

function DoctorPage() {
  const [currentView, setCurrentView] = useState(VIEWS.HOME);
  const [appointments, setAppointments] = useState([]);
  const [patientBadge, setPatientBadge] = useState(0);
  const [patients, setPatients] = useState([]);

  const [teamName, setTeamName] = useState("");

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { user, logout } = useAuth();

  const fetchSummaryData = useCallback(async () => {
    if (!user?.id) return;
    try {
      //samo da negdje dohvatim naziv tima
      const name = await getTeamName(user.teamId);
      setTeamName(name);
      
      const [appts, pts] = await Promise.all([
        getAppointmentsByDoctorId(user.id),
        getPatients(),
      ]);
      setAppointments(appts);
      setPatients(pts);
    } catch (err) {
      console.error("Error while fetching data", err);
    }
  }, [user?.id, user?.teamId]);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  const handleWsMessage = useCallback((message) => {
    if (message.type !== "PATIENT_ARRIVED") return;
    const { payload } = message;
    showSnackbar(
      `Pacijent ${payload.patientFirstName} ${payload.patientLastName} je stigao (red. br. ${payload.queueNumber})`,
      "info"
    );
    if (currentView !== VIEWS.APPOINTMENTS) {
      setPatientBadge((n) => n + 1);
    }
  }, [currentView, showSnackbar]);

  const topic = user?.id ? `/topic/doctor/${user.id}` : null;
  useWebSocket(topic ? [topic] : [], handleWsMessage);

  const handleNav = (view) => {
    if (view === null) { handleLogOut(); return; }
    setCurrentView(view);
    if (view === VIEWS.APPOINTMENTS) setPatientBadge(0);
  };

  const handleLogOut = async () => {
    try {
      await authService.logout();
    } catch { }
    logout();
    navigate("/login");
  };

  const renderContent = () => {
    switch (currentView) {
      case VIEWS.PATIENTS:
        return <DoctorsPatientsView />;
      case VIEWS.APPOINTMENTS:
        return <DoctorAppointmentView />;
      default:
        return <DoctorSummary user={user} appointments={appointments} patients={patients} />;
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 220,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 220, boxSizing: "border-box" },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="subtitle1" fontWeight={700}>eMedical - {teamName}</Typography>
          <Typography variant="body2" color="text.secondary">Doktor</Typography>
        </Box>
        <List dense>
          {navItems.map(({ label, view }) => (
            <ListItem key={label} disablePadding>
              <ListItemButton
                selected={currentView === view}
                onClick={() => handleNav(view)}
                sx={view === null ? { color: "error.main" } : {}}
              >
                {view === VIEWS.APPOINTMENTS ? (
                  <Badge badgeContent={patientBadge} color="error">
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
        {renderContent()}
      </Box>
    </Box>
  );
}

export default DoctorPage;