import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MaterialList from "./MaterialList";
import MaterialImportDialog from "./MaterialImportDialog";

export default function MaterialsPage() {
    const [openImport, setOpenImport] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleImportSuccess = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Materials Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenImport(true)}>
                    Import
                </Button>
            </Box>

            <MaterialList key={refreshKey} />

            <MaterialImportDialog
                open={openImport}
                onClose={() => setOpenImport(false)}
                onSuccess={handleImportSuccess}
            />
        </Box>
    );
}
