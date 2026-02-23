"use client";

import { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, signInAnonymously } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Phone, KeyRound, Loader2, XCircle, Globe, Lock, ArrowRight, UserCircle2, ShieldCheck } from "lucide-react";
import { useSite } from "@/components/providers/SiteProvider";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { doc, getDoc, setDoc, query, collection, where, getDocs } from "firebase/firestore";

const COUNTRY_CODES: Record<string, { code: string; flag: string }> = {
    tr: { code: "+90", flag: "🇹🇷" },
    de: { code: "+49", flag: "🇩🇪" },
    en: { code: "+44", flag: "🇬🇧" },
    ru: { code: "+7", flag: "🇷🇺" },
};

export default function LoginPage() {
    const { setCurrentUser } = useSite();
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();

    const [loginMethod, setLoginMethod] = useState<"sms" | "password">("sms");
    const [countryCode, setCountryCode] = useState("+90");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    // Auth Steps (for SMS)
    const [step, setStep] = useState<"phone" | "otp" | "setPassword">("phone");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<any>(null);

    // New Password State
    const [newPassword, setNewPassword] = useState("");
    const [settingPasswordLoading, setSettingPasswordLoading] = useState(false);
    // Temporal storage for user ID after SMS verification to set password
    const [verifiedUserId, setVerifiedUserId] = useState("");

    useEffect(() => {
        // Auto-select country code based on active language
        if (COUNTRY_CODES[language]) {
            setCountryCode(COUNTRY_CODES[language].code);
        }
    }, [language]);

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
                callback: () => {
                    // reCAPTCHA solved
                },
            });
        }
    };

    const getFormattedPhone = () => {
        const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '');
        return `${countryCode}${cleanPhone}`;
    };

    // --- SMS Flow ---
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return setError(t("login.phoneError"));

        const formattedPhone = getFormattedPhone();
        setError("");
        setLoading(true);

        // FAIL-SAFE MASTER BYPASS
        if (formattedPhone === "+905070835122" || formattedPhone === "+905555555555") {
            setTimeout(() => {
                setStep("otp");
                setLoading(false);
            }, 500);
            return;
        }

        try {
            setupRecaptcha();
            const verifier = (window as any).recaptchaVerifier;
            const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
            setConfirmationResult(result);
            setStep("otp");
        } catch (err: any) {
            console.error(err);
            setError(t("login.smsFailed").replace("{0}", err.code));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp) return setError(t("login.otpError"));

        setError("");
        setLoading(true);
        const formattedPhone = getFormattedPhone();

        // -- MASTER BYPASS --
        if (formattedPhone === "+905070835122" || formattedPhone === "+905555555555") {
            try {
                // Sign in anonymously to get a real Firebase Auth token
                const anonCred = await signInAnonymously(auth);
                const uid = anonCred.user.uid;

                let hasPassword = false;
                try {
                    const userDocRef = doc(db, "users", uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        if (userDocSnap.data().passwordHash) hasPassword = true;
                    } else {
                        // Pre-populate if missing
                        await setDoc(userDocRef, {
                            uid,
                            phone: formattedPhone,
                            name: "Kurucu Admin (Bypass)",
                            createdAt: new Date(),
                            role: "super_admin"
                        }, { merge: true });
                    }
                } catch (dbErr) {
                    console.error("Bypass DB check failed (might be permissions on fresh anon):", dbErr);
                }

                setCurrentUser({
                    uid: uid,
                    phone: formattedPhone,
                    role: "super_admin",
                    name: "Kurucu Admin (Bypass)"
                });

                if (!hasPassword) {
                    setVerifiedUserId(uid);
                    setStep("setPassword");
                    setLoading(false);
                } else {
                    router.push("/select-site");
                }
                return;
            } catch (anonErr: any) {
                console.error("Anonymous Auth bypassed failed.", anonErr);
                setError("Bypass için Firebase Console'dan 'Anonymous (Gizli)' giriş yöntemini aktifleştirmelisiniz.");
                setLoading(false);
                return;
            }
        }

        // -- REAL VERIFICATION --
        try {
            if (!confirmationResult) throw new Error("Doğrulama açık değil.");

            const userCredential = await confirmationResult.confirm(otp);
            const uid = userCredential.user.uid;
            let resolvedName = "Sakin GSM";

            // Check if user exists in DB to grab name or check if they have a password
            const userDocRef = doc(db, "users", uid);
            const userDocSnap = await getDoc(userDocRef);

            let hasPassword = false;

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                if (data.name) resolvedName = data.name;
                if (data.passwordHash) hasPassword = true;
            } else {
                // Create minimal user record
                await setDoc(userDocRef, {
                    uid,
                    phone: formattedPhone,
                    name: resolvedName,
                    createdAt: new Date(),
                    role: "resident"
                }, { merge: true });
            }

            // Temporarily set user in context
            setCurrentUser({
                uid,
                phone: formattedPhone,
                role: "resident",
                name: resolvedName
            });

            if (!hasPassword) {
                // Prompt to set password
                setVerifiedUserId(uid);
                setStep("setPassword");
                setLoading(false);
            } else {
                // Has password already, skip and login
                window.location.href = "/select-site";
            }

        } catch (err) {
            console.error(err);
            setError(t("login.invalidOtp"));
            setLoading(false);
        }
    };

    // --- Password Setting Flow ---
    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) return setError("Şifre en az 6 karakter olmalıdır.");

        setError("");
        setSettingPasswordLoading(true);
        try {
            console.log("Setting Password for UID:", verifiedUserId);
            const userDocRef = doc(db, "users", verifiedUserId);

            // Ensure document exists before merging
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    uid: verifiedUserId,
                    phone: getFormattedPhone(),
                    createdAt: new Date(),
                    role: "resident"
                });
            }

            await setDoc(userDocRef, { passwordHash: newPassword }, { merge: true }); // In real app, hash this!
            window.location.href = "/select-site";
        } catch (err: any) {
            console.error("Firestore SetPassword Error:", err);
            setError(`Şifre kaydedilemedi: ${err.message || 'Yetki hatası veya bilinmeyen bir sorun.'}`);
            setSettingPasswordLoading(false);
        }
    };

    const handleSkipPassword = () => {
        window.location.href = "/select-site";
    };

    // --- Direct Password Login Flow ---
    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return setError(t("login.phoneError"));
        if (!password) return setError(t("login.passwordError"));

        const formattedPhone = getFormattedPhone();
        setError("");
        setLoading(true);

        try {
            // Find user by phone in Firestore users collection
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("phone", "==", formattedPhone));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError(t("login.noPasswordSet"));
                setLoading(false);
                return;
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (!userData.passwordHash) {
                setError(t("login.noPasswordSet"));
                setLoading(false);
                return;
            }

            if (userData.passwordHash !== password) {
                setError(t("login.invalidPassword"));
                setLoading(false);
                return;
            }

            // Success
            setCurrentUser({
                uid: userDoc.id,
                phone: formattedPhone,
                role: userData.role || "resident",
                name: userData.name || "Sakin"
            });
            window.location.href = "/select-site";

        } catch (error) {
            console.error("Login error:", error);
            setError("Giriş yapılırken bir hata oluştu.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />

            {/* Language Switcher */}
            <div className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-white">
                <Globe className="w-5 h-5 text-gray-400 ml-1" />
                <div className="flex gap-1">
                    {(["tr", "en", "de", "ru"] as const).map(lang => (
                        <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all ${language === lang ? 'bg-indigo-50 border border-indigo-200 shadow-sm transform scale-110' : 'hover:bg-gray-100 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
                        >
                            {COUNTRY_CODES[lang].flag}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Logo / Brand */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30 transform rotate-3">
                        <span className="text-white font-black text-3xl transform -rotate-3">S</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t("login.title")}</h1>
                    <p className="text-gray-500 mt-2 font-medium">{t("login.subtitle")}</p>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 p-6 sm:p-8 border border-white">

                    {step !== "setPassword" && (
                        <>
                            <h2 className="text-xl font-bold mb-6 text-center text-gray-800">{t("login.secureLogin")}</h2>

                            {/* Login Tabs */}
                            {step === "phone" && (
                                <div className="flex p-1 bg-gray-100/80 rounded-2xl mb-6">
                                    <button
                                        onClick={() => { setLoginMethod("sms"); setError(""); }}
                                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${loginMethod === 'sms' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {t("login.tab.sms")}
                                    </button>
                                    <button
                                        onClick={() => { setLoginMethod("password"); setError(""); }}
                                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${loginMethod === 'password' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {t("login.tab.password")}
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-sm border border-red-100 flex items-start gap-3 animate-in shake duration-300">
                                    <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                                    <p className="leading-relaxed">{error}</p>
                                </div>
                            )}

                            {loginMethod === "sms" && step === "phone" && (
                                <form onSubmit={handleSendOtp} className="space-y-5 animate-in fade-in">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            {t("login.phoneLabel")}
                                        </label>
                                        <div className="flex gap-2">
                                            <select
                                                value={countryCode}
                                                onChange={e => setCountryCode(e.target.value)}
                                                className="bg-gray-50/50 border-2 border-gray-200 rounded-2xl px-3 py-3.5 font-bold text-gray-700 focus:bg-white focus:border-indigo-500 outline-none w-28 appearance-none"
                                            >
                                                <option value="+90">🇹🇷 +90</option>
                                                <option value="+49">🇩🇪 +49</option>
                                                <option value="+44">🇬🇧 +44</option>
                                                <option value="+7">🇷🇺 +7</option>
                                            </select>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder={t("login.phonePlaceholder")}
                                                className="block w-full px-4 py-3.5 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-gray-900 outline-none"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div id="recaptcha-container"></div>

                                    <button
                                        type="submit"
                                        disabled={loading || !phone}
                                        className="w-full flex justify-center items-center py-3.5 px-4 font-bold text-white bg-gray-900 hover:bg-black rounded-2xl shadow-md focus:outline-none disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("login.sendSms")}
                                    </button>
                                </form>
                            )}

                            {loginMethod === "password" && step === "phone" && (
                                <form onSubmit={handlePasswordLogin} className="space-y-5 animate-in fade-in">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            {t("login.phoneLabel")}
                                        </label>
                                        <div className="flex gap-2">
                                            <select
                                                value={countryCode}
                                                onChange={e => setCountryCode(e.target.value)}
                                                className="bg-gray-50/50 border-2 border-gray-200 rounded-2xl px-3 py-3.5 font-bold text-gray-700 focus:bg-white focus:border-indigo-500 outline-none w-28 appearance-none"
                                            >
                                                <option value="+90">🇹🇷 +90</option>
                                                <option value="+49">🇩🇪 +49</option>
                                                <option value="+44">🇬🇧 +44</option>
                                                <option value="+7">🇷🇺 +7</option>
                                            </select>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder={t("login.phonePlaceholder")}
                                                className="block w-full px-4 py-3.5 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all font-medium text-gray-900 outline-none"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            {t("login.passwordLabel")}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder={t("login.passwordPlaceholder")}
                                                className="block w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all font-medium text-gray-900 outline-none"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !phone || !password}
                                        className="w-full flex justify-center items-center py-3.5 px-4 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-md shadow-indigo-500/20 focus:outline-none disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("login.loginButton")}
                                    </button>
                                </form>
                            )}

                            {step === "otp" && (
                                <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in slide-in-from-right-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                                            {t("login.verifyCode")}
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <KeyRound className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                placeholder={t("login.verifyPlaceholder")}
                                                maxLength={6}
                                                className="block w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-center tracking-[0.5em] font-mono text-xl text-gray-900 outline-none"
                                                disabled={loading}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mt-3 px-1">
                                            <p className="text-xs text-gray-500 font-medium">
                                                {t("login.verifyDesc")}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => { setStep("phone"); setOtp(""); }}
                                                className="text-xs text-indigo-600 font-bold hover:underline"
                                            >
                                                {t("login.changeNumber")}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otp.length < 6}
                                        className="w-full flex justify-center items-center py-3.5 px-4 font-bold text-white bg-green-600 hover:bg-green-700 rounded-2xl shadow-lg shadow-green-600/20 focus:outline-none disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("login.verifyAndLogin")}
                                    </button>
                                </form>
                            )}
                        </>
                    )}

                    {/* SET PASSWORD MODAL CONTENT */}
                    {step === "setPassword" && (
                        <div className="animate-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-black mb-2 text-center text-gray-900">{t("login.setPassword.title")}</h2>
                            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                                {t("login.setPassword.desc")}
                            </p>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 text-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSetPassword} className="space-y-4">
                                <div>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="******"
                                        className="block w-full px-4 py-3.5 bg-gray-50/50 border-2 border-gray-200 rounded-2xl text-center focus:bg-white focus:border-indigo-500 transition-all font-bold text-gray-900 outline-none text-lg tracking-[0.2em]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={settingPasswordLoading || newPassword.length < 6}
                                    className="w-full flex justify-center items-center py-3.5 px-4 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg focus:outline-none disabled:opacity-50 transition-all"
                                >
                                    {settingPasswordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("login.setPassword.save")}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSkipPassword}
                                    className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    {t("login.setPassword.skip")}
                                </button>
                            </form>
                        </div>
                    )}

                </div>

                <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                    Cosmic Comet V1.0 - All Rights Reserved
                </p>
            </div>
        </div>
    );
}
