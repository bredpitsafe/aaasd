/*
  Reverting:
  - Removed trigger and function for table updates, insertions, and deletions
*/

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS user_settings_trg_update ON "user_settings";

-- Drop the function if it exists
DROP FUNCTION IF EXISTS notify_on_user_settings_function;
