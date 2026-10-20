-- Her email, optional (Mohit, 20 Oct 2026: "app should collect email as optional name and pincode should be mandatory").
-- Stored trimmed and lower-case, only for Qura to reach her about her account. The first name and PIN code stay nullable
-- here: an account is made when the code checks out, a moment before her details arrive. The app keeps her on the
-- details screen until they are in, and the function never lets them be emptied (SERVER_SPEC.md 5.3).
alter table sakhi.accounts
  add column email text check (email is null or (char_length(email) <= 254 and email = lower(email)
    and email ~ '^[^[:space:]@]+@[^[:space:]@.]+(\.[^[:space:]@.]+)+$'));
