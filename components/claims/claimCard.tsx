import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface ClaimCardProps {
    claimId: string;
    claimantName: string;
    email: string;
    claimedAt: string;
    status: 'pending' | 'approved' | 'denied';
    onDelete: (claimId: string) => Promise<void> | void;
    isPostDeleted?: boolean; 
}

export default function ClaimCard({
    claimId,
    claimantName,
    email,
    claimedAt,
    status,
    onDelete,
    isPostDeleted = false
}: ClaimCardProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'denied':
                return 'error';
            case 'pending':
            default:
                return 'warning';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await onDelete(claimId);
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Error deleting claim:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    return (
        <>
            <Card 
                sx={{ 
                    marginBottom: 2, 
                    boxShadow: 2,
                    opacity: isPostDeleted ? 0.8 : 1,
                    border: isPostDeleted ? '1px dashed #ccc' : 'none'
                }}
            >
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                            <Typography variant="h6" component="div" gutterBottom>
                                {claimantName}
                                {isPostDeleted && (
                                    <Chip 
                                        label="Post Deleted" 
                                        size="small" 
                                        color="default" 
                                        variant="outlined"
                                        sx={{ ml: 1 }}
                                    />
                                )}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {email}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Claimed on: {formatDate(claimedAt)}
                            </Typography>
                            
                            <Chip 
                                label={status.charAt(0).toUpperCase() + status.slice(1)} 
                                color={getStatusColor(status) as any}
                                size="small"
                            />
                        </Box>
                        
                        <IconButton
                            color="error"
                            onClick={handleDeleteClick}
                            aria-label="delete claim"
                            disabled={isDeleting}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </CardContent>
            </Card>

            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Delete Claim</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this claim? This action cannot be undone.
                        {isPostDeleted && (
                            <>
                                <br /><br />
                                <strong>Note:</strong> The original post has been deleted, but you can still remove your claim.
                            </>
                        )}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleDeleteCancel}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}