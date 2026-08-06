# ============================================================
#  TDG Billing — Local PC Auto-Backup Script
#  Saves a full backup from tendengyros.com to this PC daily.
#  Schedule via Windows Task Scheduler to run every night.
# ============================================================

# ─── CONFIGURATION ──────────────────────────────────────────
$SERVER_URL   = "https://tendengyros.com"
$BACKUP_KEY   = "tdg-local-backup-2026"       # Must match BACKUP_SECRET_KEY on server
$BACKUP_FOLDER = "C:\TDG-Backups"             # Where backups are saved on this PC
$KEEP_DAYS    = 30                             # Number of daily backups to keep
# ────────────────────────────────────────────────────────────

# Create backup folder if it doesn't exist
if (-not (Test-Path $BACKUP_FOLDER)) {
    New-Item -ItemType Directory -Path $BACKUP_FOLDER -Force | Out-Null
    Write-Host "[TDG Backup] Created backup folder: $BACKUP_FOLDER"
}

# Build filename with date and time
$dateStr = Get-Date -Format "yyyy-MM-dd"
$timeStr = Get-Date -Format "HH-mm-ss"
$fileName = "tdg-backup-${dateStr}_${timeStr}.json"
$filePath = Join-Path $BACKUP_FOLDER $fileName

# Download backup from server
$url = "${SERVER_URL}/api/backup/local?key=${BACKUP_KEY}"
Write-Host "[TDG Backup] Downloading backup from $SERVER_URL ..."

try {
    $response = Invoke-WebRequest -Uri $url -OutFile $filePath -UseBasicParsing -TimeoutSec 30
    $size = [math]::Round((Get-Item $filePath).Length / 1KB, 1)
    Write-Host "[TDG Backup] ✅ Saved: $fileName ($size KB)"
} catch {
    Write-Host "[TDG Backup] ❌ Download failed: $_"
    # Log the error
    $errorLog = Join-Path $BACKUP_FOLDER "backup-errors.log"
    "$(Get-Date) - ERROR: $_" | Add-Content $errorLog
    exit 1
}

# Verify the backup is valid JSON and has data
try {
    $data = Get-Content $filePath -Raw | ConvertFrom-Json
    $ordersCount = if ($data.orders) { $data.orders.Count } else { 0 }
    $menuCount   = if ($data.menuItems) { $data.menuItems.Count } else { 0 }
    Write-Host "[TDG Backup] ✅ Verified: $ordersCount orders, $menuCount menu items"
    
    # Write a summary log
    $logFile = Join-Path $BACKUP_FOLDER "backup-log.txt"
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | OK | $fileName | Orders: $ordersCount | Menu: $menuCount | Size: ${size}KB" | Add-Content $logFile
} catch {
    Write-Host "[TDG Backup] ⚠️  Warning: Could not verify backup content: $_"
}

# Clean up old backups — keep only last $KEEP_DAYS days
$allBackups = Get-ChildItem $BACKUP_FOLDER -Filter "tdg-backup-*.json" | Sort-Object Name -Descending
$toDelete = $allBackups | Select-Object -Skip $KEEP_DAYS
foreach ($old in $toDelete) {
    Remove-Item $old.FullName -Force
    Write-Host "[TDG Backup] 🗑️  Removed old backup: $($old.Name)"
}

Write-Host "[TDG Backup] Done. Backups stored in: $BACKUP_FOLDER"
Write-Host "[TDG Backup] Total backups kept: $([Math]::Min($allBackups.Count, $KEEP_DAYS))"
