-- Fix test accounts by confirming their emails
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmation_token = '',
    email_change_confirm_status = 0
WHERE email IN ('testcustomer@gmail.com', 'testadmin@gmail.com');