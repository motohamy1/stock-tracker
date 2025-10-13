'use client'

import React from 'react'
import {useForm} from "react-hook-form";
import InputField from "@/components/forms/inputField";
import {Button} from "@/components/ui/button";
import FooterLink from "@/components/forms/FooterLink";

const SignIn = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting},} = useForm<SignInFormData>({
        defaultValues : {
            email : "",
            password : ""
        },
        mode: 'onBlur'
    },)
    const onSubmit = async (data : SignInFormData) => {
        try{
            console.log(data)
        } catch(e){
            console.log('error', e);
        }
    }

    return (
        <>
            <h1 className='form-title'>Log In Your Account</h1>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>

                <InputField
                    name='email'
                    label='Email'
                    placeholder="contact@gmail.com"
                    register={register}
                    error={errors.email}
                    validation={{required: 'Email is required', pattern: /^[A-Z0][a-z]{3}$/g}}
                />
                <InputField
                    name='password'
                    label='Password'
                    placeholder="Enter a strong password"
                    type={'password'}
                    register={register}
                    error={errors.password}
                    validation={{required: 'Password is required', minLength:8, pattern: /^[A-Z0][a-z]{3}$/g}}
                />


                <Button type='submit' disabled={isSubmitting} className='yellow-btn w-full mt-5'>
                    {isSubmitting ? 'Signing In' : 'Log In'}
                </Button>

                <FooterLink
                    text="Don't have an account?"
                    linkText='Sign up'
                    href='/sign-up'
                />
            </form>
        </>
    )
}
export default SignIn;
