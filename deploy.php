<?php
/**
 * Neblina Stereo 105.5 FM - Webhook Deployer
 * Despliegue seguro y automático desde GitHub
 */
$SECRET_KEY = 'Neblina2026_SecureDeployKey!@#';

$incoming_key = isset($_GET['key']) ? $_GET['key'] : (isset($_POST['key']) ? $_POST['key'] : '');
if ($incoming_key !== $SECRET_KEY) {
    http_response_code(403);
    die(json_encode(['status' => 'error', 'message' => 'Acceso denegado: Clave inválida.']));
}

$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : 'borrador');

$repoDir = '/home/sites/17a/3/3b9ccaa27e/repositories/web-neblina-test';
$targetDir = ($action === 'publico') 
    ? '/home/sites/17a/3/3b9ccaa27e/public_html/' 
    : '/home/sites/17a/3/3b9ccaa27e/public_html/test/';

if (!is_dir($targetDir)) {
    @mkdir($targetDir, 0755, true);
}

// 1. Ejecutar git pull en el repositorio
$branch = ($action === 'publico') ? 'main' : 'staging';
$output = [];
$return_var = 0;

exec("cd $repoDir && git fetch origin && git checkout $branch && git pull origin $branch 2>&1", $output, $return_var);

// 2. Copiar archivos desde dist a la carpeta destino
$distDir = $repoDir . '/dist';
$copyOutput = [];
if (is_dir($distDir)) {
    exec("cp -rf $distDir/* $targetDir 2>&1", $copyOutput);
    if (file_exists($distDir . '/.htaccess')) {
        @copy($distDir . '/.htaccess', $targetDir . '/.htaccess');
    }
}

echo json_encode([
    'status' => 'success',
    'action' => $action,
    'branch' => $branch,
    'target' => $targetDir,
    'git_output' => $output,
    'copy_output' => $copyOutput
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
