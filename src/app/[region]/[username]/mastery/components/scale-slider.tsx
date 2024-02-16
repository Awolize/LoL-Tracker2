import { useOptionsPersistentContext } from "~/components/stores/options-persistent-store";
import { useUserContext } from "~/components/stores/user-store";
import { Slider } from "~/components/ui/slider";

export function ScaleSlider() {
    const user = useUserContext((s) => s.user);
    const championsScale = useOptionsPersistentContext((s) => s.championsScale);
    const setChampionsScale = useOptionsPersistentContext((s) => s.setChampionsScale);

    const handleSliderChange = (value) => {
        setChampionsScale(value[0]);
    };

    return (
        <Slider
            min={40}
            max={100}
            step={5}
            value={[championsScale]}
            onValueChange={handleSliderChange}
            className="w-40 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
    );
}
