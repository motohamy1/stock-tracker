import React from 'react'
import {Label} from "@/components/ui/label";
import {Controller} from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const SelectField = ({name, label, control, options, placeholder, error, required = false}:  SelectFieldProps) => {
    return (
        <div className='space-y-2'>
            <Label htmlFor={name} className='form-label block text-sm font-medium text-gray-300'>
                {label}
            </Label>
            <Controller
                name={name}
                control={control}
                rules={{
                    required: required ? `Please select ${label.toLowerCase()}`: false,
                }}
                render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent className='bg-gray-800 border-gray-600 text-white'>
                            {options.map((option) => (
                                <SelectItem
                                    value={option.value}
                                    key={option.value}
                                    className='focus:bg-gray-600 focus:text-white hover:bg-gray-700'
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        {error && <p className='text-red-400'>{error.message}</p>}
                    </Select>
                    )}
            />
        </div>
    )
}
export default SelectField
