import type { UiLocale } from "@/src/lib/ui-locale";

export interface AuthRecoveryCopy {
  readonly forgotTitle: string;
  readonly forgotSub: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly sendCode: string;
  readonly sending: string;
  readonly sendError: string;
  readonly sentBody: (email: string) => string;
  readonly sentSecurity: string;
  readonly enterCode: string;
  readonly backSignIn: string;
  readonly verifyResetTitle: string;
  readonly verifyResetSub: string;
  readonly otpLabel: string;
  readonly otpPlaceholder: string;
  readonly continue: string;
  readonly checking: string;
  readonly invalidCode: string;
  readonly requestNewCode: string;
  readonly resetTitle: string;
  readonly resetSub: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
  readonly savePassword: string;
  readonly saving: string;
  readonly minLength: string;
  readonly mismatch: string;
  readonly sessionExpired: string;
  readonly resetFailed: string;
  readonly noSessionBody: string;
  readonly forgotLink: string;
  readonly loading: string;
  readonly verifyRegTitle: string;
  readonly verifyRegSub: string;
  readonly missingEmailTitle: string;
  readonly missingEmailBody: string;
  readonly backRegister: string;
  readonly passwordLabel: string;
  readonly confirmLabel: string;
  readonly createAccount: string;
  readonly creating: string;
  readonly resend: string;
  readonly resending: string;
  readonly resent: string;
  readonly passwordHint: string;
  readonly passwordMismatch: string;
  readonly didntReceive: string;
  readonly confirmPlaceholder: string;
  readonly updatePassword: string;
  readonly updating: string;
}

