# Firebase Configuration Guide (Agent 2 Directive)

You are seeing infinite loading or permission errors because the app is using `dummy-key` placeholders as it cannot find real Google Cloud keys.

**How to Fix This Immediately:**
1. Open the `.env.local` file located in the root directory.
2. Replace all empty `""` strings with your actual Firebase Project Settings.
3. Your `.env.local` MUST look exactly like this structure:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyA..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="12345678"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456:web:abcd123"
```
4. Restart the development server (`npm run dev`) after saving the file. Wait for the terminal to rebuild.
5. The `console.warn` regarding `FIREBASE CONFIG MISSING` in your browser terminal will disappear, signifying successful connection.
