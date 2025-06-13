"use client";

import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Chip,
    Box,
    Avatar,
    IconButton,
    Button,
    Divider,
    Stack,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import {
    LocationOn,
    CalendarToday,
    MoreVert,
    Share,
    Bookmark,
    Edit,
    Delete,
    PendingActions,
} from "@mui/icons-material";
import { PostStatus, PostType } from "@/models/Posts";
import { useState, useEffect } from "react";
import ClaimModal from "../claims/ClaimModal";
import { useRouter } from 'next/navigation';

export interface Post {
    _id: string;
    type: PostType;
    description: string;
    location: string;
    date: string;
    status: PostStatus;
    category_id?: {
        _id: string;
        name: string;
    };
    customCategory?: string;
    user_id: {
        _id: string;
        username: string;
        avatar?: string;
        email?: string;
    };
    claimed_by?: {
        _id: string;
        username: string;
    };
    media?: {
        postImageUrl: string;
    };
    createdAt: string;
    updatedAt?: string;
}

interface PostCardProps {
    post: Post;
    onClaim?: (postId: string) => void;
    onDelete?: (postId: string) => void;
    onShare?: (post: Post) => void;
    onBookmark?: (post: Post) => void;
    onEdit?: (post: Post) => void;
    currentUserId?: string;
}

