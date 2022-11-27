import { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const people = [
  { name: "100", points: 100 },
  { name: "500", points: 500 },
  { name: "1,000", points: 1000 },
  { name: "5,000", points: 5000 },
  { name: "10,000", points: 10000 },
  { name: "50,000", points: 50000 },
  { name: "100,000", points: 100000 },
];

interface Props {
  callback: (data: number) => void;
}

const MyListbox = ({ callback }: Props) => {
  const [selected, setSelected] = useState(people[people.length - 3]);

  useEffect(() => {
    if (selected?.points) {
      callback(selected.points);
    }
  }, [selected]);

  return (
    <Listbox value={selected} onChange={setSelected}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-900 py-2 pl-3 pr-10 text-left text-sm text-gray-100 shadow-md">
          <span className="block truncate">{selected?.name}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-100"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="max-h-75 absolute mt-1 w-full overflow-auto rounded-md bg-gray-900 py-1 text-base text-gray-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {people.map((person, personIdx) => (
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
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {person.name}
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

export default MyListbox;
