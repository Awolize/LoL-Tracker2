import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useEffect, useState } from "react";

interface Props {
    callback: (data: number) => void;
    choices: { text: string; value: number }[];
    saveName?: string;
}

const Dropdown = ({ callback, choices, saveName }: Props) => {
    const [selected, setSelected] = useState(choices[0]);

    useEffect(() => {
        if (saveName != null) {
            const storedValue = JSON.parse(window.localStorage.getItem(saveName) ?? "0");
            console.log("storedValue", storedValue);
            for (let storedIndex = 0; storedIndex < choices.length; storedIndex++) {
                const element = choices[storedIndex];
                if (element == null) continue;
                if (element.value === storedValue) {
                    console.log("storedIndex", storedIndex);

                    setSelected(choices[storedIndex]);
                    break;
                }
            }
        }
    }, []);

    useEffect(() => {
        if (selected?.value != null) {
            callback(selected.value);
            if (saveName != null) {
                console.log("saving:", selected.value.toString());

                window.localStorage.setItem(saveName, selected.value.toString());
            }
        }
    }, [selected?.value]);

    return (
        <Listbox value={selected} onChange={setSelected}>
            <div className="relative mt-1">
                <Listbox.Button className="relative w-full cursor-default rounded bg-gray-900 py-2 pl-3 pr-10 text-left text-sm text-gray-100 shadow-md">
                    <span className="block truncate">{selected?.text}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-100" aria-hidden="true" />
                    </span>
                </Listbox.Button>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options className="max-h-75 absolute mt-1 w-full overflow-auto rounded-md bg-gray-900 py-1 text-base text-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {choices.map((person, personIdx) => (
                            <Listbox.Option
                                key={personIdx}
                                className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 text-gray-100 ${
                                        active ? "bg-gray-800" : ""
                                    }`
                                }
                                value={person}
                            >
                                {({ selected }) => (
                                    <>
                                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                                            {person.text}
                                        </span>
                                        {selected ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3  text-gray-100">
                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                        ) : null}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
};

export default Dropdown;
