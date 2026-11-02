param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
& node (Join-Path $PSScriptRoot 'build-brand.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Falha ao gerar a identidade visual.' }
# Use the full Windows profile path: short 8.3 paths can crash Metro's file watcher.
$runtime = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'Temp\tirze-life-runtime'
$mobile = Join-Path $runtime 'apps\mobile'
$logs = Join-Path $projectRoot '.local'
[IO.Directory]::CreateDirectory($mobile) | Out-Null
[IO.Directory]::CreateDirectory($logs) | Out-Null
& robocopy (Join-Path $projectRoot 'apps\mobile') $mobile /E /XD node_modules .expo dist /XF .env .env.local /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -gt 7) { throw 'Falha ao sincronizar o front-end.' }
& robocopy (Join-Path $projectRoot 'fixtures') (Join-Path $runtime 'fixtures') /E /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -gt 7) { throw 'Falha ao sincronizar as fixtures.' }
Copy-Item -LiteralPath (Join-Path $projectRoot 'package.json') -Destination (Join-Path $runtime 'package.json')
$cli = Join-Path $mobile 'node_modules\expo\bin\cli'
$lock = Join-Path $mobile 'package-lock.json'
$stamp = Join-Path $runtime 'mobile-dependencies.sha256'
$hash = (Get-FileHash -LiteralPath $lock -Algorithm SHA256).Hash
$previous = if (Test-Path -LiteralPath $stamp) { [IO.File]::ReadAllText($stamp).Trim() } else { '' }
if (!(Test-Path -LiteralPath $cli) -or $previous -ne $hash) {
    Push-Location $mobile
    try {
        & npm.cmd ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar as dependências.' }
        [IO.File]::WriteAllText($stamp, $hash)
    } finally { Pop-Location }
}
$listener = Get-NetTCPConnection -State Listen -LocalPort 8081 -ErrorAction SilentlyContinue
if ($listener) {
    $html = (Invoke-WebRequest 'http://localhost:8081' -UseBasicParsing -TimeoutSec 10).Content
    if ($html -notmatch 'Tirze-Life') { throw 'A porta 8081 está ocupada por outro projeto.' }
} else {
    Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList @(('"' + $cli + '"'),'start','--localhost','--port','8081') -WorkingDirectory $mobile -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'frontend.log') -RedirectStandardError (Join-Path $logs 'frontend.err.log')
}
$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
        $response = Invoke-WebRequest 'http://localhost:8081' -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) { $ready = $true; break }
    } catch { Start-Sleep -Milliseconds 500 }
}
if (!$ready) { throw 'A prévia não iniciou. Consulte .local/frontend.err.log.' }
Write-Output 'Prévia: http://localhost:8081'
if (!$NoBrowser) { Start-Process 'http://localhost:8081' }
