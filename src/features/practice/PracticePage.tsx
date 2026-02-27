import { useState } from "react";
import { Box, Button, Typography, Stepper, Step, StepLabel } from "@mui/material";
import StartSessionPanel from "./StartSessionPanel";
import QuestionCard from "./QuestionCard";
import AnswerEditor from "./AnswerEditor";
import GradingPanel from "./GradingPanel";
import BatchSummaryDialog from "./BatchSummaryDialog";
import { useSnackbar } from "../../shared/ui/SnackbarProvider";
import { practiceApi } from "./practiceApi";
import type { QuestionDTO, GradingDTO } from "../../types";

export default function PracticePage() {
    const { showSnackbar } = useSnackbar();

    // State Machine
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<QuestionDTO[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Grading State
    const [loadingGrade, setLoadingGrade] = useState(false);
    const [currentGrading, setCurrentGrading] = useState<GradingDTO | null>(null);
    const [batchResults, setBatchResults] = useState<GradingDTO[]>([]);

    // Dialog State
    const [showSummary, setShowSummary] = useState(false);

    const currentQuestion = questions[currentIndex];

    const handleSessionStarted = (sid: string, qs: QuestionDTO[]) => {
        setSessionId(sid);
        setQuestions(qs);
        setCurrentIndex(0);
        setBatchResults([]);
        setCurrentGrading(null);
        setShowSummary(false);
    };

    const handleSubmitAnswer = async (answer: string) => {
        setLoadingGrade(true);
        setCurrentGrading(null);
        try {
            const res = await practiceApi.submitAnswer({ questionId: currentQuestion.id, userAnswer: answer });
            setCurrentGrading(res);
            setBatchResults(prev => [...prev, res]);
        } catch (err: any) {
            showSnackbar(err.message || "Failed to submit answer", "error");
        } finally {
            setLoadingGrade(false);
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentGrading(null);
        } else {
            setShowSummary(true);
        }
    };

    const handleNextBatch = (qs: QuestionDTO[]) => {
        setQuestions(qs);
        setCurrentIndex(0);
        setBatchResults([]);
        setCurrentGrading(null);
        setShowSummary(false);
    };

    const handleFinishSession = () => {
        setSessionId(null);
        setQuestions([]);
        setCurrentIndex(0);
        setBatchResults([]);
        setCurrentGrading(null);
        setShowSummary(false);
    };

    if (!sessionId || questions.length === 0) {
        return (
            <Box>
                <Typography variant="h4" mb={2}>Practice</Typography>
                <StartSessionPanel onSessionStarted={handleSessionStarted} />
            </Box>
        );
    }

    return (
        <Box maxWidth="md" mx="auto">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Session Active</Typography>
                <Button color="error" variant="text" onClick={handleFinishSession}>Exit Session</Button>
            </Box>

            <Box mb={4}>
                <Stepper activeStep={currentIndex} alternativeLabel>
                    {questions.map((q, i) => (
                        <Step key={q.id} completed={i < currentIndex}>
                            <StepLabel sx={{
                                "& .MuiStepLabel-label": { mt: 0.5 },
                                "& .MuiStepIcon-root.Mui-active": { color: "secondary.main" }
                            }} />
                        </Step>
                    ))}
                </Stepper>
                <Typography align="center" variant="body2" color="text.secondary" mt={1}>
                    Question {currentIndex + 1} of {questions.length}
                </Typography>
            </Box>

            {currentQuestion && (
                <QuestionCard question={currentQuestion} />
            )}

            {!currentGrading && (
                <AnswerEditor onSubmit={handleSubmitAnswer} disabled={loadingGrade} loading={loadingGrade} />
            )}

            {currentGrading && (
                <Box>
                    <GradingPanel grading={currentGrading} />
                    <Box display="flex" justifyContent="flex-end" mt={3}>
                        <Button variant="contained" size="large" onClick={handleNextQuestion}>
                            {currentIndex < questions.length - 1 ? "Next Question >>" : "Show Summary"}
                        </Button>
                    </Box>
                </Box>
            )}

            <BatchSummaryDialog
                open={showSummary}
                sessionId={sessionId}
                results={batchResults}
                onNextBatch={handleNextBatch}
                onFinish={handleFinishSession}
            />
        </Box>
    );
}
