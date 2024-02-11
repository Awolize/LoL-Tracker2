import { useOptionsPersistentContext } from "../stores/options-persistent-store";
import { useUserContext } from "../stores/user-store";

export function ScaleSlider() {
    const user = useUserContext((s) => s.user);
    const championsScale = useOptionsPersistentContext((s) => s.championsScale);
    const setChampionsScale = useOptionsPersistentContext((s) => s.setChampionsScale);

    const handleSliderChange = (event) => {
        const newScale = parseInt(event.target.value, 10);
        setChampionsScale(newScale);
    };

    return (
        <div className="flex items-center flex-col">
            <label htmlFor="minmax-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-foreground">
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
