import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { CssBaseline, Drawer, Toolbar, Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import DoctorsPatientsView from './views/DoctorsPatientsView';
import DoctorAppointmentPage from './DoctorAppointmentPage';

//dummy podaci
function MainWindow() {
  return <Typography>Doktoreeee</Typography>;
}

function ProcessPatientView() {
  return <Typography>Process any patient</Typography>;
}

const drawerWidth = 240;

function DoctorPage(){
    
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const renderContent = () => {
    switch (selectedIndex) {
      case 0:
        return <MainWindow />;
      case 1:
        return <DoctorsPatientsView />;
      case 2:
        return <DoctorAppointmentPage />;
      case 3:
        return <ProcessPatientView />;
      case 4:
        return <Typography>Logging out...</Typography>;
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
                {['Main window', 'Patients', 'Appointments', 'Process patient', 'Logout'].map((text, index) => (
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