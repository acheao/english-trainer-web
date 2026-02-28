import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Box, TextField, Button, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface AnswerEditorProps {
    onSubmit: (answer: string) => void;
    disabled: boolean;
    loading: boolean;
}

export default function AnswerEditor({ onSubmit, disabled, loading }: AnswerEditorProps) {
    const [answer, setAnswer] = useState("");

    const handleSubmit = () => {
        if (answer.trim()) {
            onSubmit(answer.trim());
            setAnswer("");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={8}
                placeholder="Type your answer here... (Cmd/Ctrl + Enter to submit)"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={disabled || loading}
                onKeyDown={handleKeyDown}
                autoFocus
            />
            <Box display="flex" justifyContent="flex-end">
                <Button
                    variant="contained"
                    size="large"
                    endIcon={loading ? undefined : <SendIcon />}
                    onClick={handleSubmit}
                    disabled={!answer.trim() || disabled || loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Answer"}
                </Button>
            </Box>
        </Box>
    );
}
