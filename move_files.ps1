$files = git ls-tree -r --name-only HEAD | Where-Object { $_ -ne "README.md" -and $_ -ne "merge_repos.bat" -and $_ -ne "merge_repos.sh" -and $_ -ne "move_files.ps1" }
foreach ($file in $files) {
    $directory = Split-Path -Path $file -Parent
    if ($directory) {
        $targetDir = Join-Path -Path "backend" -ChildPath $directory
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }
        git mv $file "backend/$file"
    } else {
        git mv $file "backend/$file"
    }
}