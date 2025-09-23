<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $song = htmlspecialchars($_POST['song']);
    $notation = htmlspecialchars($_POST['notation']);

    $to = "your-email@example.com";  // your email
    $subject = "New Notation Submission: $song";
    $message = "Name: $name\nEmail: $email\nSong: $song\n\nNotation:\n$notation";

    $headers = "From: $email";

    // Handle file upload
    if (isset($_FILES['file']) && $_FILES['file']['error'] == 0) {
        $uploadDir = 'uploads/';
        if (!is_dir($uploadDir)) { mkdir($uploadDir, 0777, true); }
        $filePath = $uploadDir . basename($_FILES['file']['name']);
        move_uploaded_file($_FILES['file']['tmp_name'], $filePath);

        $message .= "\n\nFile Uploaded: $filePath";
    }

    mail($to, $subject, $message, $headers);

    echo "<p>Thank you! Your notation has been submitted.</p>";
}
?>
