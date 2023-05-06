import React from "react";

interface RoleHeaderProps {
    role: string;
    markedSize: number;
    size: number;
    percentage: number;
}

const RoleHeader: React.FC<RoleHeaderProps> = ({ role, markedSize, size, percentage }) => {
    return (
        <div className="text-md flex flex-row justify-center gap-8 align-bottom">
            <h4 className="my-auto p-2">
                {markedSize} / {size}
                {markedSize !== size ? "*" : ""}
            </h4>
            <div className="mb-2 bg-gradient-to-r from-green-600 via-sky-600 to-purple-600 pb-[3px]">
                <div className="flex h-full flex-col justify-between bg-black text-gray-200">
                    <h4 className="text-xl font-bold">{role}</h4>
                </div>
            </div>
            <h4 className="my-auto p-2">{percentage.toFixed(1)}%</h4>
        </div>
    );
};

export default RoleHeader;
