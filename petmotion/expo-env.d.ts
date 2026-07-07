/// <reference types="expo/types" />

// Expo public env vars are inlined at build time. Declaring them keeps
// process.env access type-safe in the client code.
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_PUBLIC_REVENUECAT_IOS_KEY?: string;
    EXPO_PUBLIC_REVENUECAT_ANDROID_KEY?: string;
  }
}
