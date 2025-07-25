<!DOCTYPE html>
<?php header("Content-Type: text/html; charset=UTF-8"); ?>
<html>
<head>
    <title>Website Dalam Pemeliharaan</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Website sedang dalam pemeliharaan">
    <meta name="theme-color" content="#2c3e50">
    <style>
        @keyframes colorPulse {
            0% { background-color: #f5f5f5; }
            50% { background-color: #e8e8e8; }
            100% { background-color: #f5f5f5; }
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
            animation: colorPulse 3s infinite;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 style="text-align: center;">🛠️ SEDANG DALAM PEMELIHARAAN</h1>
        <p style="text-align: center; font-size: 1.2em;">Mohon maaf, website sedang dalam perbaikan dan akan segera kembali online.</p>
        <div style="text-align: center; margin: 40px 0;">
            <div style="width: 100px; height: 100px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 50px; animation: spin 2s linear infinite;">⚙️</span>
            </div>
        </div>
    </div>
    <footer style="text-align: center; margin-top: 40px; color: #666;">
        &copy; 2024 - Akan kembali segera
    </footer>
</body>
</html>
