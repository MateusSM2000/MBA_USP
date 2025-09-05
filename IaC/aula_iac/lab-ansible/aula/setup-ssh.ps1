# PowerShell Script para configuração SSH no Windows
# Versão compatível com Windows do setup-ssh.sh

# Função para verificar se está executando como Administrador
function Test-IsAdmin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Função para configurar permissões básicas sem privilégios administrativos
function Set-BasicPermissions {
    param([string]$FilePath)
    
    try {
        # Usar attrib para tornar arquivo somente leitura (mais seguro)
        if ($FilePath -like "*id_rsa" -and $FilePath -notlike "*.pub") {
            # Chave privada - tornar somente leitura para o proprietário
            attrib +R "$FilePath" 2>$null
            Write-Host "  Permissões básicas aplicadas em $FilePath"
        }
        return $true
    }
    catch {
        Write-Warning "  Não foi possível configurar permissões em $FilePath"
        return $false
    }
}

Write-Host "=== Setup SSH para Windows ==="
Write-Host ""

# Verificar privilégios
$isAdmin = Test-IsAdmin
if (-not $isAdmin) {
    Write-Warning "Executando sem privilégios administrativos."
    Write-Warning "Para permissões mais seguras, execute como Administrador."
    Write-Host ""
}

# Removendo diretório para chaves SSH
if (Test-Path "./ssh_keys") {
    Write-Host "Removendo diretório ssh_keys existente..."
    try {
        Remove-Item -Path "./ssh_keys" -Recurse -Force -ErrorAction Stop
        Write-Host "  Diretório removido com sucesso"
    }
    catch {
        Write-Error "Falha ao remover diretório ssh_keys: $_"
        exit 1
    }
}

# Criar diretório para chaves SSH
Write-Host "Criando diretório ssh_keys..."
try {
    New-Item -ItemType Directory -Path "ssh_keys" -Force -ErrorAction Stop | Out-Null
    Write-Host "  Diretório criado com sucesso"
}
catch {
    Write-Error "Falha ao criar diretório ssh_keys: $_"
    exit 1
}

# Gerar par de chaves SSH se não existir
if (-not (Test-Path "ssh_keys/id_rsa")) {
    Write-Host "Gerando chaves SSH..."
    
    # Verificar se ssh-keygen está disponível
    try {
        $sshKeygenPath = Get-Command ssh-keygen -ErrorAction Stop
        Write-Host "  ssh-keygen encontrado em: $($sshKeygenPath.Source)"
    }
    catch {
        Write-Host ""
        Write-Error "ssh-keygen não encontrado!"
        Write-Host ""
        Write-Host "Para instalar OpenSSH no Windows:"
        Write-Host "1. Método 1 (Recomendado): Instale Git for Windows"
        Write-Host "   - Download: https://git-scm.com/download/windows"
        Write-Host "   - Inclui ssh-keygen e outras ferramentas SSH"
        Write-Host ""
        Write-Host "2. Método 2: Instalar OpenSSH via Windows"
        Write-Host "   - Windows 10/11: Configurações > Aplicativos > Recursos Opcionais"
        Write-Host "   - Adicione 'Cliente OpenSSH'"
        Write-Host ""
        Write-Host "3. Método 3: PowerShell como Administrador"
        Write-Host "   - Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0"
        Write-Host ""
        exit 1
    }
    
    # Gerar chave SSH
    Write-Host "  Executando ssh-keygen..."
    $sshKeygenArgs = @("-t", "rsa", "-b", "4096", "-f", "ssh_keys/id_rsa", "-N", '""', "-C", "ansible@test")
    
    try {
        $process = Start-Process -FilePath "ssh-keygen" -ArgumentList $sshKeygenArgs -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -ne 0) {
            throw "ssh-keygen falhou com código: $($process.ExitCode)"
        }
        
        Write-Host "  Chaves geradas com sucesso"
    }
    catch {
        Write-Error "Falha ao gerar chaves SSH: $_"
        exit 1
    }
    
    # Verificar se as chaves foram criadas
    if (-not (Test-Path "ssh_keys/id_rsa") -or -not (Test-Path "ssh_keys/id_rsa.pub")) {
        Write-Error "Chaves SSH não foram criadas corretamente"
        exit 1
    }
    
    # Criar arquivo authorized_keys
    Write-Host "  Criando arquivo authorized_keys..."
    try {
        Copy-Item "ssh_keys/id_rsa.pub" "ssh_keys/authorized_keys" -ErrorAction Stop
        Write-Host "  authorized_keys criado com sucesso"
    }
    catch {
        Write-Error "Falha ao criar authorized_keys: $_"
        exit 1
    }
    
    # Configurar permissões básicas
    Write-Host "  Configurando permissões básicas..."
    Set-BasicPermissions "ssh_keys/id_rsa" | Out-Null
    
    if (-not $isAdmin) {
        Write-Host ""
        Write-Warning "NOTA: Para melhor segurança das chaves SSH, considere:"
        Write-Warning "1. Executar este script como Administrador, ou"
        Write-Warning "2. Configurar permissões manualmente nas chaves"
        Write-Host ""
    }
    
    Write-Host "Chaves SSH criadas com sucesso!"
} else {
    Write-Host "Chaves SSH já existem."
}

Write-Host ""
Write-Host "Setup concluído!"
Write-Host ""
Write-Host "Para usar:"
Write-Host "2. Execute: docker-compose up -d"
Write-Host "3. Teste SSH: docker exec -it ansible-control ssh root@target-server"
Write-Host ""
Write-Host "Nota: No Windows, certifique-se de que o Docker Desktop está rodando"
Write-Host "e que os volumes estão compartilhados corretamente."