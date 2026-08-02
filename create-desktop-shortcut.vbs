Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
strCurrentDir = WshShell.CurrentDirectory

Set oShellLink = WshShell.CreateShortcut(strDesktop & "\TDG Billing POS.lnk")
oShellLink.TargetPath = strCurrentDir & "\start-tdg-billing.bat"
oShellLink.WorkingDirectory = strCurrentDir
oShellLink.WindowStyle = 7 ' Minimized window
oShellLink.Description = "Launch TDG Billing POS Local Application"
oShellLink.Save

WScript.Echo "Desktop Shortcut 'TDG Billing POS' created successfully on your Desktop!"
