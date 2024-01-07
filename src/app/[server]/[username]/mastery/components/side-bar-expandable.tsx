import { useState } from "react";

function SideBarExpandable({ children, alignment }: { children: React.ReactNode; alignment: "right" | "left" }) {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div
            className={`fixed bg-slate-900 h-screen z-20 duration-300 rounded-r-lg 
                        ${drawerOpen ? "px-10 min-w-fit w-1/3" : "px-0 w-0"}
                        ${alignment === "right" ? "right-0" : "left-0"}
                        `}
        >
            <button
                type="button"
                onClick={() => setDrawerOpen(!drawerOpen)}
                className={`bg-slate-900 whitespace-nowrap text-white rounded border-black cursor-pointer mt-5 " ${
                    drawerOpen ? "flex flex-1 mx-auto p-2 z-30" : "relative flex flex-1 right-44  p-2 z-30"
                }`}
            >
                Match History
            </button>

            <div className="my-10 h-screen overflow-y-auto">{children}</div>
        </div>
    );
}

export default SideBarExpandable;
