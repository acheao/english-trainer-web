import { Card, CardContent, Typography, Button, Stack, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { getApiBaseUrl } from "../../shared/config/runtime";

export default function HomePage() {
  const baseUrl = getApiBaseUrl();

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            english trainer
          </Typography>
          <Typography color="text.secondary">
            practice writing with graded exercises. build step by step.
          </Typography>
          <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
            backend: {baseUrl}
          </Typography>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              settings
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              set backend base url.
            </Typography>
            <Button component={RouterLink} to="/settings" variant="contained">
              open
            </Button>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ping
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              test backend connection.
            </Typography>
            <Button component={RouterLink} to="/ping" variant="contained">
              open
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
}