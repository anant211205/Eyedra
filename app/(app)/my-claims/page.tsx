'use client';

import { useEffect, useState } from 'react';
import ClaimCard from '@/components/claims/claimCard';
import { Typography, Container, CircularProgress, Alert, Snackbar } from '@mui/material';
import { PostType } from '@/models/Posts';
import { ClaimStatus } from '@/models/Claim';

type MyClaim = {
    _id: string;
    post_id: {
        _id: string;
        type: PostType;
        description: string;
        location: string;
        date: string;
        status: string;
        user_id: {
            username: string;
        };
    } | null; // Allow null for deleted posts
    createdAt: string;
    status: ClaimStatus;
    message: string;
    claim_type?: string;
};

export default function MyClaimsPage() {
    const [claims, setClaims] = useState<MyClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMyClaims() {
            try {
                setError(null);
                const res = await fetch('/api/myClaims');
                
                if (!res.ok) {
                    if (res.status === 401) {
                        throw new Error('Please log in to view your claims');
                    }
                    throw new Error(`Failed to fetch claims: ${res.status}`);
                }
                
                const data = await res.json();
                setClaims(data.claims || []);
            } catch (err) {
                console.error('Error fetching claims:', err);
                setError(err instanceof Error ? err.message : 'Failed to load claims');
                setClaims([]);
            } finally {
                setLoading(false);
            }
        }
        fetchMyClaims();
    }, []);

    // Helper function to generate a title from post data
    const generatePostTitle = (post: MyClaim['post_id']) => {
        // Handle deleted posts
        if (!post) {
            return 'Deleted Post';
        }
        
        const typeText = post.type === PostType.LOST ? 'Lost' : 'Found';
        const description = post.description || 'Item';
        const preview = description.length > 50 ? description.substring(0, 50) + '...' : description;
        return `${typeText}: ${preview}`;
    };

    // Helper function to format additional info
    const formatAdditionalInfo = (post: MyClaim['post_id']) => {
        // Handle deleted posts
        if (!post) {
            return 'Post was deleted - You can still delete this claim';
        }
        
        const location = post.location ? `Location: ${post.location}` : '';
        const date = post.date ? `Date: ${new Date(post.date).toLocaleDateString()}` : '';
        const owner = post.user_id?.username ? `Posted by: ${post.user_id.username}` : '';
        
        return [location, date, owner].filter(Boolean).join(' • ');
    };

    // Handle claim deletion with proper error handling
    const handleClaimDelete = async (claimid: string) => {
        try {
            setDeleteError(null);
            
            // Make the actual DELETE request
            const res = await fetch(`/api/myClaims/${claimid}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                // Remove from local state only after successful deletion
                setClaims(prevClaims => prevClaims.filter(claim => claim._id !== claimid));
                setDeleteSuccess(true);
            } else {
                // Handle error response
                let errorMessage = 'Failed to delete claim';
                
                try {
                    const contentType = res.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const text = await res.text();
                        if (text) {
                            const error = JSON.parse(text);
                            errorMessage = error.message || errorMessage;
                        }
                    }
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                }
                
                setDeleteError(errorMessage);
            }
        } catch (error) {
            console.error('Error deleting claim:', error);
            setDeleteError('Network error occurred while deleting claim');
        }
    };

    // Handle snackbar close
    const handleSnackbarClose = () => {
        setDeleteSuccess(false);
    };

    const handleErrorClose = () => {
        setDeleteError(null);
    };

    return (
        <>
            <Container>
                <Typography 
                    sx={{ 
                        fontWeight: 'bold', 
                        textAlign: 'center', 
                        marginTop: 4, 
                        marginBottom: 2 
                    }} 
                    variant="h4" 
                    gutterBottom
                >
                    Claims You Made
                </Typography>
                
                {loading ? (
                    <CircularProgress 
                        sx={{ display: 'block', margin: 'auto', marginTop: 4 }}
                    />
                ) : error ? (
                    <Alert severity="error" sx={{ marginTop: 4 }}>
                        {error}
                    </Alert>
                ) : claims.length === 0 ? (
                    <Typography
                        sx={{ textAlign: 'center', marginTop: 4 }}
                    >
                        You haven't made any claims yet.
                    </Typography>
                ) : (
                    claims.map(claim => (
                        <ClaimCard
                            key={claim._id}
                            claimId={claim._id}
                            claimantName={generatePostTitle(claim.post_id)}
                            email={formatAdditionalInfo(claim.post_id)}
                            claimedAt={claim.createdAt}
                            status={claim.status.toLowerCase() as 'pending' | 'approved' | 'denied'}
                            onDelete={handleClaimDelete}
                            // Add a prop to indicate if post is deleted (you may need to add this to ClaimCard)
                            isPostDeleted={claim.post_id === null}
                        />
                    ))
                )}
            </Container>

            {/* Success Snackbar */}
            <Snackbar
                open={deleteSuccess}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity="success" 
                    sx={{ width: '100%' }}
                >
                    Claim deleted successfully!
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={!!deleteError}
                autoHideDuration={6000}
                onClose={handleErrorClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleErrorClose} 
                    severity="error" 
                    sx={{ width: '100%' }}
                >
                    {deleteError}
                </Alert>
            </Snackbar>
        </>
    );
}