"use client";

import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
} from "@mui/material";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Logout, Settings, Dashboard } from "@mui/icons-material";
import Link from "next/link";

export default function Navbar() {
    const { data: session } = useSession();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const user = session?.user
        ? {
            username: session.user.username || "User",
            image: session.user.avatar || "",
        }
        : null;

        console.log("User session:", user);
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        signOut();
        handleMenuClose();
    };

    return (
        <AppBar position="static" elevation={1} sx={{ bgcolor: "white", color: "black" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
            
                <Typography variant="h6" fontWeight="bold" sx={{ cursor: "pointer", color: "primary.main" }}>
                    EYEDRA
                </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

            {user ? (
                <>

                <Link href="/" passHref>
                    <Button variant="contained" color="primary">About</Button>
                </Link>

                <Typography variant="body1" sx={{ color: "text.primary", display: { xs: "none", sm: "block" } }}>
                    Welcome, <span style={{ fontWeight: "bold" }}>{user.username}</span>
                </Typography>
                
                <Avatar
                    src={user.image}
                    sx={{ cursor: "pointer" }}
                    onClick={handleMenuOpen}
                >
                    {!user.image && user.username?.[0]?.toUpperCase()}
                </Avatar>
                
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    PaperProps={{
                    elevation: 3,
                    sx: {
                        mt: 1.5,
                        minWidth: 200,
                        "& .MuiMenuItem-root": {
                                px: 2,
                                py: 1,
                            },
                        },
                    }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                >
                    <MenuItem onClick={handleMenuClose} component={Link} href="/dashboard">
                        <ListItemIcon>
                            <Dashboard fontSize="small" />
                        </ListItemIcon>
                        Dashboard
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose} component={Link} href="/settings">
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                    <ListItemIcon>
                        <Logout fontSize="small" sx={{ color: "error.main" }} />
                    </ListItemIcon>
                    Logout
                    </MenuItem>
                </Menu>
                </>
            ) : (
                <>
                <Link href="/signin" passHref>
                    <Button variant="outlined" color="primary">Login</Button>
                </Link>
                <Link href="/register" passHref>
                    <Button variant="contained" color="primary">Register</Button>
                </Link>
                </>
            )}
            </Box>
        </Toolbar>
        </AppBar>
    );
}