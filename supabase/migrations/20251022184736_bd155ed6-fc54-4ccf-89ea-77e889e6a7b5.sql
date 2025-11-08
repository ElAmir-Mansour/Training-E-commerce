-- Delete user roles for the incorrect email user
DELETE FROM public.user_roles WHERE user_id = '640f17af-8d04-4f1f-a842-7dee2902e72e';

-- Delete the user from auth.users (this will cascade delete related records)
DELETE FROM auth.users WHERE id = '640f17af-8d04-4f1f-a842-7dee2902e72e';