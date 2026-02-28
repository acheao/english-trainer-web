import { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    List,
    ListItem,
    ListItemText,
    Paper,
    Divider,
    CircularProgress,
    ToggleButtonGroup,
    ToggleButton
} from "@mui/material";
import { statsApi } from "./statsApi";
import type { StatsOverview, ErrorTypeStat } from "./statsApi";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";

export default function StatsPage() {
    const { showSnackbar } = useSnackbar();

    const [overview, setOverview] = useState<StatsOverview | null>(null);
    const [errorTypes, setErrorTypes] = useState<ErrorTypeStat[]>([]);
    const [range, setRange] = useState<"7d" | "30d">("7d");

    const [loadingOverview, setLoadingOverview] = useState(false);
    const [loadingErrors, setLoadingErrors] = useState(false);

    useEffect(() => {
        const fetchOverview = async () => {
            setLoadingOverview(true);
            try {
                const res = await statsApi.getOverview();
                setOverview(res);
            } catch (err: any) {
                showSnackbar(err.message || "Failed to load overview stats", "error");
            } finally {
                setLoadingOverview(false);
            }
        };
        fetchOverview();
    }, [showSnackbar]);

    useEffect(() => {
        const fetchErrorTypes = async () => {
            setLoadingErrors(true);
            try {
                const res = await statsApi.getErrorTypes(range);
                setErrorTypes(res.items || []);
            } catch (err: any) {
                showSnackbar(err.message || "Failed to load error stats", "error");
            } finally {
                setLoadingErrors(false);
            }
        };
        fetchErrorTypes();
    }, [range, showSnackbar]);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Statistics
            </Typography>

            {/* Overview Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Today's Output
                            </Typography>
                            {loadingOverview ? <CircularProgress size={24} /> : (
                                <Typography variant="h3">{overview?.todayDone || 0}</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Today Avg Score
                            </Typography>
                            {loadingOverview ? <CircularProgress size={24} /> : (
                                <Typography variant="h3" color="primary.main">{overview?.todayAvgScore || 0}</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Today Accuracy
                            </Typography>
                            {loadingOverview ? <CircularProgress size={24} /> : (
                                <Typography variant="h3" color="success.main">
                                    {overview?.todayAccuracy ? `${Math.round(overview.todayAccuracy * 100)}%` : "0%"}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Due for Review
                            </Typography>
                            {loadingOverview ? <CircularProgress size={24} /> : (
                                <Typography variant="h3" color="warning.main">{overview?.dueCount || 0}</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Error Types Top List */}
            <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Top Error Types</Typography>
                    <ToggleButtonGroup
                        value={range}
                        exclusive
                        onChange={(e, newRange) => newRange && setRange(newRange)}
                        size="small"
                    >
                        <ToggleButton value="7d">Last 7 Days</ToggleButton>
                        <ToggleButton value="30d">Last 30 Days</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {loadingErrors ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : errorTypes.length === 0 ? (
                    <Typography color="text.secondary" align="center" py={4}>
                        No error data available for this period. Great job!
                    </Typography>
                ) : (
                    <List>
                        {errorTypes.map((err, index) => (
                            <ListItem key={err.errorType} divider={index < errorTypes.length - 1}>
                                <ListItemText
                                    primary={
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="subtitle1" fontWeight={500}>
                                                {index + 1}. {err.errorType}
                                            </Typography>
                                            <Typography variant="body1" color="error.main" fontWeight={500}>
                                                {err.count} times
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={`Last seen: ${new Date(err.lastSeenAt).toLocaleString()}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
}
