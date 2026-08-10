Dim objShell, objFSO, scriptDir, electronExe
Set objFSO = CreateObject("Scripting.FileSystemObject")
scriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
Set objShell = CreateObject("WScript.Shell")
electronExe = "C:\Users\User\AppData\Local\shared-electron-catcoon\electron\dist\electron.exe"
objShell.Run """" & electronExe & """ """ & scriptDir & """", 0, False
