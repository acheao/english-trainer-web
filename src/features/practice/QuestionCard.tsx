import { Box, Card, CardContent, Typography, Chip, Collapse } from "@mui/material";
import type { QuestionDTO } from "../../types";
import { useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import IconButton from "@mui/material/IconButton";

interface QuestionCardProps {
    question: QuestionDTO;
}

export default function QuestionCard({ question }: QuestionCardProps) {
    const [showHint, setShowHint] = useState(false);

    const getTypeColor = (type: string) => {
        switch (type) {
            case "translate":
                return "primary";
            case "correct":
                return "error";
            case "rewrite":
                return "secondary";
            case "cloze":
                return "success";
            case "compose":
                return "info";
            default:
                return "default";
        }
    };

    return (
        <Card sx={{ mb: 3, boxShadow: 2 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip label={question.type.toUpperCase()} color={getTypeColor(question.type) as any} size="small" />

                    {question.referenceAnswer && (
                        <IconButton onClick={() => setShowHint(!showHint)} size="small" color={showHint ? "primary" : "default"}>
                            <InfoOutlinedIcon />
                        </IconButton>
                    )}
                </Box>

                <Typography variant="h5" component="div" sx={{ fontWeight: 500, lineHeight: 1.5, mb: 1 }}>
                    {question.prompt}
                </Typography>

                <Collapse in={showHint}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: "info.50", borderRadius: 1, border: "1px dashed", borderColor: "info.300" }}>
                        <Typography variant="body2" color="info.main">
                            <strong>Hint:</strong> {question.referenceAnswer?.join(" / ")}
                        </Typography>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}
