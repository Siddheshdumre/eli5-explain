# One-command local start for ELI5 Universe Builder (Windows).
#   Double-click start.bat, or run:  powershell -ExecutionPolicy Bypass -File start.ps1
# Installs anything missing, starts the backend (new window) and the frontend (this window).

# Native tools (pip, npm) print warnings to stderr; check exit codes explicitly instead.
$ErrorActionPreference = "Continue"

$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$venvPython = Join-Path $backend "venv\Scripts\python.exe"
$requirements = Join-Path $backend "requirements.txt"
$requirementsStamp = Join-Path $backend "venv\.requirements.sha256"

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Warn($msg) { Write-Host "    ! $msg" -ForegroundColor Yellow }
function Fail($msg) { Write-Host "`nERROR: $msg" -ForegroundColor Red; exit 1 }

# ---------- Prerequisites ----------
Step "Checking prerequisites"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fail "Node.js is not installed. Get v20+ from https://nodejs.org" }
Write-Host "    Node $(node -v)"

# ---------- Backend: virtual environment + dependencies ----------
if (-not (Test-Path $venvPython)) {
    Step "Creating Python virtual environment (backend\venv)"
    Push-Location $backend
    # Prefer 3.13/3.12/3.11: AI libraries often lag behind the newest Python release
    $pyFlag = $null
    if (Get-Command py -ErrorAction SilentlyContinue) {
        $installed = (& py -0) | Out-String
        foreach ($v in "3.13", "3.12", "3.11") {
            if ($installed -match "V:$([regex]::Escape($v))\b") { $pyFlag = "-$v"; break }
        }
    }
    if ($pyFlag) { & py $pyFlag -m venv venv }
    elseif (Get-Command python -ErrorAction SilentlyContinue) { & python -m venv venv }
    else { Pop-Location; Fail "Python is not installed. Get 3.12 or 3.13 from https://www.python.org/downloads/" }
    $code = $LASTEXITCODE
    Pop-Location
    if ($code -ne 0) { Fail "Could not create backend\venv" }
}

# Reinstall only when requirements.txt changes
$requirementsHash = (Get-FileHash $requirements -Algorithm SHA256).Hash
$installedHash = if (Test-Path $requirementsStamp) { (Get-Content $requirementsStamp -Raw).Trim() } else { "" }
if ($requirementsHash -ne $installedHash) {
    Step "Installing backend dependencies (first run takes a few minutes)"
    & $venvPython -m pip install --disable-pip-version-check -r $requirements
    if ($LASTEXITCODE -ne 0) { Fail "pip install failed (see output above)" }
    Set-Content -Path $requirementsStamp -Value $requirementsHash
}

# ---------- Frontend: node_modules ----------
$lockFile = Join-Path $root "package-lock.json"
$installedLock = Join-Path $root "node_modules\.package-lock.json"
if (-not (Test-Path $installedLock) -or (Get-Item $lockFile).LastWriteTime -gt (Get-Item $installedLock).LastWriteTime) {
    Step "Installing frontend dependencies"
    Push-Location $root
    & npm ci
    $code = $LASTEXITCODE
    Pop-Location
    if ($code -ne 0) { Fail "npm ci failed (see output above)" }
}

# ---------- Env files ----------
Step "Checking env files"
function Test-EnvKeys($file, $keys, $purpose) {
    $path = Join-Path $root $file
    if (-not (Test-Path $path)) { Warn "$file is missing. Create it from the matching block in env.example."; return }
    $lines = Get-Content $path
    foreach ($key in $keys) {
        if (-not ($lines -match "^$key=\S+")) { Warn "$key is empty in $file ($purpose)" }
    }
}
Test-EnvKeys "backend\.env" @("GROQ_API_KEY") "answers will fail until it is set"
Test-EnvKeys "backend\.env" @("SUPABASE_URL", "SUPABASE_ANON_KEY") "login + chat history disabled; guest mode still works"
Test-EnvKeys ".env" @("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY") "login + chat history disabled; guest mode still works"

# ---------- Start backend (separate window) ----------
if (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue) {
    Step "Backend already running on port 8000, reusing it (close that window to restart it)"
} else {
    Step "Starting backend on http://127.0.0.1:8000 (new window: 'ELI5 backend')"
    Start-Process powershell -WorkingDirectory $backend -ArgumentList "-NoExit", "-Command",
        "`$Host.UI.RawUI.WindowTitle = 'ELI5 backend'; & '.\venv\Scripts\python.exe' -m uvicorn main:app --port 8000"
}

$health = $null
for ($i = 0; $i -lt 40 -and -not $health; $i++) {
    try { $health = Invoke-RestMethod "http://127.0.0.1:8000/api/health" -TimeoutSec 2 }
    catch { Start-Sleep -Milliseconds 750 }
}
if ($health) {
    Write-Host "    Backend is up. groq=$($health.groq_api)  supabase=$($health.supabase)  web-search=$($health.tavily_api)" -ForegroundColor Green
} else {
    Warn "Backend did not respond yet. Check the 'ELI5 backend' window for errors."
}

# ---------- Start frontend (this window) ----------
Step "Starting frontend on http://localhost:8080 (Ctrl+C to stop; close the backend window separately)"
Push-Location $root
& npx vite --open
Pop-Location
