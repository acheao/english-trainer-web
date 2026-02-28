import { Box, Typography, Grid, Card, CardActionArea, CardContent, useTheme, alpha } from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SettingsIcon from "@mui/icons-material/Settings";
import type { ReactNode } from "react";

interface AppCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  color: string;
}

export default function HomePage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const apps: AppCardProps[] = [
    {
      title: "Practice",
      description: "Start a new training session",
      icon: <EditNoteIcon sx={{ fontSize: 60 }} />,
      path: "/practice",
      color: theme.palette.primary.main,
    },
    {
      title: "Materials",
      description: "Manage your vocabulary and sentences",
      icon: <AutoStoriesIcon sx={{ fontSize: 60 }} />,
      path: "/materials",
      color: theme.palette.secondary.main,
    },
    {
      title: "Statistics",
      description: "View your progress and error analysis",
      icon: <QueryStatsIcon sx={{ fontSize: 60 }} />,
      path: "/stats",
      color: theme.palette.success.main,
    },
    {
      title: "Settings",
      description: "Configure LLM and application preferences",
      icon: <SettingsIcon sx={{ fontSize: 60 }} />,
      path: "/settings",
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 4 }}>
      <Box mb={6}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome to English Trainer
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800 }}>
          Your personal workspace for mastering English. Select an app below to get started.
        </Typography>
      </Box>

      <Grid container spacing={4} alignItems="stretch">
        {apps.map((app) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={app.title} sx={{ display: "flex" }}>
            <Card
              elevation={2}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                border: "1px solid",
                borderColor: alpha(app.color, 0.1),
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: `0 12px 24px -4px ${alpha(app.color, 0.3)}`,
                  borderColor: alpha(app.color, 0.5),
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(app.path)}
                sx={{ flexGrow: 1, p: 2, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start" }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(app.color, 0.1),
                    color: app.color,
                    mb: 3,
                  }}
                >
                  {app.icon}
                </Box>
                <CardContent sx={{ p: 0, flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {app.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {app.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}