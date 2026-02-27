import { useState } from "react";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import EditNoteIcon from "@mui/icons-material/EditNote";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SettingsIcon from "@mui/icons-material/Settings";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const NAV_ITEMS = [
  { text: "Practice", path: "/practice", icon: <EditNoteIcon /> },
  { text: "Materials", path: "/materials", icon: <AutoStoriesIcon /> },
  { text: "Statistics", path: "/stats", icon: <QueryStatsIcon /> },
  { text: "Settings", path: "/settings", icon: <SettingsIcon /> },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          English Trainer
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={active}
                onClick={() => navigate(item.path)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    borderRight: "4px solid",
                    borderColor: "primary.main",
                  },
                }}
              >
                <ListItemIcon sx={{ color: active ? "primary.main" : "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{ primary: { fontWeight: active ? "bold" : "regular" } }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {NAV_ITEMS.find((n) => location.pathname.startsWith(n.path))?.text || "English Trainer"}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}