export default function PostCard({
    post,
    onClaim,
    onDelete,
    onShare,
    onBookmark,
    onEdit,
    currentUserId,
}: PostCardProps) {
    if (!post || !post._id || !post.user_id || !post.user_id._id) {
        console.warn('Invalid post data received:', post);
        return null;
    }

    const router = useRouter();

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [claimOpen, setClaimOpen] = useState(false);
    const [userHasClaimed, setUserHasClaimed] = useState(false);
    const [claimsCount, setClaimsCount] = useState(0);
    const [localPostStatus, setLocalPostStatus] = useState(post.status);

    const menuOpen = Boolean(menuAnchor);

    const isOwner = currentUserId === post.user_id?._id;
    const isClaimed = localPostStatus === PostStatus.CLAIMED;
    const isClaimInProgress = localPostStatus === PostStatus.CLAIM_IN_PROGRESS;
    const category = post.category_id?.name || post.customCategory || "Other";
    
    const username = post.user_id?.username || 'Unknown User';
    const userAvatar = post.user_id?.avatar || '';

    useEffect(() => {
        const checkUserClaim = async () => {
            if (!currentUserId || isOwner || isClaimed || !post._id) return;

            try {
                const response = await fetch(`/api/claim/${post._id}/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUserId })
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserHasClaimed(prev => prev !== data.hasClaimed ? data.hasClaimed : prev);
                    setClaimsCount(prev => prev !== data.totalClaims ? data.totalClaims : prev);

                    if (data.totalClaims > 0 && localPostStatus === PostStatus.UNCLAIMED) {
                        setLocalPostStatus(PostStatus.CLAIM_IN_PROGRESS);
                    }
                } else {
                    console.error('Failed to check claim:', response.status);
                }
            } catch (error) {
                console.error('Error checking user claim:', error);
            }
        };

        checkUserClaim();
    }, [currentUserId, post._id, isOwner, isClaimed, localPostStatus]);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        onEdit?.(post);
    };

    const handleMenuDelete = () => {
        handleMenuClose();
        onDelete?.(post._id);
    };

    const handleMenuShare = () => {
        handleMenuClose();
        onShare?.(post);
    };

    const handleMenuBookmark = () => {
        handleMenuClose();
        onBookmark?.(post);
    };

    const handleClaimSuccess = () => {
        setUserHasClaimed(true);
        setLocalPostStatus(PostStatus.CLAIM_IN_PROGRESS);
        setClaimsCount(prev => prev + 1);
        setClaimOpen(false);

        onClaim?.(post._id);
    };

    const handleViewClaims = () => {
        handleMenuClose();
        router.push(`/posts/${post._id}/claims`);
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getTypeColor = (): "success" | "error" =>
        post.type === PostType.FOUND ? "success" : "error";

    const getStatusColor = (): "success" | "info" | "warning" | "default" => {
        if (isClaimed) return "success";
        if (isClaimInProgress) return "warning";
        return post.type === PostType.FOUND ? "info" : "warning";
    };

    const getStatusText = () => {
        if (isClaimed && post.type === PostType.LOST) {
            return `Back with owner`;
        } else if (isClaimed && post.type === PostType.FOUND) {
            return `Claimed by ${post.claimed_by?.username || "someone"}`;
        }
        if (isClaimInProgress) {
            return claimsCount > 0 ? `${claimsCount} claim${claimsCount > 1 ? 's' : ''} pending` : "Claim in Progress";
        }
        return "Unclaimed";
    };

    const displayType =
        post.type?.charAt(0).toUpperCase() + post.type?.slice(1).toLowerCase() || 'Unknown';

    const canClaim = !isOwner && !isClaimed && !userHasClaimed;

    const getClaimButtonText = () => {
        if (post.type === PostType.LOST) {
            return "I Found It";
        } else {
            return "Claim";
        }
    };

    const getUserClaimChipText = () => {
        return post.type === PostType.LOST ? "Message Sent" : "Claim Sent";
    };

    return (
        <>
            <Card
                sx={{
                    maxWidth: "100%",
                    mb: 2,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                        transform: "translateY(-2px)",
                    },
                }}
            >
                <Box sx={{ p: 2, pb: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                                src={userAvatar}
                                sx={{ width: 40, height: 40 }}
                            >
                                {username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    {username}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {formatDate(post.createdAt || post.date || '')}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                                label={displayType}
                                color={getTypeColor()}
                                size="small"
                                sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                            />
                            <IconButton
                                size="small"
                                onClick={handleMenuClick}
                                aria-controls={menuOpen ? "post-menu" : undefined}
                                aria-haspopup="true"
                                aria-expanded={menuOpen ? "true" : undefined}
                            >
                                <MoreVert />
                            </IconButton>

                            <Menu
                                id="post-menu"
                                anchorEl={menuAnchor}
                                open={menuOpen}
                                onClose={handleMenuClose}
                                transformOrigin={{ horizontal: "right", vertical: "top" }}
                                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                            >
                                {isOwner && (isClaimInProgress || claimsCount > 0) && (
                                    <MenuItem onClick={handleViewClaims}>
                                        <ListItemIcon>
                                            <PendingActions fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>
                                            View Claims {claimsCount > 0 && `(${claimsCount})`}
                                        </ListItemText>
                                    </MenuItem>
                                )}

                                <MenuItem onClick={handleMenuShare}>
                                    <ListItemIcon>
                                        <Share fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Share</ListItemText>
                                </MenuItem>

                                {isOwner && (
                                    <MenuItem
                                        onClick={handleMenuDelete}
                                        sx={{ color: "error.main" }}
                                    >
                                        <ListItemIcon>
                                            <Delete fontSize="small" color="error" />
                                        </ListItemIcon>
                                        <ListItemText>Delete Post</ListItemText>
                                    </MenuItem>
                                )}
                            </Menu>
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                        <Chip
                            label={getStatusText()}
                            color={getStatusColor()}
                            variant={isClaimed || isClaimInProgress ? "filled" : "outlined"}
                            size="small"
                        />
                        <Chip
                            label={category}
                            variant="outlined"
                            size="small"
                        />

                        {userHasClaimed && (
                            <Chip
                                label={getUserClaimChipText()}
                                color="info"
                                variant="filled"
                                size="small"
                                sx={{ fontWeight: "bold" }}
                            />
                        )}
                    </Stack>
                </Box>

                {post.media?.postImageUrl && (
                    <CardMedia
                        component="img"
                        height="180"
                        image={post.media.postImageUrl}
                        alt={`${post.type || 'unknown'} item`}
                        sx={{
                            objectFit: "cover",
                            borderRadius: 1,
                            mx: 2,
                            mb: 1,
                        }}
                    />
                )}

                <CardContent sx={{ pt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {post.description || 'No description available'}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 3, mb: 2, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <LocationOn color="action" fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                                {post.location || 'Location not specified'}
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <CalendarToday color="action" fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                                {formatDate(post.date || '')}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                        }}
                    >
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            {canClaim && (
                                <Button
                                    variant="contained"
                                    size="medium"
                                    onClick={() => setClaimOpen(true)}
                                    sx={{ minWidth: 120 }}
                                >
                                    {getClaimButtonText()}
                                </Button>
                            )}

                            {isOwner && isClaimInProgress && claimsCount > 0 && (
                                <Chip
                                    label={`${claimsCount} pending claim${claimsCount > 1 ? 's' : ''}`}
                                    color="warning"
                                    variant="filled"
                                    size="small"
                                    sx={{ fontWeight: "bold" }}
                                />
                            )}

                            {userHasClaimed && !isOwner && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontStyle: 'italic' }}
                                >
                                    {post.type === PostType.LOST ? "Your message has been sent" : "Your claim has been sent"}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <ClaimModal
                open={claimOpen}
                onClose={() => setClaimOpen(false)}
                postid={post._id}
                postType={post.type}
                postedBy={username}
                onClaimSuccess={handleClaimSuccess}
            />
        </>
    );
}