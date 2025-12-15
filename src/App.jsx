import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LogInForm from './components/LogInForm';
import DoctorPage from './components/DoctorPage';
import NursePage from './components/NursePage';
import ProtectedRoute from './components/ProtectedRoute';
import {SnackbarProvider} from './context/SnackbarContext';

const AdminPage = () => {
    <h2>Joooj</h2>
}

function App() {
    return (
        <SnackbarProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LogInForm />} />
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRole={"ADMIN"}>
                            <AdminPage />
                        </ProtectedRoute>} />
                    <Route path="/doctor" element={
                        <ProtectedRoute allowedRole={"DOCTOR"}>
                            <DoctorPage />
                        </ProtectedRoute>} />
                    <Route path="/nurse" element={
                        <ProtectedRoute allowedRole={"NURSE"}>
                            <NursePage />
                        </ProtectedRoute>} />
                    <Route path="/unauthorized" element={
                            <h2>DALJE NECES MOCI</h2>
                        }/>

                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </SnackbarProvider>
    );
}

export default App;