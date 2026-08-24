import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const ConfirmDialog = ({ open, title, content, onConfirm, onCancel }) => {
    return(
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{content}</DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Odustani</Button>
                <Button color="error" variant="contained" onClick={onConfirm}>
                    Potvrdi
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;