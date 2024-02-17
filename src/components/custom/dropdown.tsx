"use client";

import { ChevronUpDownIcon } from "@heroicons/react/20/solid";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export interface Choice {
    text: string;
    value: number;
}

interface Props {
    choices: Choice[];
    choice: Choice;
    callback: (value: number) => void;
    menuLabel?: string;
}

export function Dropdown({ choices, choice, callback, menuLabel }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size={"sm"} className="flex flex-row w-32 justify-between">
                    <div>{choice.text}</div>
                    <ChevronUpDownIcon className="h-5 w-5 mt-[2px] text-gray-100" aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32">
                {menuLabel && (
                    <>
                        <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuRadioGroup
                    value={choice.value.toString()}
                    onValueChange={(newValue) => callback(parseFloat(newValue))}
                >
                    {choices.map((choice) => (
                        <DropdownMenuRadioItem key={choice.value.toString()} value={choice.value.toString()}>
                            {choice.text}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
