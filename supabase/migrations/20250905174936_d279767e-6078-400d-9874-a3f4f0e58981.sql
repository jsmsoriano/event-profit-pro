-- Fix OTP expiry security warning by reducing OTP token lifetime
UPDATE auth.config 
SET 
  otp_exp = 300,  -- 5 minutes instead of default (likely 3600 seconds = 1 hour)
  otp_length = 6
WHERE id = 'otp';