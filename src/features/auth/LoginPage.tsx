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
import { apiFetch } from "../../shared/api/client";
import { useEffect } from "react";

export default function LoginPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await apiFetch<any>("/api/auth/login", {
                method: "POST",
                json: { username, password }
            });

            // Handle standard wrapper { code: 0, data: "token" } or { token: "..." }
            let token = null;
            if (typeof res === 'string') token = res;
            else if (res?.token) token = res.token;
            else if (res?.data?.token) token = res.data.token;
            else if (typeof res?.data === 'string') token = res.data;

            if (token && typeof token === 'string') {
                login(token);
                navigate("/", { replace: true });
            } else {
                throw new Error("Invalid credentials or unexpected response format");
            }
        } catch (err: any) {
            setError(err?.message || "Login failed");
        } finally {
            setLoading(false);
        }
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

                    {error && (
                        <Typography color="error.main" variant="body2" textAlign="center" mb={2} fontWeight="medium">
                            {error}
                        </Typography>
                    )}

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
                                    fontSize: "1.1rem",
                                    boxShadow: 'none',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }
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
