import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LogInForm from './components/LogInForm';
import DoctorForm from './components/DoctorForm';

function AdminPage(){
    return <h2>ADMINEE</h2>;
}

function NursePage(){
    return <h2>SESTROO</h2>
}

function App(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LogInForm />}/>
                <Route path="/admin" element={<AdminPage />}/>
                <Route path="/doctor" element={<DoctorForm />}/>
                <Route path="/nurse" element={<NursePage />}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;