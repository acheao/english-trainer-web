import { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    CircularProgress,
} from "@mui/material";
import { practiceApi } from "./practiceApi";
import type { QuestionDTO } from "../../types";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";

interface StartSessionPanelProps {
    onSessionStarted: (sessionId: string, questions: QuestionDTO[]) => void;
}

export default function StartSessionPanel({ onSessionStarted }: StartSessionPanelProps) {
    const { showSnackbar } = useSnackbar();
    const [batchSize, setBatchSize] = useState(10);
    const [generatorMode, setGeneratorMode] = useState<"hybrid" | "llm" | "db_only">("hybrid");
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await practiceApi.startSession({ batchSize, generatorMode });
            if (res.questions && res.questions.length > 0) {
                onSessionStarted(res.sessionId, res.questions);
            } else {
                showSnackbar("No questions generated. Check your materials.", "warning");
            }
        } catch (err: any) {
            showSnackbar(err.message || "Failed to start session", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom align="center">
                    Start a Practice Session
                </Typography>
                <Box display="flex" flexDirection="column" gap={3} mt={3}>
                    <FormControl fullWidth>
                        <InputLabel>Batch Size</InputLabel>
                        <Select value={batchSize} label="Batch Size" onChange={(e) => setBatchSize(Number(e.target.value))}>
                            <MenuItem value={5}>5 Questions</MenuItem>
                            <MenuItem value={10}>10 Questions</MenuItem>
                            <MenuItem value={20}>20 Questions</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth>
                        <InputLabel>Generator Mode</InputLabel>
                        <Select
                            value={generatorMode}
                            label="Generator Mode"
                            onChange={(e) => setGeneratorMode(e.target.value as any)}
                        >
                            <MenuItem value="hybrid">Hybrid (DB + LLM)</MenuItem>
                            <MenuItem value="llm">LLM Only</MenuItem>
                            <MenuItem value="db_only">Database Only</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleStart}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
                    >
                        {loading ? "Generating..." : "Start Practice"}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
