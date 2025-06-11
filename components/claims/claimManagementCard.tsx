'use client';

import {
    Card,
    CardContent,
    Typography,
    Box,
    Avatar,
    Chip,
    Button,
    Stack,
    Divider,
    Dialog,
    DialogContent,
    DialogActions,
    Paper
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    Email,
    AccessTime,
    Message,
    PhotoCamera,
} from '@mui/icons-material';
import { useState } from 'react';
import { ClaimStatus, ClaimType } from '@/models/Claim';

type ClaimData = {
    _id: string;
    claimant_id: {
        _id: string;
        username: string;
        email: string;
        avatar?: string;
        createdAt: string;
    };
    finder_id?: {
        _id: string;
        username: string;
        email: string;
        avatar?: string;
    };
    post_id: string;
    status: ClaimStatus;
    claim_type: ClaimType;
    message: string;
    photo_proof?: string; 
    created_at: string;
    updated_at: string;
};

type ClaimManagementCardProps = {
    claim: ClaimData;
    onApprove: () => void;
    onDeny: () => void;
    isLoading: boolean;
};

export default function ClaimManagementCard({
    claim,
    onApprove,
    onDeny,
    isLoading
}: ClaimManagementCardProps) {
    const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

    const getStatusConfig = (status: ClaimStatus) => {
        switch (status) {
            case ClaimStatus.APPROVED:
                return {
                    color: 'success' as const,
                    icon: <CheckCircle sx={{ fontSize: 16 }} />,
                    label: 'Approved'
                };
            case ClaimStatus.DENIED:
                return {
                    color: 'error' as const,
                    icon: <Cancel sx={{ fontSize: 16 }} />,
                    label: 'Denied'
                };
            default:
                return {
                    color: 'warning' as const,
                    icon: <AccessTime sx={{ fontSize: 16 }} />,
                    label: 'Pending'
                };
        }
    };

    const getClaimTypeConfig = (type: ClaimType) => {
        switch (type) {
            case ClaimType.FINDER_CLAIM:
                return {
                    color: 'info' as const,
                    label: 'Finder Claim'
                };
            case ClaimType.OWNERSHIP_CLAIM:
                return {
                    color: 'primary' as const,
                    label: 'Ownership Claim'
                };
            default:
                return {
                    color: 'default' as const,
                    label: 'Unknown'
                };
        }
    };

    const statusConfig = getStatusConfig(claim.status);
    const typeConfig = getClaimTypeConfig(claim.claim_type);

    const handlePhotoClick = () => {
        setPhotoDialogOpen(true);
    };

    const isPending = claim.status === ClaimStatus.PENDING;

    return (
        <>
            <Card 
                sx={{ 
                    '&:hover': { 
                        boxShadow: 4 
                    },
                    border: claim.status === ClaimStatus.PENDING ? 2 : 1,
                    borderColor: claim.status === ClaimStatus.PENDING ? 'warning.main' : 'divider'
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                                src={claim.claimant_id.avatar}
                                sx={{ width: 50, height: 50 }}
                            >
                                {claim.claimant_id.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {claim.claimant_id.username}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Member since {new Date(claim.claimant_id.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                                label={typeConfig.label}
                                color={typeConfig.color}
                                size="small"
                            />
                            <Chip
                                label={statusConfig.label}
                                color={statusConfig.color}
                                icon={statusConfig.icon}
                                size="small"
                            />
                        </Stack>
                    </Box>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                                {claim.claimant_id.email}
                            </Typography>
                        </Box>
                    </Stack>

                    {claim.message && (
                        <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Message sx={{ fontSize: 16, color: 'text.secondary', mt: 0.5 }} />
                                <Typography variant="body2">
                                    {claim.message}
                                </Typography>
                            </Box>
                        </Paper>
                    )}

                    {claim.photo_proof && (
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PhotoCamera sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Evidence Photo
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.8 },
                                    border: 1,
                                    borderColor: 'divider'
                                }}
                                onClick={handlePhotoClick}
                            >
                                <img
                                    src={claim.photo_proof}
                                    alt="Evidence Photo"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </Box>
                        </Box>
                    )}

                    {claim.finder_id && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                                Found by:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    src={claim.finder_id.avatar}
                                    sx={{ width: 32, height: 32 }}
                                >
                                    {claim.finder_id.username.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {claim.finder_id.username}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {claim.finder_id.email}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                        <Box>
                            {isPending && (
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<CheckCircle />}
                                        onClick={onApprove}
                                        disabled={isLoading}
                                        size="small"
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<Cancel />}
                                        onClick={onDeny}
                                        disabled={isLoading}
                                        size="small"
                                    >
                                        Deny
                                    </Button>
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Dialog
                open={photoDialogOpen}
                onClose={() => setPhotoDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent sx={{ p: 1 }}>
                    {claim.photo_proof && (
                        <img
                            src={claim.photo_proof}
                            alt="Evidence Photo"
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 8
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPhotoDialogOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}