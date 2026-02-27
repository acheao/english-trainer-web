import { useState, useEffect, useCallback } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Switch,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Tooltip,
    Typography,
} from "@mui/material";
import type { MaterialDTO } from "../../types";
import { materialsApi } from "./materialsApi";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";

export default function MaterialList() {
    const { showSnackbar } = useSnackbar();
    const [materials, setMaterials] = useState<MaterialDTO[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // Filters
    const [query, setQuery] = useState("");
    const [type, setType] = useState<string>("all");
    const [enabled, setEnabled] = useState<string>("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const res = await materialsApi.getList({
                query: query ? query : undefined,
                type: type !== "all" ? type : undefined,
                enabled: enabled !== "all" ? enabled === "true" : undefined,
                page: page + 1, // API might be 1-indexed, wait, usually it's best to align with backend. Assuming 1-indexed for now.
                size: rowsPerPage,
            });
            setMaterials(res.items || []);
            setTotal(res.total || 0);
        } catch (err: any) {
            showSnackbar(err.message || "Failed to fetch materials", "error");
        } finally {
            setLoading(false);
        }
    }, [query, type, enabled, page, rowsPerPage, showSnackbar]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleToggleEnabled = async (material: MaterialDTO) => {
        try {
            const updated = await materialsApi.update(material.id, { enabled: !material.enabled });
            setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
            showSnackbar(`Material ${updated.enabled ? "enabled" : "disabled"}`, "success");
        } catch (err: any) {
            showSnackbar(err.message || "Failed to update material", "error");
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2, p: 2 }}>
                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                    <TextField
                        label="Search keyword"
                        variant="outlined"
                        size="small"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        sx={{ flexGrow: 1, minWidth: 200 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Type</InputLabel>
                        <Select value={type} label="Type" onChange={(e) => setType(e.target.value)}>
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="sentence">Sentence</MenuItem>
                            <MenuItem value="phrase">Phrase</MenuItem>
                            <MenuItem value="word">Word</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select value={enabled} label="Status" onChange={(e) => setEnabled(e.target.value)}>
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="true">Enabled</MenuItem>
                            <MenuItem value="false">Disabled</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <TableContainer>
                    <Table size="medium">
                        <TableHead>
                            <TableRow>
                                <TableCell>Content</TableCell>
                                <TableCell width="10%">Type</TableCell>
                                <TableCell width="15%">Tags</TableCell>
                                <TableCell width="15%">Created</TableCell>
                                <TableCell width="10%">Enabled</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && materials.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : materials.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No materials found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                materials.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>
                                            <Tooltip title={row.content} placement="top-start">
                                                <Typography noWrap sx={{ maxWidth: 300 }}>
                                                    {row.content}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{row.type}</TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={0.5} flexWrap="wrap">
                                                {row.tags?.map((t, i) => (
                                                    <Chip key={i} label={t} size="small" />
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={row.enabled}
                                                onChange={() => handleToggleEnabled(row)}
                                                color="primary"
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>
        </Box>
    );
}
