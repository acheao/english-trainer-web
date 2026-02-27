import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Box,
    Typography,
} from "@mui/material";
import { materialsApi } from "./materialsApi";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";

interface MaterialImportDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function MaterialImportDialog({ open, onClose, onSuccess }: MaterialImportDialogProps) {
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [type, setType] = useState<"auto" | "sentence" | "phrase" | "word">("auto");
    const [tagsInput, setTagsInput] = useState("");
    const [result, setResult] = useState<{ success: number; fails: number; failRows: any[] } | null>(null);

    const handleImport = async () => {
        const lines = content.split("\n").map(l => l.trim()).filter(l => l);
        if (!lines.length) {
            showSnackbar("Please enter some content to import.", "warning");
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const tags = tagsInput.split(",").map(t => t.trim()).filter(t => t);
            const res = await materialsApi.import({ type, lines, tags: tags.length ? tags : undefined });

            if (res.failCount > 0) {
                setResult({ success: res.successCount, fails: res.failCount, failRows: res.fails || [] });
                showSnackbar(`Imported with some errors: ${res.successCount} success, ${res.failCount} failed.`, "warning");
            } else {
                showSnackbar(`Successfully imported ${res.successCount} materials.`, "success");
                onSuccess();
                onClose();
                setContent("");
            }
        } catch (err: any) {
            showSnackbar(err.message || "Failed to import materials", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setContent("");
        setTagsInput("");
        setResult(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Import Materials</DialogTitle>
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" gap={2} pt={1}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select value={type} label="Type" onChange={(e) => setType(e.target.value as any)}>
                            <MenuItem value="auto">Auto-detect</MenuItem>
                            <MenuItem value="sentence">Sentence</MenuItem>
                            <MenuItem value="phrase">Phrase</MenuItem>
                            <MenuItem value="word">Word</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Tags (comma separated)"
                        size="small"
                        fullWidth
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="e.g. daily, work, advanced"
                    />

                    <TextField
                        label="Material Content (One item per line)"
                        multiline
                        rows={8}
                        fullWidth
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={"First line\nSecond line\n..."}
                    />

                    {result && result.fails > 0 && (
                        <Box bgcolor="error.light" p={2} borderRadius={1}>
                            <Typography color="error.contrastText" variant="subtitle2">
                                Failed to import {result.fails} items:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {result.failRows.slice(0, 5).map((f, i) => (
                                    <li key={i}>
                                        <Typography color="error.contrastText" variant="body2">{f.line}: {f.reason}</Typography>
                                    </li>
                                ))}
                                {result.failRows.length > 5 && <li>...and more</li>}
                            </ul>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleImport} variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={20} /> : undefined}>
                    Import
                </Button>
            </DialogActions>
        </Dialog>
    );
}
