"use client";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Alert,
    CircularProgress,
    Paper,
    Chip,
} from "@mui/material";
import {
    Close,
    CloudUpload,
    Delete,
    Send,
    Warning,
} from "@mui/icons-material";
import { useState, useRef } from "react";
import { PostType } from "@/models/Posts";
import { ClaimType } from "@/models/Claim";

interface ClaimModalProps {
    open: boolean;
    onClose: () => void;
    postid: string;
    postType: PostType;
    postedBy: string;
    onClaimSuccess?: () => void; 
}

export default function ClaimModal({
    open,
    onClose,
    postid,
    postType,
    postedBy,
    onClaimSuccess,
}: ClaimModalProps) {
    const [message, setMessage] = useState("");
    const [photoProof, setPhotoProof] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isLostPost = postType === PostType.LOST;
    const isFoundPost = postType === PostType.FOUND;
    
    const getModalTitle = () => {
        if (isFoundPost) return "Send Claim Request";
        if (isLostPost) return "Contact Owner";
        return "Make a Claim";
    };

    const getSubmitButtonText = () => {
        if (isFoundPost) return "Send Claim Request";
        if (isLostPost) return "Contact Owner";
        return "Submit";
    };

    const getTextFieldLabel = () => {
        if (isFoundPost) return "Why do you think this is yours? Provide details to help verify ownership.";
        if (isLostPost) return "Message to the owner about finding their item";
        return "Provide details about your claim";
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            setError("Only JPEG, PNG, and WebP images are allowed");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be less than 5MB");
            return;
        }

        setError("");
        setPhotoProof(file);
        setPreviewUrl(URL.createObjectURL(file));
        
        // console.log("File selected:", {
        //     name: file.name,
        //     type: file.type,
        //     size: file.size
        // });
    };

    const removePhoto = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPhotoProof(null);
        setPreviewUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async () => {
    if (!message.trim()) {
        setError("Please provide a message.");
        return;
    }

    setLoading(true);
    setError("");

    try {
        
        const endpoint = isLostPost ? `/api/claim/${postid}/direct` : `/api/claim/${postid}`;
        const claimType = isLostPost ? ClaimType.FINDER_CLAIM : ClaimType.OWNERSHIP_CLAIM;
        
        const formData = new FormData();
        formData.append("message", message.trim());
        formData.append("claim_type", claimType);
        
        if (photoProof && isFoundPost) {
            formData.append("photo_proof", photoProof, photoProof.name);
        }
        // console.log("→ POST to:", endpoint);

        const response = await fetch(endpoint, {
            method: "POST",
            body: formData,
        });

        // console.log("Response status:", response.status);
        // console.log("Response headers:", response.headers.get('content-type'));

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const responseText = await response.text();
            console.error("Expected JSON but got:", responseText);
            throw new Error(`Server returned ${response.status}: Expected JSON but got ${contentType || 'unknown content type'}`);
        }

        const data = await response.json();
        console.log("Response data:", data);

        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }

        setMessage("");
        removePhoto();
        
        onClaimSuccess?.();
        onClose();

    } catch (err: any) {
        console.error("Submission error:", err);

        if (err.name === 'SyntaxError' && err.message.includes('Unexpected token')) {
            setError("Server error: API returned invalid response. Please check the console for details.");
        } else if (err.message.includes('Failed to fetch')) {
            setError("Network error: Unable to connect to server. Please check your connection.");
        } else {
            setError(err.message || "Failed to submit claim. Please try again.");
        }
    } finally {
        setLoading(false);
    }
};

    const handleClose = () => {
        if (!loading) {
            setMessage("");
            removePhoto();
            setError("");
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h6" fontWeight={600}>
                        {getModalTitle()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {isFoundPost 
                            ? `Claiming ownership of ${postedBy}'s found item`
                            : `Contacting ${postedBy} about finding their lost item`
                        }
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} disabled={loading}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                {/* Debug info - remove in production */}
                {/* {photoProof && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="caption">
                            Debug: Photo selected - {photoProof.name} ({(photoProof.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                    </Alert>
                )} */}
                
                {/* Important warning about non-reversible action */}
                <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                        Important: This action cannot be reverted
                    </Typography>
                    <Typography variant="caption">
                        {isFoundPost 
                            ? "Once you send a claim request, you cannot cancel it. Make sure you provide accurate information."
                            : "Once you contact the owner, you cannot cancel the message. Make sure you have actually found their item."
                        }
                    </Typography>
                </Alert>
                
                {isFoundPost && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Your ownership claim will be sent to the finder for review. Please provide detailed information to prove this item belongs to you.
                    </Alert>
                )}

                {isLostPost && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Your message will be sent to the owner to let them know you found their item. They will be able to contact you directly.
                    </Alert>
                )}

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={getTextFieldLabel()}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ mb: 3 }}
                    required
                    disabled={loading}
                />

                {isFoundPost && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Photo Proof (Recommended for ownership claims)
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                            Upload a photo showing ownership or unique identifying features that prove this item belongs to you
                        </Typography>
                        
                        {!photoProof ? (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3,
                                    textAlign: "center",
                                    borderStyle: "dashed",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    "&:hover": loading ? {} : { bgcolor: "grey.50" },
                                }}
                                onClick={loading ? undefined : () => fileInputRef.current?.click()}
                            >
                                <CloudUpload sx={{ fontSize: 48, color: "grey.400", mb: 1 }} />
                                <Typography>Click to upload photo</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    JPEG, PNG, WebP up to 5MB
                                </Typography>
                            </Paper>
                        ) : (
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <img 
                                        src={previewUrl} 
                                        alt="Proof" 
                                        width={80} 
                                        height={80} 
                                        style={{ objectFit: "cover", borderRadius: 8 }} 
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography>{photoProof.name}</Typography>
                                        <Typography variant="caption">
                                            {(photoProof.size / 1024 / 1024).toFixed(2)} MB
                                        </Typography>
                                        <Chip 
                                            label="Ready to upload" 
                                            color="success" 
                                            size="small" 
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                    <IconButton 
                                        onClick={removePhoto} 
                                        color="error"
                                        disabled={loading}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            </Paper>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            hidden
                            onChange={handleFileSelect}
                            disabled={loading}
                        />
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={handleClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading || !message.trim()}
                    startIcon={loading ? <CircularProgress size={16} /> : <Send />}
                    sx={{ minWidth: 140 }}
                >
                    {loading ? "Sending..." : getSubmitButtonText()}
                </Button>
            </DialogActions>
        </Dialog>
    );
}