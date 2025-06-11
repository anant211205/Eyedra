"use client"

import React from "react";
import FloatingActionButtons from "@/components/feed/floatingAirButton";
import PaginatedPosts from "@/components/feed/filterAndPostFeed";


export default function DashboardPage() {
    return (
        <div>
            <PaginatedPosts/>
            <FloatingActionButtons/>
        </div>
    );
}
