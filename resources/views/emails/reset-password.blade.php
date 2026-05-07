<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 520px;
            margin: 40px auto;
            background: #fff;
            border-radius: 10px;
            padding: 36px;
        }

        .logo {
            font-size: 1.6rem;
            font-weight: 800;
            color: #111;
        }

        .logo span {
            color: #7c3aed;
        }

        h2 {
            color: #111;
            margin-top: 24px;
        }

        p {
            color: #555;
            line-height: 1.6;
        }

        .btn {
            display: inline-block;
            margin: 24px 0;
            padding: 13px 28px;
            background: #7c3aed;
            color: #fff;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
        }

        .note {
            font-size: 0.8rem;
            color: #999;
            margin-top: 24px;
        }

        .url-fallback {
            font-size: 0.75rem;
            color: #aaa;
            word-break: break-all;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="logo">Cirqle<span>.</span></div>
        <h2>Reset your password</h2>
        <p>Hi {{ $userName }},</p>
        <p>We received a request to reset your password.
            Click the button below — the link expires in <strong>15 minutes</strong>.</p>
        <a href="{{ $resetUrl }}" class="btn">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <div class="note">
            If the button doesn't work, copy this link:<br>
            <span class="url-fallback">{{ $resetUrl }}</span>
        </div>
    </div>
</body>

</html>