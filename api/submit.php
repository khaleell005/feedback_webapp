<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'error' => 'Method not allowed']));
}

require_once 'db.php';

// ─── Read + sanitize input ────────────────────────────────────────────────
$name    = trim(htmlspecialchars($_POST['name']    ?? '', ENT_QUOTES, 'UTF-8'));
$email   = trim(htmlspecialchars($_POST['email']   ?? '', ENT_QUOTES, 'UTF-8'));
$message = trim(htmlspecialchars($_POST['message'] ?? '', ENT_QUOTES, 'UTF-8'));

// ─── Server-side validation ───────────────────────────────────────────────
$errors = [];

if (empty($name))              $errors[] = 'Name is required.';
if (strlen($name) > 100)       $errors[] = 'Name must be under 100 characters.';

if (empty($email))             $errors[] = 'Email is required.';
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Email is invalid.';

if (empty($message))           $errors[] = 'Feedback message is required.';
if (strlen($message) > 5000)   $errors[] = 'Message must be under 5000 characters.';

if (!empty($errors)) {
    http_response_code(422);
    die(json_encode(['success' => false, 'errors' => $errors]));
}

// ─── Insert with prepared statement ──────────────────────────────────────
try {
    $stmt = $pdo->prepare(
        "INSERT INTO feedback (name, email, message) VALUES (:name, :email, :message)"
    );
    $stmt->execute([
        ':name'    => $name,
        ':email'   => $email,
        ':message' => $message,
    ]);

    echo json_encode(['success' => true, 'message' => 'Feedback submitted successfully!']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save feedback.']);
}
