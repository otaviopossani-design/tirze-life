param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$runtime = Join-Path ([IO.Path]::GetTempPath()) 'tirze-life-runtime'
$mobile = Join-Path $runtime 'apps\mobile'
$api = Join-Path $projectRoot 'apps\api-engine'
$logs = Join-Path $projectRoot '.local'
[IO.Directory]::CreateDirectory($runtime) | Out-Null
[IO.Directory]::CreateDirectory($logs) | Out-Null

# Copiar fontes sem transportar node_modules ou credenciais.
& robocopy (Join-Path $projectRoot 'apps\mobile') $mobile /E /XD node_modules .expo dist /XF .env .env.local /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -gt 7) { throw 'Falha ao copiar o mobile para a pasta temporária.' }
& robocopy (Join-Path $projectRoot 'fixtures') (Join-Path $runtime 'fixtures') /E /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -gt 7) { throw 'Falha ao copiar as fixtures.' }
Copy-Item -LiteralPath (Join-Path $projectRoot 'package.json') -Destination (Join-Path $runtime 'package.json')

$lock = Join-Path $mobile 'package-lock.json'
$stamp = Join-Path $runtime 'mobile-dependencies.sha256'
$hash = (Get-FileHash -LiteralPath $lock -Algorithm SHA256).Hash
$previous = if (Test-Path -LiteralPath $stamp) { [IO.File]::ReadAllText($stamp).Trim() } else { '' }
if ($hash -ne $previous -or !(Test-Path -LiteralPath (Join-Path $mobile 'node_modules\expo\bin\cli'))) {
    Push-Location $mobile
    try {
        & npm.cmd ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar as dependências do mobile.' }
        [IO.File]::WriteAllText($stamp, $hash)
    } finally { Pop-Location }
}
$python = Join-Path $api '.venv\Scripts\python.exe'
if (!(Test-Path -LiteralPath $python)) {
    & python -m venv (Join-Path $api '.venv')
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar ambiente Python.' }
}
$requirements = Join-Path $api 'requirements.lock.txt'
& $python -m pip install -r $requirements --quiet
if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar dependências da API.' }

$apiListener = Get-NetTCPConnection -State Listen -LocalPort 8010 -ErrorAction SilentlyContinue
if ($apiListener) {
    try { $health = Invoke-RestMethod 'http://127.0.0.1:8010/health' -TimeoutSec 3 }
    catch { throw 'A porta 8010 está ocupada por outro serviço.' }
    if ($health.model -ne 'tirzepatide-project-v1') { throw 'A porta 8010 pertence a outro aplicativo.' }
} else {
    Start-Process -FilePath $python -ArgumentList @('-m','uvicorn','main:app','--host','127.0.0.1','--port','8010','--no-access-log') -WorkingDirectory $api -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'api.log') -RedirectStandardError (Join-Path $logs 'api.err.log')
}
$webListener = Get-NetTCPConnection -State Listen -LocalPort 8081 -ErrorAction SilentlyContinue
if ($webListener) {
    $owner = Get-CimInstance Win32_Process -Filter ("ProcessId = " + $webListener[0].OwningProcess)
    $expectedCommand = Join-Path $mobile 'node_modules\expo\bin\cli'
    # Servidor criado pelo script contém o caminho completo desta cópia.
    # A primeira execução assistida pode usar caminho relativo; o HTML precisa identificar Tirze-Life.
    $html = (Invoke-WebRequest 'http://localhost:8081' -UseBasicParsing -TimeoutSec 5).Content
    if ($html -notmatch 'Tirze-Life') { throw 'A porta 8081 está ocupada por outro app.' }
} else {
    $node = (Get-Command node.exe).Source
    $cli = Join-Path $mobile 'node_modules\expo\bin\cli'
    Start-Process -FilePath $node -ArgumentList @(('"' + $cli + '"'),'start','--localhost','--port','8081') -WorkingDirectory $mobile -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'web.log') -RedirectStandardError (Join-Path $logs 'web.err.log')
}

$ready = $false
for ($attempt = 0; $attempt -lt 60; $attempt++) {
    try {
        $health = Invoke-RestMethod 'http://127.0.0.1:8010/health' -TimeoutSec 2
        $web = Invoke-WebRequest 'http://localhost:8081' -UseBasicParsing -TimeoutSec 2
        if ($health.status -eq 'ok' -and $web.StatusCode -eq 200) { $ready = $true; break }
    } catch { Start-Sleep -Milliseconds 500 }
}
if (!$ready) { throw "Servidores não iniciaram. Consulte os logs em $logs." }
Write-Output 'App: http://localhost:8081'
Write-Output 'API: http://localhost:8010/docs'
if (!$NoBrowser) { Start-Process 'http://localhost:8081' }
