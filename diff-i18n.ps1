function Get-JsonKeys($obj, $prefix) {
    foreach ($p in $obj.PSObject.Properties) {
        $k = if ($prefix) { "$prefix.$($p.Name)" } else { $p.Name }
        if ($p.Value -is [PSCustomObject]) {
            Get-JsonKeys $p.Value $k
        } else {
            $k
        }
    }
}

$zh = Get-Content 'i18n/locales/zh.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$en = Get-Content 'i18n/locales/en.json' -Raw -Encoding UTF8 | ConvertFrom-Json

$zhKeys = @(Get-JsonKeys $zh '')
$enKeys = @(Get-JsonKeys $en '')

$onlyZh = $zhKeys | Where-Object { $_ -notin $enKeys }
$onlyEn = $enKeys | Where-Object { $_ -notin $zhKeys }

Write-Host "=== zh.json 有但 en.json 缺失 ($($onlyZh.Count) 个) ==="
$onlyZh | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "=== en.json 有但 zh.json 缺失 ($($onlyEn.Count) 个) ==="
$onlyEn | ForEach-Object { Write-Host "  $_" }
