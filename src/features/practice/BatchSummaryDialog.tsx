import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, Chip } from "@mui/material";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";
import { practiceApi } from "./practiceApi";
import type { QuestionDTO, GradingDTO } from "../../types";
import { useState } from "react";

interface BatchSummaryDialogProps {
    open: boolean;
    sessionId: string;
    results: GradingDTO[];
    onNextBatch: (questions: QuestionDTO[]) => void;
    onFinish: () => void;
}

export default function BatchSummaryDialog({ open, sessionId, results, onNextBatch, onFinish }: BatchSummaryDialogProps) {
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);

    // Compute stats
    const totalScore = results.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;
    const correctCount = results.filter(r => r.isCorrect).length;

    const errorTypesCount = results.flatMap(r => r.errorTypes || []).reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topErrorTypes = Object.entries(errorTypesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const handleNextBatch = async () => {
        setLoading(true);
        try {
            const res = await practiceApi.nextBatch(sessionId);
            if (res.questions && res.questions.length > 0) {
                onNextBatch(res.questions);
            } else {
                showSnackbar("No more questions available for this session.", "info");
                onFinish();
            }
        } catch (err: any) {
            showSnackbar(err.message || "Failed to fetch next batch", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => { }} maxWidth="sm" fullWidth disableEscapeKeyDown>
            <DialogTitle align="center">Batch Completed!</DialogTitle>
            <DialogContent dividers>
                <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
                    <Box display="flex" justifyContent="space-around" width="100%">
                        <Box textAlign="center">
                            <Typography variant="h4" color="primary">{avgScore}</Typography>
                            <Typography variant="body2" color="text.secondary">Avg Score</Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="h4" color="success.main">{correctCount}/{results.length}</Typography>
                            <Typography variant="body2" color="text.secondary">Correct</Typography>
                        </Box>
                    </Box>

                    {topErrorTypes.length > 0 && (
                        <Box width="100%">
                            <Typography variant="subtitle2" gutterBottom>Top Error Types:</Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {topErrorTypes.map(([type, count]) => (
                                    <Chip key={type} label={`${type} (${count})`} color="warning" variant="outlined" />
                                ))}
                            </Box>
                        </Box>
                    )}

                    <Typography variant="body2" color="text.secondary" align="center">
                        Great job! Ready for the next set of questions?
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center", p: 2 }}>
                <Button onClick={onFinish} disabled={loading} color="inherit">
                    Finish Session
                </Button>
                <Button
                    onClick={handleNextBatch}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
                >
                    {loading ? "Loading..." : "Next Batch"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
