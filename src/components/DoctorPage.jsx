import * as React from 'react';
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { CssBaseline, Drawer, Toolbar, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import DoctorsPatientsView from './views/DoctorsPatientsView';
import DoctorAppointmentView from './views/DoctorAppointmentView';

//dummy podaci
function MainWindow() {
  return <Typography>Doktoreeee</Typography>;
}

function EmergencyView() {
  return <Typography>Hitan Slucaj...</Typography>
}

const drawerWidth = 240;

function DoctorPage(){
    
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const navigate = useNavigate();

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);

    if(index === 4) {
      handleLogOut();
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  }


  const renderContent = () => {
    switch (selectedIndex) {
      case 0:
        return <MainWindow />;
      case 1:
        return <DoctorsPatientsView />;
      case 2:
        return <DoctorAppointmentView />;
      case 3:
        return <EmergencyView />;
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
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Doctor Panel
                </Typography>
            </Toolbar>
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
                {['Main window', 'Patients', 'Appointments', 'Emergency', 'Logout'].map((text, index) => (
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
                <Toolbar/>
                    {renderContent()}
        </Box>
    </Box>
  );
}

export default DoctorPage;