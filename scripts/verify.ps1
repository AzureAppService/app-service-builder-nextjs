param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern("^https?://")]
    [string]$BaseUrl
)

$ErrorActionPreference = "Stop"
$base = $BaseUrl.TrimEnd("/")

function Assert-Response {
    param(
        [string]$Path,
        [int]$ExpectedStatus,
        [string]$ExpectedContent,
        [hashtable]$ExpectedHeaders = @{}
    )

    try {
        $response = Invoke-WebRequest -Uri "$base$Path" -SkipHttpErrorCheck
    }
    catch {
        throw "Request to $Path failed: $($_.Exception.Message)"
    }

    if ($response.StatusCode -ne $ExpectedStatus) {
        throw "$Path returned $($response.StatusCode); expected $ExpectedStatus."
    }

    if ($ExpectedContent -and $response.Content -notmatch [regex]::Escape($ExpectedContent)) {
        throw "$Path did not contain expected content: $ExpectedContent"
    }

    foreach ($header in $ExpectedHeaders.GetEnumerator()) {
        $actual = $response.Headers[$header.Key] -join ","
        if ($actual -ne $header.Value) {
            throw "$Path header $($header.Key) was '$actual'; expected '$($header.Value)'."
        }
    }

    Write-Host "PASS $Path ($ExpectedStatus)"
}

function Assert-Redirect {
    param(
        [string]$Path,
        [int]$ExpectedStatus,
        [string]$ExpectedLocation
    )

    $handler = [System.Net.Http.HttpClientHandler]::new()
    $handler.AllowAutoRedirect = $false
    $client = [System.Net.Http.HttpClient]::new($handler)

    try {
        $response = $client.GetAsync("$base$Path").GetAwaiter().GetResult()
        $statusCode = [int]$response.StatusCode
        $location = $response.Headers.Location.OriginalString

        if ($statusCode -ne $ExpectedStatus) {
            throw "$Path returned $statusCode; expected $ExpectedStatus."
        }

        if ($location -ne $ExpectedLocation) {
            throw "$Path redirected to '$location'; expected '$ExpectedLocation'."
        }

        Write-Host "PASS $Path ($ExpectedStatus -> $ExpectedLocation)"
    }
    finally {
        $client.Dispose()
        $handler.Dispose()
    }
}

Assert-Response -Path "/" -ExpectedStatus 200 -ExpectedContent "Next.js App Router is running"
Assert-Response -Path "/" -ExpectedStatus 200 -ExpectedContent "/_next/static/chunks/"
Assert-Response -Path "/dynamic" -ExpectedStatus 200 -ExpectedContent "Dynamic server-rendered page"
Assert-Response -Path "/products/widget-1" -ExpectedStatus 200 -ExpectedContent "Widget 1"
Assert-Response -Path "/products/unknown" -ExpectedStatus 404 -ExpectedContent "Next.js page not found"
Assert-Response -Path "/api/version" -ExpectedStatus 200 -ExpectedContent '"app":"app-service-builder-nextjs"'
Assert-Response -Path "/api/health" -ExpectedStatus 200 -ExpectedContent '"status":"ok"'
Assert-Response -Path "/health" -ExpectedStatus 200 -ExpectedContent '"status":"ok"'
Assert-Response -Path "/middleware-check" -ExpectedStatus 200 -ExpectedContent "Proxy check reached the App Router" -ExpectedHeaders @{
    "x-builder-apps-proxy" = "active"
}
Assert-Response -Path "/server-action" -ExpectedStatus 200 -ExpectedContent "Submit data to the server"
Assert-Response -Path "/shape.png" -ExpectedStatus 200 -ExpectedContent ""
Assert-Response -Path "/_next/image?url=%2Fshape.png&w=256&q=75" -ExpectedStatus 200 -ExpectedContent ""
Assert-Redirect -Path "/legacy" -ExpectedStatus 307 -ExpectedLocation "/"
Assert-Response -Path "/missing-page" -ExpectedStatus 404 -ExpectedContent "Next.js page not found"

Write-Host "All Next.js App Router endpoint checks passed."
