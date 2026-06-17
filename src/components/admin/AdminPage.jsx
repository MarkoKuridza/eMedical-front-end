import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemText,
    Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Select, InputLabel, FormControl,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Tooltip, Chip, Card, CardContent, Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../../context/SnackbarContext";
import authService from "../../services/authService";
import ConfirmDialog from "../../context/ConfirmDialog";
import {
    getDoctors, getNurses, getPatients, getTeams, getAdminSummary,
    registerDoctor, registerNurse, registerPatient, createTeam,
    updateDoctor, updateNurse, updatePatient, updateTeam,
    deleteDoctor, deleteNurse, deletePatient, deleteTeam,
} from "../../services/adminService";

const VIEWS = { SUMMARY: "summary", DOCTORS: "doctors", NURSES: "nurses", PATIENTS: "patients", TEAMS: "teams" };
const navItems = [
    { label: "Pregled", view: VIEWS.SUMMARY },
    { label: "Doktori", view: VIEWS.DOCTORS },
    { label: "Sestre", view: VIEWS.NURSES },
    { label: "Pacijenti", view: VIEWS.PATIENTS },
    { label: "Timovi", view: VIEWS.TEAMS },
    { label: "Odjavi se", view: null },
];

const emptyDoctor = { username: "", password: "", firstName: "", lastName: "", specialization: "", teamId: "" };
const emptyNurse = { username: "", password: "", firstName: "", lastName: "", teamId: "" };
const emptyPatient = { firstName: "", lastName: "", teamId: "" };
const emptyTeam = { teamName: "" };

function Field({ label, name, value, onChange, type = "text", required = false }) {
    return (
        <TextField
            label={label} name={name} value={value ?? ""}
            onChange={onChange} type={type} required={required}
            fullWidth size="small"
        />
    );
}

