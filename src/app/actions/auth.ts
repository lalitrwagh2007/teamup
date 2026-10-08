"use server";

import { createClient } from "@/lib/supabase/server";
import { signupSchema, SignupInput, loginSchema, LoginInput } from "@/validations/auth.schema";


export type SignupState = {
  success: boolean;
  message?: string;
  errors?: {
    fullName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
  };
};

export async function signUpAction(
  prevState: SignupState | null,
  formData: FormData
): Promise<SignupState> {
  const rawData = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const validation = signupSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      message: "Please fix the errors in the form.",
      errors: fieldErrors,
    };
  }

  const { fullName, email, password } = validation.data;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      // Map standard Supabase error messages to user-friendly text
      let userFriendlyMessage = "Failed to create account. Please try again.";
      if (error.message.includes("already registered")) {
        userFriendlyMessage = "An account with this email already exists.";
      } else if (error.message.includes("Password")) {
        userFriendlyMessage = error.message;
      }

      return {
        success: false,
        message: userFriendlyMessage,
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: "Unable to complete registration. Please try again.",
      };
    }

    return {
      success: true,
      message: "Account created successfully!",
    };
  } catch (err) {
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}
export type LoginState = {
  success: boolean;
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const validation = loginSchema.safeParse(rawData);

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    return {
      success: false,
      message: "Please fill in all required fields.",
      errors: fieldErrors,
    };
  }

  const { email, password } = validation.data;

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let userFriendlyMessage = "Invalid email or password.";
      if (error.message.includes("Email not confirmed")) {
        userFriendlyMessage = "Please confirm your email address before logging in.";
      }

      return {
        success: false,
        message: userFriendlyMessage,
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: "Unable to sign in. Please try again.",
      };
    }

    return {
      success: true,
      message: "Logged in successfully!",
    };
  } catch (err) {
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

