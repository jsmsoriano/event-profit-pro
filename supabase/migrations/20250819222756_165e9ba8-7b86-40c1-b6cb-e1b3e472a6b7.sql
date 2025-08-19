-- Fix OTP expiry security warning
-- The current OTP expiry exceeds recommended threshold
-- Setting it to the recommended 24 hours (86400 seconds)
UPDATE auth.config 
SET value = '86400'
WHERE parameter = 'token_expiry_otp';