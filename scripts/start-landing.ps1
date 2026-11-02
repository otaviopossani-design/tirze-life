param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
& node (Join-Path $PSScriptRoot 'build-brand.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar a identidade visual.' }
$landing = Join-Path $projectRoot 'apps\landing'
$logs = Join-Path $projectRoot '.local'
[IO.Directory]::CreateDirectory($logs) | Out-Null
Push-Location $landing
try {
    & node build.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao preparar a landing page.' }
    $listener = Get-NetTCPConnection -State Listen -LocalPort 8082 -ErrorAction SilentlyContinue
    if ($listener) {
        $info = Invoke-RestMethod 'http://localhost:8082/build-info.json' -TimeoutSec 10
        if ($info.brand -ne 'Tirzelife') { throw 'A porta 8082 está ocupada por outro projeto.' }
    } else {
        Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList 'server.mjs' -WorkingDirectory $landing -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'landing.log') -RedirectStandardError (Join-Path $logs 'landing.err.log')
    }
} finally { Pop-Location }
$ready = $false
for ($attempt=0; $attempt -lt 15; $attempt++) {
    try {
        $response = Invoke-WebRequest 'http://127.0.0.1:8082' -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) { $ready=$true; break }
    } catch { Start-Sleep -Milliseconds 300 }
}
if (!$ready) { throw 'A landing page não iniciou. Consulte .local/landing.err.log.' }
Write-Output 'Landing page: http://localhost:8082'
if (!$NoBrowser) { Start-Process 'http://localhost:8082' }