function buildAuthRecoveryCopy(locale: UiLocale): AuthRecoveryCopy {
  if (locale === "bn") {
    return {
      forgotTitle: "পাসওয়ার্ড ভুলে গেছেন?",
      forgotSub:
        "অ্যাকাউন্টের ইমেইল দিন। নতুন পাসওয়ার্ড সেট করার আগে আমরা একবার কোড পাঠিয়ে যাচাই করব।",
      emailLabel: "ইমেইল ঠিকানা",
      emailPlaceholder: "you@example.com",
      sendCode: "ভেরিফিকেশন কোড পাঠান",
      sending: "পাঠানো হচ্ছে…",
      sendError: "ইমেইল পাঠানো যায়নি। ঠিকানা চেক করে আবার চেষ্টা করুন।",
      sentBody: (email) =>
        `${email} এর জন্য অ্যাকাউন্ট থাকলে ভেরিফিকেশন কোডসহ ইমেইল পাবেন। কোড কয়েক মিনিটে মেয়াদ শেষ হয়।`,
      sentSecurity:
        "নিরাপত্তার জন্য আমরা বলি না কোনো ইমেইল রেজিস্টার্ড কি না।",
      enterCode: "ভেরিফিকেশন কোড দিন",
      backSignIn: "সাইন ইনে ফিরে যান",
      verifyResetTitle: "ইমেইল যাচাই করুন",
      verifyResetSub:
        "ইনবক্সের ওয়ান-টাইম কোড দিন। এতে প্রমাণ হয় ইমেইলটি আপনারই।",
      otpLabel: "ভেরিফিকেশন কোড",
      otpPlaceholder: "ইমেইলের কোড",
      continue: "চালিয়ে যান",
      checking: "চেক হচ্ছে…",
      invalidCode:
        "কোড ভুল বা মেয়াদ শেষ। Forgot password পেজ থেকে নতুন কোড চান।",
      requestNewCode: "নতুন কোড চান",
      resetTitle: "নতুন পাসওয়ার্ড বাছুন",
      resetSub:
        "অন্য সাইটে ব্যবহার করেন না এমন শক্তিশালী পাসওয়ার্ড দিন। কমপক্ষে ৮ অক্ষর।",
      newPassword: "নতুন পাসওয়ার্ড",
      confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
      savePassword: "পাসওয়ার্ড সেভ করুন",
      saving: "সেভ হচ্ছে…",
      minLength: "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।",
      mismatch: "পাসওয়ার্ড মিলছে না।",
      sessionExpired:
        "রিসেট সেশন শেষ। Forgot password থেকে আবার শুরু করুন।",
      resetFailed: "পাসওয়ার্ড রিসেট হয়নি। আবার চেষ্টা করুন।",
      noSessionBody:
        "ইমেইল কোড যাচাইয়ের পর এই পেজ ব্যবহার হয়। ট্যাব বন্ধ করে থাকলে Forgot password থেকে আবার শুরু করুন।",
      forgotLink: "পাসওয়ার্ড ভুলে গেছেন",
      loading: "লোড হচ্ছে…",
      verifyRegTitle: "যাচাই ও পাসওয়ার্ড সেট",
      verifyRegSub: "যে কোড পাঠিয়েছি সেটা দিন",
      missingEmailTitle: "ইমেইল নেই",
      missingEmailBody:
        "রেজিস্ট্রেশন পেজ থেকে শুরু করে আগে ইমেইল দিন।",
      backRegister: "রেজিস্ট্রেশনে ফিরে যান",
      passwordLabel: "পাসওয়ার্ড",
      confirmLabel: "পাসওয়ার্ড নিশ্চিত করুন",
      createAccount: "অ্যাকাউন্ট তৈরি করুন",
      creating: "তৈরি হচ্ছে…",
      resend: "কোড আবার পাঠান",
      resending: "পাঠানো হচ্ছে…",
      resent: "নতুন কোড পাঠানো হয়েছে।",
      passwordHint: "কমপক্ষে ৬ অক্ষর",
      passwordMismatch: "পাসওয়ার্ড মিলছে না",
      didntReceive: "কোড পাননি?",
      confirmPlaceholder: "পাসওয়ার্ড আবার লিখুন",
      updatePassword: "পাসওয়ার্ড আপডেট",
      updating: "আপডেট হচ্ছে…",
    };
  }

  return {
    forgotTitle: "Forgot password",
    forgotSub:
      "Enter the email on your account. We will send a one-time code to verify it is really you before you can choose a new password.",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    sendCode: "Send verification code",
    sending: "Sending…",
    sendError: "We could not send the email. Check the address and try again.",
    sentBody: (email) =>
      `If an account exists for ${email}, you will receive an email with a verification code. The code expires in a few minutes.`,
    sentSecurity:
      "For security we do not confirm whether an email is registered.",
    enterCode: "Enter verification code",
    backSignIn: "Back to sign in",
    verifyResetTitle: "Verify your email",
    verifyResetSub:
      "Enter the one-time code from your inbox. This proves you control this email address.",
    otpLabel: "Verification code",
    otpPlaceholder: "Code from email",
    continue: "Continue",
    checking: "Checking…",
    invalidCode:
      "Invalid or expired code. Request a new one from the forgot password page.",
    requestNewCode: "Request a new code",
    resetTitle: "Choose a new password",
    resetSub:
      "Use a strong password you do not reuse on other sites. Minimum 8 characters.",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    savePassword: "Save password",
    saving: "Saving…",
    minLength: "Use at least 8 characters for your new password.",
    mismatch: "Passwords do not match.",
    sessionExpired: "Your reset session expired. Start again from forgot password.",
    resetFailed: "Could not reset password. Try again.",
    noSessionBody:
      "This page is used after you verify your email with a code. If you closed the tab, start again from forgot password.",
    forgotLink: "Forgot password",
    loading: "Loading…",
    verifyRegTitle: "Verify & set password",
    verifyRegSub: "Enter the code we sent to",
    missingEmailTitle: "Missing email",
    missingEmailBody:
      "Please start from the registration page and enter your email first.",
    backRegister: "Back to registration",
    passwordLabel: "Password",
    confirmLabel: "Confirm password",
    createAccount: "Create account",
    creating: "Creating…",
    resend: "Resend code",
    resending: "Sending…",
    resent: "A new code was sent.",
    passwordHint: "At least 6 characters",
    passwordMismatch: "Passwords do not match",
    didntReceive: "Didn't receive the code?",
    confirmPlaceholder: "Repeat password",
    updatePassword: "Update password",
    updating: "Updating…",
  };
}

export const AUTH_RECOVERY_COPY: Record<UiLocale, AuthRecoveryCopy> = {
  bn: buildAuthRecoveryCopy("bn"),
  en: buildAuthRecoveryCopy("en"),
};

