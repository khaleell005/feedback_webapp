<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    die(json_encode(['success' => false, 'error' => 'Method not allowed']));
}

require_once 'db.php';

try {
    $stmt = $pdo->query(
        "SELECT id, name, email, message, created_at FROM feedback ORDER BY created_at DESC"
    );
    $rows = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $rows]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch feedback.']);
}
