'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Paper,
    Chip,
    Tabs,
    Tab,
    Button,
    Stack
} from '@mui/material';
import {
    PendingActions,
    CheckCircle,
    Cancel,
    ArrowBack
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import ClaimManagementCard from '../claims/claimManagementCard';
import { ClaimStatus, ClaimType } from '@/models/Claim';

type ClaimData = {
    _id: string;
    claimant_id: {
        _id: string;
        username: string;
        email: string;
        profile_picture?: string;
        phone?: string;
        createdAt: string;
    };
    finder_id?: {
        _id: string;
        username: string;
        email: string;
        profile_picture?: string;
        phone?: string;
    };
    post_id: string;
    status: ClaimStatus;
    claim_type: ClaimType;
    message: string;
    evidence_photos?: string[];
    created_at: string;
    updated_at: string;
};

type ClaimsStats = {
    total: number;
    pending: number;
    approved: number;
    denied: number;
};

type PostInfo = {
    id: string;
    title: string;
    type: string;
    status: string;
};

type ClaimsResponse = {
    success: boolean;
    claims: ClaimData[];
    stats: ClaimsStats;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalClaims: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    post: PostInfo;
};

export default function PostClaimsPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params?.postid as string;

    const [claims, setClaims] = useState<ClaimData[]>([]);
    const [stats, setStats] = useState<ClaimsStats>({ total: 0, pending: 0, approved: 0, denied: 0 });
    const [postInfo, setPostInfo] = useState<PostInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchClaims = async (status?: string) => {
    try {
        setLoading(true);
        setError(null);
        
        const queryParams = new URLSearchParams();
        if (status) queryParams.append('status', status);
        
        const queryString = queryParams.toString();
        const url = `/api/posts/${postId}/claims${queryString ? `?${queryString}` : ''}`;
        
        console.log('Fetching claims from URL:', url); 
        console.log('Post ID:', postId); 
        
        const res = await fetch(url);
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('API Error Response:', errorText);
            
            if (res.status === 401) {
                throw new Error('Please log in to view claims');
            }
            if (res.status === 403) {
                throw new Error('You can only view claims for your own posts');
            }
            if (res.status === 404) {
                throw new Error('Post not found');
            }
            if (res.status === 400) {
                throw new Error('Invalid post ID - please check the URL');
            }
            throw new Error(`Failed to fetch claims: ${res.status} - ${errorText}`);
        }
        
        const data: ClaimsResponse = await res.json();
        setClaims(data.claims);
        setStats(data.stats);
        setPostInfo(data.post);
    } catch (err) {
        console.error('Error fetching claims:', err);
        setError(err instanceof Error ? err.message : 'Failed to load claims');
    } finally {
        setLoading(false);
    }
};

const isValidObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

    useEffect(() => {
        if (postId) {
            console.log('Post ID from params:', postId);
            
            if (!isValidObjectId(postId)) {
                setError('Invalid post ID format');
                setLoading(false);
                return;
            }
            
            fetchClaims();
        } else {
            setError('No post ID provided');
            setLoading(false);
        }
    }, [postId]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        const statusMap = ['', 'pending', 'approved', 'denied'];
        fetchClaims(statusMap[newValue]);
    };

    const handleClaimAction = async (claimId: string, action: 'approve' | 'deny' | 'delete') => {
        try {
            setActionLoading(claimId);
            
            const endpoint = action === 'delete' 
                ? `/api/claims/${claimId}`
                : `/api/claims/${claimId}/${action}`;
            
            const method = action === 'delete' ? 'DELETE' : 'POST';
            
            const res = await fetch(endpoint, { method });
            
            if (!res.ok) {
                throw new Error(`Failed to ${action} claim`);
            }
            const statusMap = ['', 'pending', 'approved', 'denied'];
            await fetchClaims(statusMap[activeTab]);
            
        } catch (err) {
            console.error(`Error ${action}ing claim:`, err);
            setError(err instanceof Error ? err.message : `Failed to ${action} claim`);
        } finally {
            setActionLoading(null);
        }
    };

    const getTabIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <PendingActions />;
            case 'approved':
                return <CheckCircle />;
            case 'denied':
                return <Cancel />;
            default:
                return <></>;
        }
    };

    if (loading && !claims.length) {
        return (
            <Container>
                <CircularProgress 
                    sx={{ display: 'block', margin: 'auto', marginTop: 4 }}
                />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => router.back()}
                    sx={{ mb: 2 }}
                >
                    Back to Post
                </Button>
                
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Claims Management
                </Typography>
                
                {postInfo && (
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        {postInfo.title}
                    </Typography>
                )}
            </Box>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Claims Overview
                </Typography>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 3,
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ 
                        flex: { xs: '1 1 45%', sm: '1 1 20%' }, 
                        textAlign: 'center',
                        minWidth: '120px'
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            {stats.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Claims
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        flex: { xs: '1 1 45%', sm: '1 1 20%' }, 
                        textAlign: 'center',
                        minWidth: '120px'
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                            {stats.pending}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Pending
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        flex: { xs: '1 1 45%', sm: '1 1 20%' }, 
                        textAlign: 'center',
                        minWidth: '120px'
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            {stats.approved}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Approved
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        flex: { xs: '1 1 45%', sm: '1 1 20%' }, 
                        textAlign: 'center',
                        minWidth: '120px'
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                            {stats.denied}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Denied
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {/* Filter Tabs */}
            <Paper sx={{ mb: 4 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab 
                        label={`All Claims (${stats.total})`} 
                    />
                    <Tab 
                        icon={getTabIcon('pending')}
                        label={`Pending (${stats.pending})`}
                        iconPosition="start"
                    />
                    <Tab 
                        icon={getTabIcon('approved')}
                        label={`Approved (${stats.approved})`}
                        iconPosition="start"
                    />
                    <Tab 
                        icon={getTabIcon('denied')}
                        label={`Denied (${stats.denied})`}
                        iconPosition="start"
                    />
                </Tabs>
            </Paper>

            {loading ? (
                <CircularProgress 
                    sx={{ display: 'block', margin: 'auto', marginTop: 4 }}
                />
            ) : claims.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No claims found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {activeTab === 0 
                            ? "No one has made a claim for this post yet."
                            : `No ${['', 'pending', 'approved', 'denied'][activeTab]} claims found.`
                        }
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={3}>
                    {claims.map((claim) => (
                        <ClaimManagementCard
                            key={claim._id}
                            claim={claim}
                            onApprove={() => handleClaimAction(claim._id, 'approve')}
                            onDeny={() => handleClaimAction(claim._id, 'deny')}
                            // onDelete={() => handleClaimAction(claim._id, 'delete')}
                            isLoading={actionLoading === claim._id}
                        />
                    ))}
                </Stack>
            )}
        </Container>
    );
}