import { AppBar, Box, Container, Toolbar, Typography, Button } from "@mui/material";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

function NavButton({ to, label }: { to: string; label: string }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Button
      component={RouterLink}
      to={to}
      color={active ? "secondary" : "inherit"}
      variant={active ? "outlined" : "text"}
      sx={{ borderColor: active ? "secondary.main" : "transparent" }}
    >
      {label}
    </Button>
  );
}

export default function Layout() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0} color="default">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            english trainer
          </Typography>

          <NavButton to="/" label="home" />
          <NavButton to="/settings" label="settings" />
          <NavButton to="/ping" label="ping" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}