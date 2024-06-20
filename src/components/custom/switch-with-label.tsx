import React from "react";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

export const SwitchWithLabel = ({ label, checked, onChange }) => {
	return (
		<div className="flex flex-col items-center gap-2">
			<Label htmlFor={`switchWLabel${label}`}>{label}</Label>
			<Switch id={`switchWLabel${label}`} checked={checked} onCheckedChange={onChange} />
		</div>
	);
};
