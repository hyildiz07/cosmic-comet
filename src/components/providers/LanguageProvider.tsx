"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "tr" | "en" | "de" | "ru";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    tr: {
        // Login
        "login.title": "Cosmic Comet",
        "login.subtitle": "Yeni Nesil AI Destekli Site & Tesis Yönetimi",
        "login.secureLogin": "Güvenli Giriş",
        "login.phoneLabel": "Cep Telefonu",
        "login.phonePlaceholder": "5XX XXX XX XX",
        "login.sendSms": "SMS Kodu Gönder",
        "login.verifyCode": "Doğrulama Kodu",
        "login.verifyPlaceholder": "6 Haneli Kod",
        "login.verifyDesc": "Gelen SMS kodunu girin",
        "login.changeNumber": "Numarayı Değiştir",
        "login.verifyAndLogin": "Doğrula ve Giriş Yap",
        "login.phoneError": "Lütfen bir telefon numarası girin",
        "login.otpError": "Lütfen doğrulama kodunu girin",
        "login.invalidOtp": "Hatalı doğrulama kodu. Lütfen tekrar deneyin.",
        "login.smsFailed": "SMS gönderilemedi (Hata Kodu: {0}). Lütfen telefon numaranızı kontrol edin.",

        // Passwords & Tabs
        "login.tab.sms": "SMS ile Giriş",
        "login.tab.password": "Şifre ile Giriş",
        "login.passwordLabel": "Şifre",
        "login.passwordPlaceholder": "Şifrenizi girin",
        "login.loginButton": "Giriş Yap",
        "login.passwordError": "Lütfen şifrenizi girin",
        "login.invalidPassword": "Hatalı şifre. Lütfen tekrar deneyin.",
        "login.noPasswordSet": "Bu numara için henüz şifre belirlenmemiş. Lütfen önce SMS ile giriş yapıp şifrenizi oluşturun.",

        // Set Password Modal
        "login.setPassword.title": "Kalıcı Şifre Belirle",
        "login.setPassword.desc": "Sisteme sonraki girişlerinizde SMS beklemeden hızlıca girebilmek için lütfen bir şifre belirleyin.",
        "login.setPassword.label": "Yeni Şifre",
        "login.setPassword.save": "Şifreyi Kaydet ve Devam Et",
        "login.setPassword.skip": "Şimdilik Geç (Sadece SMS Kullan)",
        "login.setPassword.success": "Şifreniz başarıyla kaydedildi!"
    },
    en: {
        "login.title": "Cosmic Comet",
        "login.subtitle": "Next-Gen AI Powered Facility Management",
        "login.secureLogin": "Secure Login",
        "login.phoneLabel": "Phone Number",
        "login.phonePlaceholder": "5XX XXX XX XX",
        "login.sendSms": "Send SMS Code",
        "login.verifyCode": "Verification Code",
        "login.verifyPlaceholder": "6 Digit Code",
        "login.verifyDesc": "Enter the SMS code received",
        "login.changeNumber": "Change Number",
        "login.verifyAndLogin": "Verify & Login",
        "login.phoneError": "Please enter a phone number",
        "login.otpError": "Please enter the verification code",
        "login.invalidOtp": "Invalid verification code. Please try again.",
        "login.smsFailed": "Failed to send SMS (Error: {0}). Please check your phone number.",

        "login.tab.sms": "SMS Login",
        "login.tab.password": "Password Login",
        "login.passwordLabel": "Password",
        "login.passwordPlaceholder": "Enter your password",
        "login.loginButton": "Login",
        "login.passwordError": "Please enter your password",
        "login.invalidPassword": "Incorrect password. Please try again.",
        "login.noPasswordSet": "No password set for this number. Please login with SMS first and create a password.",

        "login.setPassword.title": "Set a Permanent Password",
        "login.setPassword.desc": "Create a password to login instantly next time without waiting for an SMS code.",
        "login.setPassword.label": "New Password",
        "login.setPassword.save": "Save Password & Continue",
        "login.setPassword.skip": "Skip for now (Use SMS only)",
        "login.setPassword.success": "Password saved successfully!"
    },
    de: {
        "login.title": "Cosmic Comet",
        "login.subtitle": "Next-Gen KI-gestütztes Facility Management",
        "login.secureLogin": "Sicherer Login",
        "login.phoneLabel": "Telefonnummer",
        "login.phonePlaceholder": "1XX XXX XX XX",
        "login.sendSms": "SMS-Code Senden",
        "login.verifyCode": "Verifizierungscode",
        "login.verifyPlaceholder": "6-stelliger Code",
        "login.verifyDesc": "Geben Sie den erhaltenen SMS-Code ein",
        "login.changeNumber": "Nummer Ändern",
        "login.verifyAndLogin": "Verifizieren & Anmelden",
        "login.phoneError": "Bitte geben Sie eine Telefonnummer ein",
        "login.otpError": "Bitte geben Sie den Verifizierungscode ein",
        "login.invalidOtp": "Ungültiger Verifizierungscode. Bitte versuchen Sie es erneut.",
        "login.smsFailed": "SMS konnte nicht gesendet werden (Fehler: {0}). Bitte überprüfen Sie Ihre Nummer.",

        "login.tab.sms": "SMS-Login",
        "login.tab.password": "Passwort-Login",
        "login.passwordLabel": "Passwort",
        "login.passwordPlaceholder": "Passwort eingeben",
        "login.loginButton": "Anmelden",
        "login.passwordError": "Bitte geben Sie Ihr Passwort ein",
        "login.invalidPassword": "Falsches Passwort. Bitte versuchen Sie es erneut.",
        "login.noPasswordSet": "Kein Passwort für diese Nummer festgelegt. Bitte melden Sie sich zuerst mit SMS an und erstellen Sie ein Passwort.",

        "login.setPassword.title": "Permanentes Passwort festlegen",
        "login.setPassword.desc": "Erstellen Sie ein Passwort, um sich beim nächsten Mal sofort ohne SMS-Code anzumelden.",
        "login.setPassword.label": "Neues Passwort",
        "login.setPassword.save": "Passwort Speichern & Weiter",
        "login.setPassword.skip": "Überspringen (Nur SMS verwenden)",
        "login.setPassword.success": "Passwort erfolgreich gespeichert!"
    },
    ru: {
        "login.title": "Cosmic Comet",
        "login.subtitle": "Управление объектами нового поколения с ИИ",
        "login.secureLogin": "Безопасный Вход",
        "login.phoneLabel": "Номер Телефона",
        "login.phonePlaceholder": "9XX XXX XX XX",
        "login.sendSms": "Отправить SMS-код",
        "login.verifyCode": "Код Подтверждения",
        "login.verifyPlaceholder": "6-значный код",
        "login.verifyDesc": "Введите полученный SMS-код",
        "login.changeNumber": "Изменить Номер",
        "login.verifyAndLogin": "Подтвердить и Войти",
        "login.phoneError": "Пожалуйста, введите номер телефона",
        "login.otpError": "Пожалуйста, введите код подтверждения",
        "login.invalidOtp": "Неверный код подтверждения. Пожалуйста, попробуйте еще раз.",
        "login.smsFailed": "Не удалось отправить SMS (Ошибка: {0}). Пожалуйста, проверьте свой номер.",

        "login.tab.sms": "Вход по SMS",
        "login.tab.password": "Вход по Паролю",
        "login.passwordLabel": "Пароль",
        "login.passwordPlaceholder": "Введите ваш пароль",
        "login.loginButton": "Войти",
        "login.passwordError": "Пожалуйста, введите свой пароль",
        "login.invalidPassword": "Неверный пароль. Пожалуйста, попробуйте еще раз.",
        "login.noPasswordSet": "Пароль не установлен для этого номера. Пожалуйста, сначала войдите через SMS и создайте пароль.",

        "login.setPassword.title": "Установить постоянный пароль",
        "login.setPassword.desc": "Создайте пароль, чтобы в следующий раз мгновенно войти без ожидания SMS-кода.",
        "login.setPassword.label": "Новый Пароль",
        "login.setPassword.save": "Сохранить Пароль и Продолжить",
        "login.setPassword.skip": "Пропустить (Только SMS)",
        "login.setPassword.success": "Пароль успешно сохранен!"
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>("tr");

    useEffect(() => {
        const storedLang = localStorage.getItem("app_lang") as Language;
        if (storedLang && ["tr", "en", "de", "ru"].includes(storedLang)) {
            setLanguage(storedLang);
        } else {
            // Auto detect from browser
            const browserLang = navigator.language.slice(0, 2);
            if (["tr", "en", "de", "ru"].includes(browserLang)) {
                setLanguage(browserLang as Language);
            }
        }
    }, []);

    const handleChangeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("app_lang", lang);
    };

    const t = (key: string): string => {
        return translations[language]?.[key] || translations["tr"][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleChangeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within LanguageProvider");
    return context;
}
