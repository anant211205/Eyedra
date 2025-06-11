"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import CreatePostModal from "../post/createPostForm";
import { useState } from "react";

const StyledFab = styled(Fab)(({ theme }) => ({
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: "50px",
    height: 56,
    paddingLeft: 16,
    paddingRight: 16,
}));

export default function FloatingActionButtons(){
    const [hover, setHover] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    return (
        <>
            <Box sx={{ position: "fixed", bottom: 60, right: 60, zIndex: 1000 }}>
                <StyledFab
                    color="primary"
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    onClick={() => setOpenModal(true)}
                    sx={{
                        width: hover ? "138px" : "56px",
                        justifyContent: hover ? "flex-start" : "center",
                    }}
                >
                    <AddIcon sx={{ mr: hover ? 1 : 0 }} />
                    {hover && (
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            Add Item
                        </Typography>
                    )}
                </StyledFab>
            </Box>

            <CreatePostModal open={openModal} onClose={() => setOpenModal(false)} />
        </>
    );
}
