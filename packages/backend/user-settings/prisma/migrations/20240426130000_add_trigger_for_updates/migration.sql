/*
  Warnings:

  - Added trigger for table updates, insertions and deletions
*/

CREATE OR REPLACE FUNCTION notify_on_user_settings_function()
RETURNS trigger AS $$
    DECLARE
        upserted_row_data json;
        removed_row_data json;
    BEGIN
        upserted_row_data := json_build_object('id', NEW.id, 'username', NEW.username, 'key', NEW.key, 'tags', NEW.tags);
        removed_row_data := json_build_object('id', OLD.id, 'username', OLD.username, 'key', OLD.key, 'tags', OLD.tags);

        IF (TG_OP = 'INSERT') THEN
            PERFORM pg_notify('notification_channel_for_service', 'insertion|' || upserted_row_data::text);
        ELSIF (TG_OP = 'UPDATE') THEN
            PERFORM pg_notify('notification_channel_for_service', 'update|' || upserted_row_data::text);
        ELSIF (TG_OP = 'DELETE') THEN
            PERFORM pg_notify('notification_channel_for_service', 'deletion|' || removed_row_data::text);
        END IF;

        RETURN NULL;
    END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_settings_trg_update ON "user_settings";

CREATE TRIGGER user_settings_trg_update
AFTER INSERT OR UPDATE OR DELETE ON "user_settings"
FOR EACH ROW
EXECUTE FUNCTION notify_on_user_settings_function();
