"use client";

import { useEffect, useState } from "react";
import PostCard, { Post } from "@/components/post/postCard";
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    Stack,
    TextField,
    Checkbox,
    FormControlLabel,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
} from "@mui/material";

export default function PaginatedPosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; postId: string }>({
        open: false,
        postId: ""
    });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: "",
        severity: 'success'
    });

    const [filters, setFilters] = useState({
        type: "",
        category: "",
        keyword: "",
        startDate: "",
        endDate: "",
        onlyMine: false,
    });

    const isValidPost = (post: any): post is Post => {
        return (
            post &&
            typeof post === 'object' &&
            post._id &&
            typeof post._id === 'string' &&
            post.user_id &&
            typeof post.user_id === 'object' &&
            post.user_id._id &&
            typeof post.user_id._id === 'string' &&
            post.type &&
            post.description &&
            post.location &&
            post.date
        );
    };
    const isValidCategory = (category: any): category is { _id: string; name: string } => {
        return (
            category &&
            typeof category === 'object' &&
            category._id &&
            typeof category._id === 'string' &&
            category.name &&
            typeof category.name === 'string'
        );
    };

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch("/api/me"); 
            if (res.ok) {
                const userData = await res.json();
                console.log('Current user data:', userData);
                
                const userId = userData?.user?.id || userData?.user?._id || userData?._id || "";
                setCurrentUserId(userId);
            } else {
                console.warn('Failed to fetch current user:', res.status);
                setCurrentUserId("");
            }
        } catch(error) {
            console.error('Error fetching current user:', error);
            setCurrentUserId("");
        }
    };

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
            });

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== "" && value !== false) {
                    queryParams.append(key, value.toString());
                }
            });

            console.log('Fetching with params:', queryParams.toString());

            const res = await fetch(`/api/get-all-posts?${queryParams.toString()}`);
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('Raw API response:', data);
            
            const rawPosts = Array.isArray(data.posts) ? data.posts : [];
            const validPosts = rawPosts.filter((post: any, index: number) => {
                const isValid = isValidPost(post);
                if (!isValid) {
                    console.warn(`Invalid post at index ${index}:`, post);
                }
                return isValid;
            });

            console.log(`Filtered ${validPosts.length} valid posts out of ${rawPosts.length} total`);
            
            setPosts(validPosts);
            setTotalPages(Math.max(1, data.totalPages || 1));
            
            if (validPosts.length === 0 && rawPosts.length > 0) {
                showSnackbar('Some posts could not be displayed due to data issues', 'error');
            }
            
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
            setTotalPages(1);
            showSnackbar('Error fetching posts. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('Raw categories response:', data);
            
            const rawCategories = Array.isArray(data.categories) ? data.categories : [];
            const validCategories = rawCategories.filter((category: any, index: number) => {
                const isValid = isValidCategory(category);
                if (!isValid) {
                    console.warn(`Invalid category at index ${index}:`, category);
                }
                return isValid;
            });

            console.log(`Filtered ${validCategories.length} valid categories out of ${rawCategories.length} total`);
            setCategories(validCategories);
            
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
            showSnackbar('Error fetching categories', 'error');
        }
    };

    const handleClaim = async (postId: string) => {
        if (!postId || typeof postId !== 'string') {
            showSnackbar('Invalid post ID', 'error');
            return;
        }

        try {
            const res = await fetch(`/api/posts/${postId}/claims`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (res.ok){
                const contentType = res.headers.get('content-type');
                let responseData = null;
                
                if (contentType && contentType.includes('application/json')) {
                    const text = await res.text();
                    if (text) {
                        try {
                            responseData = JSON.parse(text);
                        } catch (parseError) {
                            console.warn('Could not parse claim response:', parseError);
                        }
                    }
                }
                showSnackbar('Post claimed successfully', 'success');
                fetchPosts();
            } else {
                let errorMessage = 'Failed to claim post';
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
                
                showSnackbar(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error claiming post:', error);
            showSnackbar('Network error while claiming post', 'error');
        }
    };

    const handleDeleteConfirm = (postId: string) => {
        if (!postId || typeof postId !== 'string') {
            showSnackbar('Invalid post ID', 'error');
            return;
        }
        setDeleteDialog({ open: true, postId });
    };

    const handleDelete = async () => {
        const { postId } = deleteDialog;
        
        if (!postId) {
            showSnackbar('Invalid post ID', 'error');
            return;
        }

        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                showSnackbar('Post deleted successfully', 'success');
                setPosts(prevPosts => 
                    prevPosts.filter(post => 
                        post && post._id && post._id !== postId
                    )
                );
                setDeleteDialog({ open: false, postId: "" });
            } else {
                let errorMessage = 'Failed to delete post';
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
                
                showSnackbar(errorMessage, 'error');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            showSnackbar('Network error while deleting post', 'error');
        }
    };

    const handleShare = async (post: Post) => {
        if (!post || !post._id) {
            showSnackbar('Invalid post data', 'error');
            return;
        }

        try {
            const shareData = {
                title: `${post.type?.charAt(0).toUpperCase() + post.type?.slice(1) || 'Item'}`,
                text: post.description || 'Check out this item',
                url: `${window.location.origin}/post/${post._id}`,
            };

            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                const shareText = `${shareData.text} - ${shareData.url}`;
                await navigator.clipboard.writeText(shareText);
                showSnackbar('Link copied to clipboard', 'success');
            }
        } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "name" in error && (error as any).name !== 'AbortError') { 
                console.error('Error sharing post:', error);
                showSnackbar('Error sharing post', 'error');
            }
        }
    };

    const handleEdit = (post: Post) => {
        if (!post || !post._id) {
            showSnackbar('Invalid post data', 'error');
            return;
        }
        console.log('Edit post:', post);
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    useEffect(() => {
        fetchCategories();
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [page, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
        const { name, value, checked, type } = e.target;
        
        console.log('Filter change:', { name, value, checked, type });
        
        setFilters((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        
        setPage(1);
    };

    const resetFilters = () => {
        setFilters({
            type: "",
            category: "",
            keyword: "",
            startDate: "",
            endDate: "",
            onlyMine: false,
        });
        setPage(1);
    };

    const validPostsForRender = posts.filter(post => isValidPost(post));

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, px: 2 }}>
            <Stack direction="column" spacing={2} mb={4}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select 
                            name="type" 
                            value={filters.type} 
                            onChange={handleFilterChange} 
                            label="Type"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="FOUND">Found</MenuItem>
                            <MenuItem value="LOST">Lost</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select 
                            name="category" 
                            value={filters.category} 
                            onChange={handleFilterChange} 
                            label="Category"
                        >
                            <MenuItem value="">All</MenuItem>
                            {categories
                                .filter(cat => isValidCategory(cat))
                                .map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField 
                        name="startDate" 
                        label="Start Date" 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        size="small" 
                        fullWidth 
                        value={filters.startDate} 
                        onChange={handleFilterChange} 
                    />
                    <TextField 
                        name="endDate" 
                        label="End Date" 
                        type="date" 
                        InputLabelProps={{ shrink: true }} 
                        size="small" 
                        fullWidth 
                        value={filters.endDate} 
                        onChange={handleFilterChange} 
                    />
                </Stack>

                <TextField 
                    name="keyword" 
                    label="Search by keyword" 
                    size="small" 
                    value={filters.keyword} 
                    onChange={handleFilterChange} 
                    fullWidth 
                />

                <FormControlLabel 
                    control={
                        <Checkbox 
                            checked={filters.onlyMine} 
                            name="onlyMine" 
                            onChange={handleFilterChange} 
                        />
                    } 
                    label="Only My Posts" 
                />

                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" onClick={resetFilters}>
                        Reset
                    </Button>
                    <Button variant="contained" onClick={fetchPosts}>
                        Refresh
                    </Button>
                </Stack>
            </Stack>

            {loading ? (
                <Box textAlign="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : validPostsForRender.length === 0 ? (
                <Typography variant="body1" align="center" mt={4}>
                    No posts found.
                </Typography>
            ) : (
                validPostsForRender.map((post) => (
                    <PostCard 
                        key={post._id} 
                        post={post}
                        currentUserId={currentUserId}
                        onClaim={handleClaim}
                        onDelete={handleDeleteConfirm}
                        onShare={handleShare}
                        onEdit={handleEdit}
                    />
                ))
            )}

            {totalPages > 1 && (
                <Box mt={4} display="flex" justifyContent="center">
                    <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={(_, value) => setPage(value)} 
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            {totalPages > 0 && (
                <Box mt={2} textAlign="center">
                    <Typography variant="caption" color="text.secondary">
                        Page {page} of {totalPages} • Showing {validPostsForRender.length} posts
                    </Typography>
                </Box>
            )}

            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, postId: "" })}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this post? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setDeleteDialog({ open: false, postId: "" })}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDelete} 
                        color="error" 
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar> */}
        </Box>
    );
}