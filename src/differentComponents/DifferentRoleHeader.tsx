import React from "react";

export const DifferentRoleHeader = ({ role }: { role: string }) => {
    return (
        <div className="text-md flex flex-row justify-center gap-8 align-bottom">
            <div className="mb-2 bg-gradient-to-r from-green-600 via-sky-600 to-purple-600 pb-[3px]">
                <div className="flex h-full flex-col justify-between bg-black text-gray-200">
                    <h4 className="text-xl font-bold">{role}</h4>
                </div>
            </div>
        </div>
    );
};
