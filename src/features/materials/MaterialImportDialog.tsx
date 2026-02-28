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
    const [result, setResult] = useState<{ success: number; skipped: number } | null>(null);

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

            const skipCount = res.skippedDuplicates ?? 0;
            const successCount = res.successfullyImported ?? 0;

            if (skipCount > 0) {
                setResult({ success: successCount, skipped: skipCount });

                if (successCount === 0) {
                    showSnackbar(skipCount === 1 ? "The content already exists." : "All imported content already exists.", "warning");
                } else {
                    showSnackbar(`Imported ${successCount} items; skipped ${skipCount} duplicates.`, "warning");
                }

                if (successCount > 0) {
                    onSuccess();
                }
            } else {
                showSnackbar(`Successfully imported ${successCount} materials.`, "success");
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
                        helperText="Note: Duplicate materials are no longer allowed and will be skipped."
                    />

                    {result && result.skipped > 0 && (
                        <Box bgcolor="warning.light" p={2} borderRadius={1}>
                            <Typography color="warning.contrastText" variant="subtitle2">
                                Skipped {result.skipped} duplicate item{result.skipped !== 1 ? 's' : ''}.
                            </Typography>
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
