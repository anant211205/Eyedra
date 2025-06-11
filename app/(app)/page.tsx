"use client";

import { 
    Box, 
    Container, 
    Typography, 
    Button, 
    Stack,
    Card,
    CardContent,
    Chip
} from "@mui/material";
import { 
    Search, 
    PostAdd, 
    Security, 
    Speed,
    CheckCircle,
    FindInPage
} from "@mui/icons-material";
import Link from "next/link";

export default function HomePage() {
    const features = [
        {
            icon: <PostAdd sx={{ fontSize: 40, color: "primary.main" }} />,
            title: "Post Lost Items",
            description: "Quickly post details about your lost belongings with photos and descriptions."
        },
        {
            icon: <FindInPage sx={{ fontSize: 40, color: "primary.main" }} />,
            title: "Report Found Items",
            description: "Help others by reporting items you've found in your area."
        },
        {
            icon: <Security sx={{ fontSize: 40, color: "primary.main" }} />,
            title: "Secure Claims",
            description: "Safe verification process to ensure items reach their rightful owners."
        },
    ];

    const stats = [
        { number: "1,200+", label: "Items Returned" },
        { number: "500+", label: "Active Users" },
        { number: "98%", label: "Success Rate" }
    ];

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f9fafb" }}>
            <Box sx={{ display: "flex", alignItems: "center", minHeight: "70vh" }}>
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

            <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                    <Box textAlign="center" mb={6}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            How It Works
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Simple steps to reunite people with their belongings
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
                        {features.map((feature, index) => (
                            <Card 
                                key={index}
                                sx={{ 
                                    width: 280,
                                    textAlign: "center",
                                    transition: "transform 0.2s",
                                    "&:hover": { transform: "translateY(-4px)" }
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box mb={2}>
                                        {feature.icon}
                                    </Box>
                                    <Typography variant="h6" fontWeight="600" gutterBottom>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </Container>
            </Box>

            <Box sx={{ bgcolor: "primary.main", color: "white", py: 8 }}>
                <Container maxWidth="md">
                    <Box textAlign="center">
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Ready to Get Started?
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }} paragraph>
                            Join our community and help reunite people with their lost items
                        </Typography>
                        
                        <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
                            <Link href="/register" passHref>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    sx={{ 
                                        bgcolor: "white", 
                                        color: "primary.main",
                                        "&:hover": { bgcolor: "grey.100" }
                                    }}
                                >
                                    Sign Up 
                                </Button>
                            </Link>
                            <Link href="/signin" passHref>
                                <Button 
                                    variant="outlined" 
                                    size="large"
                                    sx={{ 
                                        borderColor: "white", 
                                        color: "white",
                                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
                                    }}
                                >
                                    Sign In
                                </Button>
                            </Link>
                        </Stack>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}