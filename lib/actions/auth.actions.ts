'use server';

// import { success } from "better-auth";
import { auth } from "../better-auth/auth";
import { inngest } from "../inngest/client";
import { headers } from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry }: SignUpFormData) => {
    try {
        console.log('[Server] Attempting to sign up user:', email);
        
        const response = await auth?.api.signUpEmail({
            body: { email, password, name: fullName }
        });

        console.log('[Server] Better-auth response:', response);

        if (!response) {
            console.log('[Server] No response from better-auth');
            return { success: false, error: "Failed to create an account" };
        }

        console.log('[Server] Sending inngest event for user:', email);
        await inngest.send({
            name: 'app/user.created',
            data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
        });

        console.log('[Server] Sign up successful for:', email);
        return { success: true };
    } catch (e) {
        console.error('[Server] Sign Up failed with error:', e);
        return { success: false, error: e instanceof Error ? e.message : 'Sign up failed' };
    }
};
export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        console.log('[Server] Attempting to sign in user:', email);
        
        const response = await auth?.api.signInEmail({
            body: { email, password }
        });

        return { success: true, data: response}

    } catch (e) {
        console.error('[Server] Sign In failed with error:', e);
        return { success: false, error: e instanceof Error ? e.message : 'Sign in failed' };
    }
};

export const signOut = async () => {
    try {
        await auth?.api.signOut({ headers: await headers()})
    }catch (e) {
        console.error('[Server] Sign Out failed with error:', e);
        return { success: false, error: e instanceof Error ? e.message : 'Sign out failed' };
    }
}
