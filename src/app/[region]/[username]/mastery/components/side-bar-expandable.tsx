import { useState } from "react";

export function SideBarExpandable({ children, alignment }: { children: React.ReactNode; alignment: "right" | "left" }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const containerStyleToggle = drawerOpen ? `${alignment}-0` : `-${alignment}-[1100px]`;
    const containerStyle = `fixed flex flex-col bg-zinc-950 py-2 z-20 duration-300 w-[1100px] ${containerStyleToggle}`;

    const buttonStyleToggle = drawerOpen
        ? "absolute left-1/2"
        : `absolute flex flex-1 w-fit ${alignment === "right" ? "-left" : "-right"}-44 z-30`;
    const buttonStyle = `bg-zinc-900 whitespace-nowrap text-white rounded border-black cursor-pointer mt-5 py-2 px-4 z-30 ${buttonStyleToggle}`;

    return (
        <div className={containerStyle}>
            <div className="relative flex flex-1">
                <button type="button" onClick={() => setDrawerOpen(!drawerOpen)} className={buttonStyle}>
                    Match History
                </button>
            </div>

            <div className="px-4 mt-20 overflow-y-auto">{children}</div>
        </div>
    );
}

export default SideBarExpandable;
