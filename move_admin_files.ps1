$files = git ls-tree -r --name-only HEAD | Where-Object { $_ -ne "README.md" -and $_ -ne "merge_repos.bat" -and $_ -ne "merge_repos.sh" -and $_ -ne "move_files.ps1" -and $_ -ne "move_admin_files.ps1" }
foreach ($file in $files) {
    $directory = Split-Path -Path $file -Parent
    if ($directory) {
        $targetDir = Join-Path -Path "admin" -ChildPath $directory
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        git mv $file "admin/$file"
    } else {
        git mv $file "admin/$file"
    }
}