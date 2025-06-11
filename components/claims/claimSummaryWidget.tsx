'use client';

import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Button,
    Stack,
    IconButton,
    Badge
} from '@mui/material';
import {
    Visibility,
    NotificationImportant
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ClaimsStats = {
    total: number;
    pending: number;
    approved: number;
    denied: number;
};

type ClaimsSummaryWidgetProps = {
    postId: string;
    postTitle: string;
    compact?: boolean;
};

export default function ClaimsSummaryWidget({
    postId,
    postTitle,
    compact = false
}: ClaimsSummaryWidgetProps) {
    const router = useRouter();
    const [stats, setStats] = useState<ClaimsStats>({ total: 0, pending: 0, approved: 0, denied: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClaimsStats = async () => {
            try {
                const res = await fetch(`/api/post/${postId}/claims`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                }
            } catch (error) {
                console.error('Error fetching claims stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClaimsStats();
    }, [postId]);

    const handleViewClaims = () => {
        router.push(`/post/${postId}/claims`);
    };

    if (loading) {
        return null; 
    }

    if (stats.total === 0) {
        return null; 
    }

    if (compact) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge badgeContent={stats.pending} color="warning">
                    <IconButton
                        size="small"
                        onClick={handleViewClaims}
                        sx={{ color: stats.pending > 0 ? 'warning.main' : 'text.secondary' }}
                    >
                        <NotificationImportant />
                    </IconButton>
                </Badge>
                <Typography variant="caption" color="text.secondary">
                    {stats.total} claim{stats.total !== 1 ? 's' : ''}
                </Typography>
            </Box>
        );
    }

    return (
        <Card 
            sx={{ 
                mb: 2,
                border: stats.pending > 0 ? 2 : 1,
                borderColor: stats.pending > 0 ? 'warning.main' : 'divider',
                bgcolor: stats.pending > 0 ? 'warning.50' : 'background.paper'
            }}
        >
            <CardContent sx={{ pb: '16px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Claims for this post
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                            {postTitle}
                        </Typography>
                    </Box>
                    
                    {stats.pending > 0 && (
                        <Chip
                            label="Action Required"
                            color="warning"
                            size="small"
                            icon={<NotificationImportant sx={{ fontSize: 16 }} />}
                        />
                    )}
                </Box>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            {stats.total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Total
                        </Typography>
                    </Box>
                    
                    {stats.pending > 0 && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                {stats.pending}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Pending
                            </Typography>
                        </Box>
                    )}
                    
                    {stats.approved > 0 && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                {stats.approved}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Approved
                            </Typography>
                        </Box>
                    )}
                    
                    {stats.denied > 0 && (
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                {stats.denied}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Denied
                            </Typography>
                        </Box>
                    )}
                </Stack>

                <Button
                    variant={stats.pending > 0 ? 'contained' : 'outlined'}
                    color={stats.pending > 0 ? 'warning' : 'primary'}
                    fullWidth
                    startIcon={<Visibility />}
                    onClick={handleViewClaims}
                    size="small"
                >
                    View & Manage Claims
                </Button>
            </CardContent>
        </Card>
    );
}