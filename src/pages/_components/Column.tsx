import React from "react";

type Props = {
    children: React.ReactNode;
    className?: React.ComponentProps<"div">["className"];
};

export default function Column({ children, className = "" }: Props) {
    return <div className={`flex flex-col ${className}`}>{children}</div>;
}