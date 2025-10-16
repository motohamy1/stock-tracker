'use client'

import React from 'react'
import {useForm} from "react-hook-form";
import InputField from "@/components/forms/inputField";
import {Button} from "@/components/ui/button";
import FooterLink from "@/components/forms/FooterLink";
import { signInWithEmail } from '@/lib/actions/auth.actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const SignIn = () => {
    const router = useRouter();
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
    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);
            
            if(result?.success) router.push('/')
            
        } catch (e) {
            console.log("error", e);
            toast.error('Sign in failed',{
                description: e instanceof Error? e.message : 'Failed to sign in'
            })
        }
    };

    return (
        <>
            <h1 className='form-title'>Log In Your Account</h1>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>

                <InputField
                    name='email'
                    label='Email'
                    type={'email'}
                    placeholder="contact@gmail.com"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: 'Email is required',
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Enter a valid email address'
                        }
                    }}
                />
                <InputField
                    name='password'
                    label='Password'
                    placeholder="Enter a strong password"
                    type={'password'}
                    register={register}
                    error={errors.password}
                    validation={{
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    }}
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
