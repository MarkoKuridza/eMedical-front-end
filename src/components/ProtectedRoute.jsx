import { Navigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Typography } from "@mui/material";

const API_URL=`http://localhost:9000/auth/check`

function ProtectedRoute({children, allowedRole}) {
    const [auth, setAuth] = useState(false);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}`, { withCredentials : true })
        .then( res => {
            setAuth(res.data.authenticated);
            setRole(res.data.role);
            setLoading(false);
        })
        .catch(() => {
            setAuth(false);
            setLoading(false);
        })
    }, []);

    if(loading) {
        return <Typography>Loading...</Typography>
    }

    if(!auth) {
        return <Navigate to="/login" replace/>;
    }

    if(allowedRole && !allowedRole.includes(role)){
        return <Navigate to="/unauthorized" replace/>;
    }
     

    return children;
}

export default ProtectedRoute;
