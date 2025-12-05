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
                        <ProtectedRoute>
                            <AdminPage />
                        </ProtectedRoute>} />
                    <Route path="/doctor" element={
                        <ProtectedRoute>
                            <DoctorPage />
                        </ProtectedRoute>} />
                    <Route path="/nurse" element={
                        <ProtectedRoute>
                            <NursePage />
                        </ProtectedRoute>} />

                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </SnackbarProvider>
    );
}

export default App;