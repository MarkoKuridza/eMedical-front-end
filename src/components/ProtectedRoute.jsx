import { Navigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Typography } from "@mui/material";

const API_URL=`http://localhost:9000/auth/check`

function ProtectedRoute({children}) {
    const [auth, setAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}`, { withCredentials : true })
        .then( res => {
            setAuth(res.data.authenticated);
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

    return children;
}

export default ProtectedRoute;
