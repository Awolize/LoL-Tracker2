import React from "react";

type Props = { children: React.ReactNode; className: React.ComponentProps<"div">["className"] };

export default function Row({ children, className }: Props) {
    return <div className={`flex flex-row ${className}`}>{children}</div>;
}
