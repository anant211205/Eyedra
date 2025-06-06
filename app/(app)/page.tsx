"use client";

import { Box, Container, Typography, Button, Stack } from "@mui/material";
import Link from "next/link";

export default function HomePage() {
    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb", display: "flex", alignItems: "center" }}>
        <Container maxWidth="md">
            <Box textAlign="center" py={8}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
                Lost Something? Found Something?
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
                Reconnect people with their lost belongings in seconds.
                <br />
                A secure Lost & Found platform.
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
                <Link href="/register" passHref>
                <Button variant="contained" size="large">
                    Get Started
                </Button>
                </Link>
                <Link href="/signin" passHref>
                <Button variant="outlined" size="large">
                    Browse Feed
                </Button>
                </Link>
            </Stack>
            </Box>
        </Container>
        </Box>
    );
}
