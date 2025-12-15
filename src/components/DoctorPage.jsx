import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { CssBaseline, Drawer, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import DoctorsPatientsView from './views/DoctorsPatientsView';
import DoctorAppointmentView from './views/DoctorAppointmentView';
import axios from "axios";

axios.defaults.withCredentials = true;

const API_LOGOUT = "http://localhost:9000/auth/logout"

//dummy podaci
function MainWindow() {
  return <Typography>Doktoreeee</Typography>;
}

const drawerWidth = 240;

function DoctorPage(){
    
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);

    if(index === 3) {
      handleLogOut();
    }
  };

  const handleLogOut = async () => {
    try{
        axios.post(`${API_LOGOUT}`, {withCredentials: true});
    } catch(err){
      console.log("Neuspjesno odjavljivanje");
    }
    navigate("/login");
  };


  const renderContent = () => {
    switch (selectedIndex) {
      case 0:
        return <MainWindow />;
      case 1:
        return <DoctorsPatientsView />;
      case 2:
        return <DoctorAppointmentView />;
      default:
        return <MainWindow />;
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>

        <CssBaseline/>

        <AppBar 
          position="fixed"
          sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px)` }}
        >
        </AppBar>

        
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
                },
            }}
            variant="permanent"
            anchor="left"
            >

            <List>
                {['Main window', 'Patients', 'Appointments', 'Logout'].map((text, index) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton
                            selected={selectedIndex === index}
                            onClick={(event) => handleListItemClick(event, index)}
                            >
                                <ListItemText primary={text} />
                            </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
        
         <Box
            component="main"
            sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
            >
               
                    {renderContent()}
        </Box>
    </Box>
  );
}

export default DoctorPage;