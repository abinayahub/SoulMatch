$env:BASE_PATH="/"
$env:PORT="5173"
npm run build
npx cap sync
cd android
./gradlew assembleDebug
if ($?) {
  & "C:\Users\91638\AppData\Local\Android\Sdk\platform-tools\adb.exe" install -r "c:\Users\91638\Desktop\SoulMatch App\Soul-Match-AI\artifacts\soulmatch\android\app\build\outputs\apk\debug\app-debug.apk"
  & "C:\Users\91638\AppData\Local\Android\Sdk\platform-tools\adb.exe" shell monkey -p com.soulmatch.app -c android.intent.category.LAUNCHER 1
}
