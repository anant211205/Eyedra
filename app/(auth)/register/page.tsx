"use client";
// import dynamic from 'next/dynamic'

// const SignupForm = dynamic(() => import('@/components/auth/register'), {
//     ssr: false
// });
import SignupForm from "@/components/auth/register";

export default function RegisterPage() {
    return (
        <div className="flex items-center justify-center h-screen">
            <SignupForm />
        </div>
    );
}