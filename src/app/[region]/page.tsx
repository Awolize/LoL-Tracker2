"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RedirectComponent = () => {
    const router = useRouter();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.push("/");
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [router]);

    return (
        <div className="flex w-screen h-screen items-center justify-center bg-black">
            <p className="text-white">How did you end up here? Oh well, off you go!</p>
        </div>
    );
};

export default RedirectComponent;
