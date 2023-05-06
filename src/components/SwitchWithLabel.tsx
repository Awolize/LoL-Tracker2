import { Switch } from "@headlessui/react";
import React from "react";

export const SwitchWithLabel = ({ label, checked, onChange }) => {
    return (
        <div className="flex flex-row items-center gap-2">
            <span>{label}</span>
            <Switch
                checked={checked}
                onChange={onChange}
                className={`${
                    checked ? "bg-blue-600" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
                <span className="sr-only">{label}</span>
                <span
                    className={`${
                        checked ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
            </Switch>
        </div>
    );
};
