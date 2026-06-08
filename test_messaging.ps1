# Test messaging API
$studentToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTgsImlhdCI6MTc4MDg1NTA1NSwiZXhwIjoxNzgxNDU5ODU1fQ.5LwyZxuHkNoPJ3Md8RmNF4AJUs5vNw9QUK8jyCrk3Qk"
$messagePayload = @{ recipientId = 6; content = "Hi Dr. Saiful, I am interested in learning Mathematics" } | ConvertTo-Json

Write-Host "Testing Message Sending..."
try {
    $sendResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/messages" -Method POST -Headers @{ "Content-Type" = "application/json"; "Authorization" = "Bearer $studentToken" } -Body $messagePayload -UseBasicParsing
    Write-Host "[OK] Send Status: $($sendResponse.StatusCode)" -ForegroundColor Green
    Write-Host "[OK] Response: $($sendResponse.Content)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Message Retrieval..."
try {
    $getResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/messages?otherId=6" -Headers @{ "Authorization" = "Bearer $studentToken" } -UseBasicParsing
    Write-Host "[OK] Get Status: $($getResponse.StatusCode)" -ForegroundColor Green
    $messages = $getResponse.Content | ConvertFrom-Json
    Write-Host "[OK] Messages Count: $($messages.messages.Count)" -ForegroundColor Green
    if ($messages.messages.Count -gt 0) {
        Write-Host "[OK] Latest Message: '$($messages.messages[-1].content)'" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}
