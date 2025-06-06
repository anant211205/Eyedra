"use client";
// import dynamic from 'next/dynamic'

// const SigninForm = dynamic(() => import('@/components/auth/signin'), {
//     ssr: false
// });
import SignInForm from "@/components/auth/signin";

export default function RegisterPage() {
    return (
        <div className="flex items-center justify-center h-screen">
            <SignInForm />
        </div>
    );
}