"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
    Box,
    TextField,
    Button,
    Avatar,
    Typography,
    Paper,
    Container,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
    LinearProgress,
} from "@mui/material"
import { PhotoCamera, Visibility, VisibilityOff, Person } from "@mui/icons-material"
import { useRouter } from "next/navigation"

interface FormData {
    username: string
    email: string
    password: string
    confirmPassword: string
}

interface FormErrors {
    username?: string
    email?: string
    password?: string
    confirmPassword?: string
}

export default function SignupForm() {
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    })

    const [avatar, setAvatar] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string>("")
    const [errors, setErrors] = useState<FormErrors>({})
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
        const [usernameStatus, setUsernameStatus] = useState<{
        checking: boolean
        available: boolean | null
        message: string
    }>({ checking: false, available: null, message: "" })


    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const checkUsername = async () => {
            if (!formData.username.trim() || formData.username.length < 3) {
                setUsernameStatus({ checking: false, available: null, message: "" })
                return
            }

            setUsernameStatus(prev => ({ ...prev, checking: true }))

            try {
                const response = await fetch(`/api/check-username-unique?username=${encodeURIComponent(formData.username)}`)
                const result = await response.json()
                const data = typeof result === 'string' ? JSON.parse(result) : result

                if (response.ok && data.success) {
                    setUsernameStatus({
                        checking: false,
                        available: true,
                        message: "Username is available"
                    })
                } else {
                    setUsernameStatus({
                        checking: false,
                        available: false,
                        message: data.message || "Username is not available"
                    })
                }
            } catch (error) {
                setUsernameStatus({
                    checking: false,
                    available: null,
                    message: "Error checking username"
                })
            }
        }

        checkUsername() 
    }, [formData.username])

    const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
        if (field === 'username') {
            setUsernameStatus({ checking: false, available: null, message: "" })
        }
    }

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file && mounted) {
            setAvatar(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const getPasswordStrength = (password: string) => {
        const minLength = 6
        const hasUpper = /[A-Z]/.test(password)
        const hasLower = /[a-z]/.test(password)
        const hasNumber = /\d/.test(password)
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
        
        let strength = 0
        let requirements = []
        
        if (password.length >= minLength) {
            strength += 25
        } else {
            requirements.push(`${minLength - password.length} more characters`)
        }
        
        if (hasUpper) strength += 25
        else requirements.push("uppercase letter")
        
        if (hasLower) strength += 25
        else requirements.push("lowercase letter")
        
        if (hasNumber) strength += 25
        else requirements.push("number")
        
        return {
            strength,
            requirements,
            color: (strength < 25
                ? 'error'
                : strength < 50
                ? 'warning'
                : strength < 75
                ? 'info'
                : 'success') as 'error' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'inherit'
        }
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!formData.username.trim()) {
            newErrors.username = "Username required"
        } else if (formData.username.length < 3) {
            newErrors.username = "Min 3 characters"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email required"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email"
        }

        if (!formData.password) {
            newErrors.password = "Password required"
        } else if (formData.password.length < 6) {
            newErrors.password = "Min 6 characters"
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Confirm password"
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match"
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
            const submitData = new FormData()
            submitData.append("username", formData.username)
            submitData.append("email", formData.email)
            submitData.append("password", formData.password)
            if (avatar) submitData.append("avatar", avatar)

            const response = await fetch("/api/auth/register", {
                method: "POST",
                body: submitData,
            })

            const result = await response.json()

            if (response.ok) {
                setMessage({ type: "success", text: "Account created!" })
                setFormData({ username: "", email: "", password: "", confirmPassword: "" })
                setAvatar(null)
                setAvatarPreview("")
                router.push('/signin') 
            } else {
                setMessage({ type: "error", text: result.error || "Registration failed" })
            }
        } catch (error) {
            setMessage({ type: "error", text: "Network error" })
        } finally {
            setLoading(false)
        }
    }

    const handleSignInClick = () => {
        router.push('/signin') 
    }

    const passwordStrength = getPasswordStrength(formData.password)

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
                {/* Compact Header */}
                <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Box sx={{ position: "relative", display: "inline-block", mb: 1 }}>
                        <Avatar
                            src={avatarPreview}
                            sx={{
                                width: 60,
                                height: 60,
                                bgcolor: "primary.main",
                            }}
                        >
                            {!avatarPreview && <Person />}
                        </Avatar>
                        <IconButton
                            component="label"
                            sx={{
                                position: "absolute",
                                bottom: -4,
                                right: -4,
                                bgcolor: "background.paper",
                                width: 28,
                                height: 28,
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                            size="small"
                        >
                            <PhotoCamera sx={{ fontSize: 14 }} />
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleAvatarChange} 
                                style={{ display: 'none' }}
                                key={mounted ? 'mounted' : 'unmounted'}
                            />
                        </IconButton>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Sign Up
                    </Typography>
                </Box>

                {/* Compact Alert */}
                {message && (
                    <Alert severity={message.type} sx={{ mb: 2, py: 0.5 }}>
                        {message.text}
                    </Alert>
                )}

                {/* Compact Form */}
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={formData.username}
                        onChange={handleInputChange("username")}
                        error={!!errors.username}
                        helperText={errors.username || 
                                    (usernameStatus.checking ? "Checking availability..." :
                                    usernameStatus.available === true ? usernameStatus.message :
                                    usernameStatus.available === false ? usernameStatus.message : "")
                                }
                        margin="dense"
                        size="small"
                    />

                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange("email")}
                        error={!!errors.email}
                        helperText={errors.email}
                        margin="dense"
                        size="small"
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

                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <Box sx={{ mt: 1, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="caption" sx={{ mr: 1, minWidth: 60 }}>
                                    Strength:
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={passwordStrength.strength} 
                                    color={passwordStrength.color}
                                    sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                                />
                                <Typography variant="caption" sx={{ ml: 1, fontSize: '0.7rem' }}>
                                    {passwordStrength.strength}%
                                </Typography>
                            </Box>
                            {passwordStrength.requirements.length > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                    Need: {passwordStrength.requirements.join(', ')}
                                </Typography>
                            )}
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange("confirmPassword")}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                        margin="dense"
                        size="small"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        size="small"
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 2, mb: 1, py: 1 }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Create Account"}
                    </Button>

                    <Typography variant="body2" color="success" align="center" sx={{ mt: 2 }}>
                        Please remember your password. It cannot be changed later.
                    </Typography>

                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Have an account?{" "}
                        <Button 
                            variant="text" 
                            size="small" 
                            onClick={handleSignInClick}
                            sx={{ textTransform: "none", p: 0, minWidth: 0 }}
                        >
                            Sign In
                        </Button>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    )
}