import React from 'react'
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

const InputField = ({name, label, placeholder, type = "text", register, error, validation = {}, disabled=false, value}: FormInputProps) => {
    const registeredField = register(name, validation);

    return (
        <div className='space-y-2'>
            <Label htmlFor={name} className='form-label'>
                {label}
            </Label>
            <Input
                type={type}
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                className={cn('form-input', {'opacity-50 cursor-not-allowed': disabled})}
                {...(value !== undefined ? { value } : {})}
                {...registeredField}
            />
            {error && <span className='text-red-500 text-sm'>{error.message}</span>}
        </div>
    )
}
export default InputField
