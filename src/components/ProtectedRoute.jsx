import { Navigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({children, allowedRole}) {
    const { user, loading } = useAuth();

    if(loading) {
        return <Typography sx={{ mt: 4, textAlign: "center" }}>Loading...</Typography>
    }

    if(!user) {
        return <Navigate to="/login" replace/>;
    }

    if(allowedRole && !user.role.includes(allowedRole)){
        return <Navigate to="/unauthorized" replace/>;
    }
     
    return children;
}

export default ProtectedRoute;
