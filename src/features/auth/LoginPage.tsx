import { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    CircularProgress,
    alpha,
    useTheme
} from "@mui/material";
import { Visibility, VisibilityOff, Login as LoginIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // For MVP, accepts any input
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Mock API delay
        setTimeout(() => {
            login();
            navigate("/", { replace: true });
        }, 800);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.2)} 100%)`,
                p: 2,
            }}
        >
            <Card
                elevation={12}
                sx={{
                    maxWidth: 400,
                    width: "100%",
                    borderRadius: 3,
                    backdropFilter: "blur(10px)",
                    backgroundColor: alpha(theme.palette.background.paper, 0.85),
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box textAlign="center" mb={4}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign in to continue your English training journey
                        </Typography>
                    </Box>

                    <form onSubmit={handleLogin}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                slotProps={{
                                    input: { sx: { borderRadius: 2 } }
                                }}
                            />

                            <TextField
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                variant="outlined"
                                fullWidth
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                slotProps={{
                                    input: {
                                        sx: { borderRadius: 2 },
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading || !username || !password}
                                endIcon={!loading && <LoginIcon />}
                                sx={{
                                    mt: 2,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: "bold",
                                    textTransform: "none",
                                    fontSize: "1.1rem"
                                }}
                            >
                                {loading ? <CircularProgress size={26} color="inherit" /> : "Sign In"}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