export interface ProfilePasswordCopy {
  readonly changeTitle: string;
  readonly setTitle: string;
  readonly updateCta: string;
  readonly setCta: string;
  readonly changeHelp: string;
  readonly setHelp: string;
  readonly current: string;
  readonly newPassword: string;
  readonly password: string;
  readonly confirm: string;
  readonly saving: string;
  readonly minLength: string;
  readonly mismatch: string;
  readonly updateSuccess: string;
  readonly setSuccess: string;
  readonly updateFail: string;
  readonly setFail: string;
}

function buildProfilePasswordCopy(locale: UiLocale): ProfilePasswordCopy {
  if (locale === "bn") {
    return {
      changeTitle: "পাসওয়ার্ড বদলান",
      setTitle: "পাসওয়ার্ড সেট করুন",
      updateCta: "পাসওয়ার্ড আপডেট",
      setCta: "পাসওয়ার্ড সেট করুন",
      changeHelp:
        "নিরাপত্তার জন্য এই অংশ খোলা পর্যন্ত বন্ধ থাকে। শক্তিশালী পাসওয়ার্ড কমপক্ষে ৮ অক্ষর ও এই সাইটের জন্য ইউনিক হোক।",
      setHelp:
        "ইমেইল দিয়েও লগইন করতে পাসওয়ার্ড যোগ করুন। Google সাইন-ইন আগের মতোই কাজ করবে।",
      current: "বর্তমান পাসওয়ার্ড",
      newPassword: "নতুন পাসওয়ার্ড",
      password: "পাসওয়ার্ড",
      confirm: "পাসওয়ার্ড নিশ্চিত করুন",
      saving: "সেভ হচ্ছে…",
      minLength: "নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।",
      mismatch: "নতুন পাসওয়ার্ড ও নিশ্চিতকরণ মিলছে না।",
      updateSuccess:
        "পাসওয়ার্ড আপডেট হয়েছে। পরেরবার নতুন পাসওয়ার্ড দিয়ে সাইন ইন করুন।",
      setSuccess: "পাসওয়ার্ড সেট হয়েছে। এখন ইমেইল বা Google দিয়ে সাইন ইন করতে পারবেন।",
      updateFail: "পাসওয়ার্ড আপডেট হয়নি। বর্তমান পাসওয়ার্ড চেক করুন।",
      setFail: "পাসওয়ার্ড সেট হয়নি। আবার চেষ্টা করুন।",
    };
  }

  return {
    changeTitle: "Change password",
    setTitle: "Set a password",
    updateCta: "Update password",
    setCta: "Set password",
    changeHelp:
      "For your security this section stays collapsed until you open it. A strong password is at least 8 characters and unique to this site.",
    setHelp:
      "Add a password so you can also sign in with email. Google sign-in will keep working.",
    current: "Current password",
    newPassword: "New password",
    password: "Password",
    confirm: "Confirm password",
    saving: "Saving…",
    minLength: "New password must be at least 8 characters.",
    mismatch: "New password and confirmation do not match.",
    updateSuccess:
      "Password updated. Use your new password next time you sign in.",
    setSuccess: "Password set. You can now sign in with email or Google.",
    updateFail: "Could not update password. Check your current password.",
    setFail: "Could not set password. Please try again.",
  };
}

export const PROFILE_PASSWORD_COPY: Record<UiLocale, ProfilePasswordCopy> = {
  bn: buildProfilePasswordCopy("bn"),
  en: buildProfilePasswordCopy("en"),
};

export interface GoogleCallbackCopy {
  readonly signingIn: string;
  readonly almostThere: string;
  readonly redirectLogin: string;
  readonly missingToken: string;
  readonly syncFailed: string;
}

export const GOOGLE_CALLBACK_COPY: Record<UiLocale, GoogleCallbackCopy> = {
  bn: {
    signingIn: "সাইন ইন হচ্ছে…",
    almostThere: "প্রায় হয়ে গেছে…",
    redirectLogin: "লগইনে পাঠানো হচ্ছে…",
    missingToken: "Google সাইন-ইন সেশন দেয়নি। আবার চেষ্টা করুন।",
    syncFailed: "Google সাইন-ইন শেষ করা যায়নি। আবার চেষ্টা করুন।",
  },
  en: {
    signingIn: "Signing you in…",
    almostThere: "Almost there…",
    redirectLogin: "Redirecting to login…",
    missingToken: "Google sign-in did not return a session. Try again.",
    syncFailed: "Could not finish Google sign-in. Try again.",
  },
};
