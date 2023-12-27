import { useOptionsStore } from "./options-store";

export function ScaleSlider() {
    const championsScale = useOptionsStore((state) => state.championsScale);
    const setChampionsScale = useOptionsStore((state) => state.setChampionsScale);

    const handleSliderChange = (event) => {
        const newScale = parseInt(event.target.value, 10);
        setChampionsScale(newScale);
    };

    return (
        <div className="flex items-center flex-col mt-4 mb-2">
            <label htmlFor="minmax-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Champion size
            </label>
            <input
                id="minmax-range"
                type="range"
                min="40"
                max="100"
                step="5"
                value={championsScale}
                onChange={handleSliderChange}
                className="w-48 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
        </div>
    );
}
