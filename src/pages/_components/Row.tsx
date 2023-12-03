import React from "react";

type Props = { children: React.ReactNode; className: string };

export default function Row({ children, className }: Props) {
    return <div className={"flex flex-row " + className}>{children}</div>;
}
