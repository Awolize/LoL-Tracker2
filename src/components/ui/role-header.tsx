import React from "react";

interface RoleHeaderProps {
    role: string;
    finishedSize: number;
    size: number;
    hasHidden: boolean;
    percentage: number;
}

const RoleHeader: React.FC<RoleHeaderProps> = ({ role, finishedSize, size, hasHidden, percentage }) => {
    return (
        <div className="text-md flex flex-row  justify-evenly align-bottom">
            <h4 className="my-auto p-2">
                {finishedSize} / {size}
                {hasHidden ? "*" : ""}
            </h4>
            <div className="mb-2 bg-gradient-to-r from-green-600 via-sky-600 to-purple-600 pb-[3px]">
                <div className="flex h-full flex-col justify-between bg-black text-gray-200">
                    <h4 className="text-xl font-bold">{role}</h4>
                </div>
            </div>
            <h4 className="my-auto p-2">{percentage.toFixed(1)} %</h4>
        </div>
    );
};

export default RoleHeader;
