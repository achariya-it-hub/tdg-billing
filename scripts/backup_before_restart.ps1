$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$backupDir = "D:\TDG-Billing\server\backups\pre-restart-$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$files = @(
    "D:\TDG-Billing\server\db.json",
    "D:\TDG-Billing\server\frozen-menu.json",
    "D:\TDG-Billing\server\billing.db",
    "D:\TDG-Billing\server\sales_vault_LOCK.json",
    "D:\TDG-Billing\server\settings_vault_LOCK.json",
    "D:\TDG-Billing\server\customer_vault_LOCK.json",
    "D:\TDG-Billing\server\inventory_vault_LOCK.json",
    "D:\TDG-Billing\server\menu_vault.json",
    "D:\TDG-Billing\server\frozen_menu_LOCK.json",
    "D:\TDG-Billing\server\menu_backup_LOCK.json"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        Copy-Item $f -Destination $backupDir
        Write-Host "Backed up: $(Split-Path $f -Leaf)"
    } else {
        Write-Host "SKIPPED (not found): $(Split-Path $f -Leaf)"
    }
}

Write-Host ""
Write-Host "=== Backup Complete ==="
Write-Host "Location: $backupDir"
Write-Host ""
Get-ChildItem $backupDir | Select-Object Name, @{N='Size_MB';E={[math]::Round($_.Length/1MB, 2)}} | Format-Table -AutoSize