function TeamSelect({ value, onChange, teams, name = "teamId", label = "Tim" }) {
    return (
        <FormControl fullWidth size="small">
            <InputLabel>{label}</InputLabel>
            <Select name={name} value={value ?? ""} label={label} onChange={onChange}>
                <MenuItem value=""><em>— bez tima —</em></MenuItem>
                {teams.map(t => (
                    <MenuItem key={t.teamId} value={t.teamId}>
                        {t.teamName}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

//Summary
function SummaryView({ summary, doctors, nurses, patients, teams }) {
    const cards = [
        { label: "Doktori", value: summary?.doctors ?? doctors.length, color: "#1976d2" },
        { label: "Sestre", value: summary?.nurses ?? nurses.length, color: "#388e3c" },
        { label: "Pacijenti", value: summary?.patients ?? patients.length, color: "#f57c00" },
        { label: "Timovi", value: summary?.teams ?? teams.length, color: "#7b1fa2" },
    ];
    return (
        <Box>
            <Typography variant="h5" mb={3}>Pregled sistema</Typography>
            <Grid container spacing={3}>
                {cards.map(c => (
                    <Grid key={c.label}>
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

            <Typography variant="h6" mt={4} mb={1}>Timovi i sastav</Typography>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Tim</TableCell>
                            <TableCell>Doktor</TableCell>
                            <TableCell>Pacijenti</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teams.map(t => {
                            const doc = doctors.find(d => d.id === t.doctorId);
                            const pts = patients.filter(p => p.teamId === t.teamId);
                            return (
                                <TableRow key={t.teamId}>
                                    <TableCell>{t.teamName}</TableCell>
                                    <TableCell>
                                        {doc ? `${doc.firstName} ${doc.lastName}` : <em>Nije dodijeljen</em>}
                                    </TableCell>
                                    <TableCell>
                                        {pts.length === 0
                                            ? <em>Nema pacijenata</em>
                                            : pts.map(p => (
                                                <Chip key={p.id} label={`${p.firstName} ${p.lastName}`}
                                                    size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                                            ))}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

//CRUD
function CrudTable({ title, columns, rows, onAdd, onEdit, onDelete }) {
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">{title}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>Dodaj</Button>
            </Box>
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map(c => <TableCell key={c.key}>{c.label}</TableCell>)}
                            <TableCell align="right">Akcije</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} align="center">
                                    <em>Nema podataka</em>
                                </TableCell>
                            </TableRow>
                        )}
                        {rows.map((row, i) => (
                            <TableRow key={row.id ?? row.teamId ?? i} hover>
                                {columns.map(c => (
                                    <TableCell key={c.key}>{c.render ? c.render(row) : row[c.key]}</TableCell>
                                ))}
                                <TableCell align="right">
                                    <Tooltip title="Uredi">
                                        <IconButton size="small" onClick={() => onEdit(row)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Obriši">
                                        <IconButton size="small" color="error" onClick={() => onDelete(row)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

function AdminPage() {
    const [currentView, setCurrentView] = useState(VIEWS.SUMMARY);
    const [doctors, setDoctors] = useState([]);
    const [nurses, setNurses] = useState([]);
    const [patients, setPatients] = useState([]);
    const [teams, setTeams] = useState([]);
    const [summary, setSummary] = useState(null);

    const [dialog, setDialog] = useState({ open: false, type: null, mode: "create", data: null });
    const [formData, setFormData] = useState({});
    const [confirmDelete, setConfirmDelete] = useState({ open: false, type: null, item: null });

    const { logout } = useAuth();
    const { showSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            const [d, n, p, t, s] = await Promise.all([
                getDoctors(), getNurses(), getPatients(), getTeams(), getAdminSummary()
            ]);
            setDoctors(d);
            setNurses(n);
            setPatients(p);
            setTeams(t);
            setSummary(s);
        } catch (err) {
            console.error("Greška pri učitavanju", err);
            showSnackbar("Greška pri učitavanju podataka", "error");
        }
    }, [showSnackbar]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleLogout = async () => {
        try { await authService.logout(); } catch { }
        logout();
        navigate("/login");
    };

    const handleNav = (view) => {
        if (view === null) { handleLogout(); return; }
        setCurrentView(view);
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openDialog = (type, mode, data = null) => {
        const defaults = { doctors: emptyDoctor, nurses: emptyNurse, patients: emptyPatient, teams: emptyTeam };
        setFormData(data ? { ...data } : { ...defaults[type] });
        setDialog({ open: true, type, mode, data });
    };

    const closeDialog = () => setDialog({ open: false, type: null, mode: "create", data: null });

    const handleSave = async () => {
        const { type, mode, data } = dialog;
        try {
            if (type === "doctors") {
                const payload = {
                    ...formData,
                    teamId: formData.teamId || null,
                };
                if (mode === "create") await registerDoctor(payload);
                else await updateDoctor(data.id, payload);
            } else if (type === "nurses") {
                const payload = { ...formData, teamId: formData.teamId || null };
                if (mode === "create") await registerNurse(payload);
                else await updateNurse(data.id, payload);
            } else if (type === "patients") {
                const payload = { ...formData, teamId: formData.teamId || null };
                if (mode === "create") await registerPatient(payload);
                else await updatePatient(data.id, payload);
            } else if (type === "teams") {
                if (mode === "create") await createTeam(formData);
                else await updateTeam(data.teamId, formData);
            }
            showSnackbar(mode === "create" ? "Uspjesno dodato" : "Uspjesno azurirano", "success");
            closeDialog();
            fetchData();
        } catch (err) {
            showSnackbar("Greska pri sacuvavanju", "error");
        }
    };

    const handleDeleteConfirm = async () => {
        const { type, item } = confirmDelete;
        try {
            if (type === "doctors") await deleteDoctor(item.id);
            else if (type === "nurses") await deleteNurse(item.id);
            else if (type === "patients") await deletePatient(item.id);
            else if (type === "teams") await deleteTeam(item.teamId);
            showSnackbar("Uspjesno obrisano", "success");
            setConfirmDelete({ open: false, type: null, item: null });
            fetchData();
        } catch (err) {
            showSnackbar("Greska pri brisanju", "error");
            setConfirmDelete({ open: false, type: null, item: null });
        }
    };

    const teamName = (teamId) => teams.find(t => t.teamId === teamId)?.teamName ?? "—";

    //columns
    const doctorCols = [
        { key: "id", label: "ID" },
        { key: "firstName", label: "Ime" },
        { key: "lastName", label: "Prezime" },
        { key: "username", label: "Korisničko ime" },
        { key: "specialization", label: "Specijalnost" },
        { key: "teamId", label: "Tim", render: r => teamName(r.teamId) },
    ];
    const nurseCols = [
        { key: "id", label: "ID" },
        { key: "firstName", label: "Ime" },
        { key: "lastName", label: "Prezime" },
        { key: "username", label: "Korisničko ime" },
        { key: "teamId", label: "Tim", render: r => teamName(r.teamId) },
    ];
    const patientCols = [
        { key: "id", label: "ID" },
        { key: "firstName", label: "Ime" },
        { key: "lastName", label: "Prezime" },
        { key: "teamId", label: "Tim", render: r => teamName(r.teamId) },
    ];
    const teamCols = [
        { key: "teamId", label: "ID" },
        { key: "teamName", label: "Naziv tima" },
        {
            key: "doctorId", label: "Doktor", render: r => {
                const d = doctors.find(d => d.id === r.doctorId);
                return d ? `${d.firstName} ${d.lastName}` : "—";
            }
        },
    ];

    //dialog
    const renderFormFields = () => {
        const { type } = dialog;
        if (type === "doctors") return (
            <Box display="flex" flexDirection="column" gap={2}>
                <Field label="Ime" name="firstName" value={formData.firstName} onChange={handleFieldChange} required />
                <Field label="Prezime" name="lastName" value={formData.lastName} onChange={handleFieldChange} required />
                <Field label="Korisničko ime" name="username" value={formData.username} onChange={handleFieldChange} required />
                {dialog.mode === "create" &&
                    <Field label="Lozinka" name="password" value={formData.password} onChange={handleFieldChange} type="password" required />}
                {dialog.mode === "edit" &&
                    <Field label="Nova lozinka (ostavi prazno da zadržiš staru)" name="password" value={formData.password} onChange={handleFieldChange} type="password" />}
                <Field label="Specijalnost" name="specialization" value={formData.specialization} onChange={handleFieldChange} required />
                <TeamSelect value={formData.teamId} onChange={handleFieldChange} teams={teams} />
            </Box>
        );
        if (type === "nurses") return (
            <Box display="flex" flexDirection="column" gap={2}>
                <Field label="Ime" name="firstName" value={formData.firstName} onChange={handleFieldChange} required />
                <Field label="Prezime" name="lastName" value={formData.lastName} onChange={handleFieldChange} required />
                <Field label="Korisničko ime" name="username" value={formData.username} onChange={handleFieldChange} required />
                {dialog.mode === "create" &&
                    <Field label="Lozinka" name="password" value={formData.password} onChange={handleFieldChange} type="password" required />}
                {dialog.mode === "edit" &&
                    <Field label="Nova lozinka (ostavi prazno da zadržiš staru)" name="password" value={formData.password} onChange={handleFieldChange} type="password" />}
                <TeamSelect value={formData.teamId} onChange={handleFieldChange} teams={teams} />
            </Box>
        );
        if (type === "patients") return (
            <Box display="flex" flexDirection="column" gap={2}>
                <Field label="Ime" name="firstName" value={formData.firstName} onChange={handleFieldChange} required />
                <Field label="Prezime" name="lastName" value={formData.lastName} onChange={handleFieldChange} required />
                <TeamSelect value={formData.teamId} onChange={handleFieldChange} teams={teams} label="Tim *" />
            </Box>
        );
        if (type === "teams") return (
            <Box display="flex" flexDirection="column" gap={2}>
                <Field label="Naziv tima" name="teamName" value={formData.teamName} onChange={handleFieldChange} required />
            </Box>
        );
    };

    const dialogTitles = {
        doctors: { create: "Dodaj doktora", edit: "Uredi doktora" },
        nurses: { create: "Dodaj sestru", edit: "Uredi sestru" },
        patients: { create: "Dodaj pacijenta", edit: "Uredi pacijenta" },
        teams: { create: "Kreiraj tim", edit: "Uredi tim" },
    };

    //views
    const renderView = () => {
        switch (currentView) {
            case VIEWS.SUMMARY:
                return <SummaryView summary={summary} doctors={doctors} nurses={nurses} patients={patients} teams={teams} />;
            case VIEWS.DOCTORS:
                return <CrudTable title="Doktori" columns={doctorCols} rows={doctors}
                    onAdd={() => openDialog("doctors", "create")}
                    onEdit={r => openDialog("doctors", "edit", { ...r, password: "" })}
                    onDelete={r => setConfirmDelete({ open: true, type: "doctors", item: r })} />;
            case VIEWS.NURSES:
                return <CrudTable title="Sestre" columns={nurseCols} rows={nurses}
                    onAdd={() => openDialog("nurses", "create")}
                    onEdit={r => openDialog("nurses", "edit", { ...r, password: "" })}
                    onDelete={r => setConfirmDelete({ open: true, type: "nurses", item: r })} />;
            case VIEWS.PATIENTS:
                return <CrudTable title="Pacijenti" columns={patientCols} rows={patients}
                    onAdd={() => openDialog("patients", "create")}
                    onEdit={r => openDialog("patients", "edit", r)}
                    onDelete={r => setConfirmDelete({ open: true, type: "patients", item: r })} />;
            case VIEWS.TEAMS:
                return <CrudTable title="Timovi" columns={teamCols} rows={teams}
                    onAdd={() => openDialog("teams", "create")}
                    onEdit={r => openDialog("teams", "edit", r)}
                    onDelete={r => setConfirmDelete({ open: true, type: "teams", item: r })} />;
            default:
                return null;
        }
    };

    return (
        <Box sx={{ display: "flex" }}>
            <Drawer
                variant="permanent"
                anchor="left"
                sx={{ width: 220, flexShrink: 0, "& .MuiDrawer-paper": { width: 220, boxSizing: "border-box" } }}
            >
                <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
                    <Typography variant="subtitle1" fontWeight={700}>eMedical Admin</Typography>
                </Box>
                <List dense>
                    {navItems.map(({ label, view }) => (
                        <ListItem key={label} disablePadding>
                            <ListItemButton
                                selected={currentView === view}
                                onClick={() => handleNav(view)}
                                sx={view === null ? { color: "error.main" } : {}}
                            >
                                <ListItemText primary={label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
                {renderView()}
            </Box>

            <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {dialog.type && dialogTitles[dialog.type]?.[dialog.mode]}
                </DialogTitle>
                <DialogContent dividers sx={{ pt: 2 }}>
                    {renderFormFields()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} variant="outlined">Odustani</Button>
                    <Button onClick={handleSave} variant="contained">
                        {dialog.mode === "create" ? "Dodaj" : "Sačuvaj"}
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmDialog
                open={confirmDelete.open}
                title="Potvrdi brisanje"
                content="Da li ste sigurni da želite obrisati ovaj unos?"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmDelete({ open: false, type: null, item: null })}
            />
        </Box>
    );
}

export default AdminPage;
