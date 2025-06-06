"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Container,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
    Divider,
} from "@mui/material"
import { Visibility, VisibilityOff, Login, Person } from "@mui/icons-material"

interface FormData {
    identifier: string 
    password: string
}

interface FormErrors {
    identifier?: string
    password?: string
}

export default function SignInForm() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        identifier: "",
        password: "",
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.identifier.trim()) {
            newErrors.identifier = "Email or username required"
        }

        if (!formData.password) {
            newErrors.password = "Password required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        setMessage(null)

        try {
            const result = await signIn('credentials', {
                identifier: formData.identifier,
                password: formData.password,
                redirect: false,
            })

            if (result?.error) {
                setMessage({ type: "error", text: result.error })
            } else if (result?.ok) {
                setMessage({ type: "success", text: "Welcome back!" })
                const session = await getSession()
                if (session) {
                    router.push('/feed') 
                }
            }
        } catch (error: any) {
            setMessage({ type: "error", text: "Sign in failed. Please try again." })
        } finally {
            setLoading(false)
        }
    }

    const handleSignUpClick = () => {
        router.push('/register')
    }

    if (!mounted) {
        return (
            <Container maxWidth="xs" sx={{ py: 2 }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                    <Box sx={{ textAlign: "center", py: 8 }}>
                        <CircularProgress />
                    </Box>
                </Paper>
            </Container>
        )
    }

    return (
        <Container maxWidth="xs" sx={{ py: 2 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Box 
                        sx={{ 
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 60,
                            height: 60,
                            bgcolor: "primary.main",
                            borderRadius: "50%",
                            mb: 2
                        }}
                    >
                        <Login sx={{ color: "white", fontSize: 28 }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Welcome Back
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sign in to your account
                    </Typography>
                </Box>

                {message && (
                    <Alert severity={message.type} sx={{ mb: 2, py: 0.5 }}>
                        {message.text}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email or Username"
                        placeholder="Enter your email or username"
                        value={formData.identifier}
                        onChange={handleInputChange("identifier")}
                        error={!!errors.identifier}
                        helperText={errors.identifier}
                        margin="dense"
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange("password")}
                        error={!!errors.password}
                        helperText={errors.password}
                        margin="dense"
                        size="small"
                        sx={{ mt: 1.5 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        size="small"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* <Box sx={{ textAlign: "right", mt: 1 }}>
                        <Button 
                            variant="text" 
                            size="small" 
                            sx={{ 
                                textTransform: "none", 
                                fontSize: "0.75rem",
                                color: "text.secondary",
                                p: 0.5
                            }}
                        >
                            Forgot Password?
                        </Button>
                    </Box> */}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 2, mb: 2, py: 1 }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Sign In"}
                    </Button>

                    <Divider sx={{ my: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            OR
                        </Typography>
                    </Divider>

                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Don't have an account?{" "}
                        <Button 
                            variant="text" 
                            size="small" 
                            onClick={handleSignUpClick}
                            sx={{ textTransform: "none", p: 0, minWidth: 0, fontWeight: "bold" }}
                        >
                            Sign Up
                        </Button>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    )
}