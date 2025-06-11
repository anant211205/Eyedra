"use client";

import React, { useEffect ,useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Box,
    IconButton,
    Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SelectChangeEvent } from "@mui/material/Select";

type Props = {
    open: boolean;
    onClose: () => void;
};

type Category = {
    _id: string;
    name: string;
};

export default function CreatePostModal({ open, onClose }: Props) {
    const [formData, setFormData] = useState({
        type: "",
        category: "",
        customCategory: "",
        location: "",
        date: "",
        description: "",
        postPhoto: null as File | null,
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [descriptionError, setDescriptionError] = useState<string>('');

    const handleClose = () => {
        setFormData({
            type: "",
            category: "",
            customCategory: "",
            location: "",
            date: "",
            description: "",
            postPhoto: null,
        });
        setPreviewUrl(null);
        setMessage(null);
        setIsSubmitting(false);
        setDescriptionError('');
        onClose();
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try{
                const res = await fetch("api/categories");
                const json = await res.json();
                setCategories(json.categories || []);
            }catch(err){
                console.error("Failed to load categories", err);
            }
        };
        fetchCategories();
    }, []);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        
        if(name === 'description'){
            const length = value.trim().length;
            if(length === 0){
                setDescriptionError('');
            }else if(length < 20){
                setDescriptionError(`Description must be at least 20 characters (${length}/20)`);
            }else if(length > 300){
                setDescriptionError(`Description must not exceed 300 characters (${length}/300)`);
            }else{
                setDescriptionError('');
            }
        }
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const name = e.target.name;
        const value = e.target.value;
        setFormData((prev) => ({ 
            ...prev, 
            [name]: value,
            ...(name === "category" && value !== "Others" && { customCategory: "" })
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if(file){
            setFormData((prev) => ({ ...prev, postPhoto: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removePreview = () => {
        setFormData((prev) => ({ ...prev, postPhoto: null }));
        setPreviewUrl(null);
    };

    const handleSubmit = async () => {
        const descLength = formData.description.trim().length;
        if(descLength < 20){
            setMessage({ type: 'error', text: 'Description must be at least 20 characters long' });
            return;
        }
        if(descLength > 300){
            setMessage({ type: 'error', text: 'Description must not exceed 300 characters' });
            return;
        }
        setIsSubmitting(true);
        setMessage(null);

        const data = new FormData();

        for (const key in formData) {
            const val = formData[key as keyof typeof formData];
            if(key === "category"){
                if(formData.category === "Others" && formData.customCategory){
                    data.append("category", formData.customCategory);
                }else if(formData.category !== "Others"){
                    data.append("category", val as string);
                }
                continue;
            }
            if(key === "customCategory"){
                continue;
            }
            if(val) data.append(key, val);
        }

        try {
            const res = await fetch("/api/create-post", {
                method: "POST",
                body: data,
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Post failed");
            
            setMessage({ type: 'success', text: 'Post created successfully!' });

            setTimeout(() => {
                handleClose();
            }, 1000);
            
        }catch(err: any){
            setMessage({ type: 'error', text: err.message || 'Something went wrong' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: "1.3rem",
                }}
            >
                New Post
                <IconButton onClick={handleClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 3 }}>
                {message && (
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 1,
                            backgroundColor: message.type === 'success' ? '#e8f5e8' : '#ffeaea',
                            color: message.type === 'success' ? '#2e7d32' : '#d32f2f',
                            border: `1px solid ${message.type === 'success' ? '#c8e6c9' : '#ffcdd2'}`,
                            mb: 1
                        }}
                    >
                        <Typography variant="body2" fontWeight={500}>
                            {message.text}
                        </Typography>
                    </Box>
                )}

                <FormControl size="small" fullWidth>
                    <InputLabel id="type-label">Type</InputLabel>
                    <Select
                        labelId="type-label"
                        id="type"
                        name="type"
                        value={formData.type}
                        label="Type"
                        onChange={handleSelectChange}
                    >
                        <MenuItem value="lost">Lost</MenuItem>
                        <MenuItem value="found">Found</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                        labelId="category-label"
                        id="category"
                        name="category"
                        value={formData.category}
                        label="Category"
                        onChange={handleSelectChange}
                    >
                        {categories.map((cat) => (
                            <MenuItem key={cat._id} value={cat.name}>
                                {cat.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {
                    formData.category === "Others" && (
                        <TextField
                            name="customCategory"
                            label="Custom Category"
                            value={formData.customCategory}
                            onChange={handleInputChange}
                            size="small"
                            fullWidth
                            placeholder="Enter your custom category"
                        />
                    )
                }

                <TextField
                    name="location"
                    label="Location"
                    value={formData.location}
                    onChange={handleInputChange}
                    size="small"
                    fullWidth
                />

                <TextField
                    name="date"
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    fullWidth
                />

                <TextField
                    name="description"
                    label="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    size="small"
                    fullWidth
                    error={!!descriptionError}
                    helperText={descriptionError || `${formData.description.trim().length}/300 characters`}
                    placeholder="Please provide at least 20 characters describing the item..."
                />

                <Box>
                    <Button variant="outlined" component="label" size="small">
                        Upload Photo
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </Button>

                    {previewUrl && (
                        <Box
                            mt={1}
                            sx={{
                                position: "relative",
                                border: "1px solid #ccc",
                                borderRadius: 2,
                                overflow: "hidden",
                                maxWidth: "100%",
                            }}
                        >
                            <IconButton
                                size="small"
                                onClick={removePreview}
                                sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    backgroundColor: "rgba(255,255,255,0.8)",
                                    zIndex: 2,
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <Box
                                component="img"
                                src={previewUrl}
                                alt="Preview"
                                sx={{ width: "100%", display: "block" }}
                            />
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    fullWidth
                    disabled={isSubmitting || !!descriptionError || formData.description.trim().length < 20}
                >
                    {isSubmitting ? 'Creating Post...' : 'Submit Post'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}