param(
    [string]$Title = "SafeGuard AI Alert",
    [string]$Message = "Blocked inappropriate content on this device."
)

try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
    [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

    $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
    $textNodes = $template.GetElementsByTagName("text")
    $textNodes.Item(0).AppendChild($template.CreateTextNode($Title)) | Out-Null
    $textNodes.Item(1).AppendChild($template.CreateTextNode($Message)) | Out-Null

    $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("SafeGuard Parental Control").Show($toast)
} catch {
    # Fallback: System Tray Balloon notification
    Add-Type -AssemblyName System.Windows.Forms
    $notify = New-Object System.Windows.Forms.NotifyIcon
    $notify.Icon = [System.Drawing.SystemIcons]::Shield
    $notify.BalloonTipTitle = $Title
    $notify.BalloonTipText = $Message
    $notify.BalloonTipIcon = "Warning"
    $notify.Visible = $True
    $notify.ShowBalloonTip(5000)
    Start-Sleep -Milliseconds 1500
    $notify.Dispose()
}
