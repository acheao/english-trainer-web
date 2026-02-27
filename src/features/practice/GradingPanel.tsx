import { Box, Card, CardContent, Typography, Chip, Divider, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import type { GradingDTO } from "../../types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LightbulbCircleIcon from "@mui/icons-material/LightbulbCircle";

interface GradingPanelProps {
    grading: GradingDTO;
}

export default function GradingPanel({ grading }: GradingPanelProps) {
    return (
        <Card sx={{ mt: 3, border: 1, borderColor: grading.isCorrect ? "success.main" : "warning.main" }}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                    {grading.isCorrect ? (
                        <CheckCircleIcon color="success" fontSize="large" />
                    ) : (
                        <CancelIcon color="warning" fontSize="large" />
                    )}
                    <Typography variant="h6" color={grading.isCorrect ? "success.main" : "warning.main"}>
                        Score: {grading.score}/100
                    </Typography>
                </Box>

                {grading.rawText ? (
                    <Box p={2} bgcolor="error.50" borderRadius={1}>
                        <Typography variant="body2" color="error.main" fontWeight={500}>
                            Failed to parse grading result properly:
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 1 }}>
                            {grading.rawText}
                        </Typography>
                    </Box>
                ) : (
                    <Box display="flex" flexDirection="column" gap={2}>
                        {/* Corrected Answer */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={0.5}>
                                <AutoAwesomeIcon fontSize="small" /> Corrected Version
                            </Typography>
                            <Typography variant="body1" sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 1 }}>
                                {grading.correctedAnswer}
                            </Typography>
                        </Box>

                        {/* Error Types */}
                        {grading.errorTypes && grading.errorTypes.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Issues Found
                                </Typography>
                                <Box display="flex" gap={1} flexWrap="wrap">
                                    {grading.errorTypes.map((err, i) => (
                                        <Chip key={i} label={err} size="small" color="error" variant="outlined" />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        <Divider />

                        {/* Explanation & Suggestions */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={0.5}>
                                <LightbulbCircleIcon fontSize="small" /> Explanation
                            </Typography>
                            <Typography variant="body2" paragraph>
                                {grading.explanationZh}
                            </Typography>

                            {grading.suggestions && grading.suggestions.length > 0 && (
                                <List dense disablePadding>
                                    {grading.suggestions.map((sug, i) => (
                                        <ListItem key={i} disableGutters alignItems="flex-start">
                                            <ListItemIcon sx={{ minWidth: 24, mt: 0.5 }}>
                                                <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main" }} />
                                            </ListItemIcon>
                                            <ListItemText primary={sug} primaryTypographyProps={{ variant: "body2" }} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
