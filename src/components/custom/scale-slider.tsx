import { useOptionsPersistentContext } from "~/components/stores/options-persistent-store";
import { Slider } from "~/components/ui/slider";

export function ScaleSlider() {
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
			className="h-2 w-40 cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
		/>
	);
}
