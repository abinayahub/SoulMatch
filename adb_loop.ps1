while($true) {
    & "C:\Users\91638\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:5000 tcp:5000
    Start-Sleep -Seconds 2
}
