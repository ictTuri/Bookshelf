-- Update notification.created_at to be timezone-aware (UTC)
ALTER TABLE notification
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;

-- Update friendship.created_at to be timezone-aware (UTC)
ALTER TABLE friendship
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;

-- Update post_like.created_at to be timezone-aware (UTC)
ALTER TABLE post_like
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;

-- Update post_share.shared_at to be timezone-aware (UTC)
ALTER TABLE post_share
    ALTER COLUMN shared_at TYPE TIMESTAMP WITH TIME ZONE;

-- Update user_relation.created_at to be timezone-aware (UTC)
ALTER TABLE user_relation
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;

-- Update user_wallpaper.uploaded_at to be timezone-aware (UTC)
ALTER TABLE user_wallpaper
    ALTER COLUMN uploaded_at TYPE TIMESTAMP WITH TIME ZONE;

-- Update user_profile_pic.uploaded_at to be timezone-aware (UTC)
ALTER TABLE user_profile_pic
    ALTER COLUMN uploaded_at TYPE TIMESTAMP WITH TIME ZONE;

-- Update tables extending EntityBase
ALTER TABLE app_feedback
    ALTER COLUMN created_date TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN last_modified_date TYPE TIMESTAMP WITH TIME ZONE;

ALTER TABLE book
    ALTER COLUMN created_date TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN last_modified_date TYPE TIMESTAMP WITH TIME ZONE;

ALTER TABLE book_transaction_history
    ALTER COLUMN created_date TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN last_modified_date TYPE TIMESTAMP WITH TIME ZONE;

ALTER TABLE feedback
    ALTER COLUMN created_date TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN last_modified_date TYPE TIMESTAMP WITH TIME ZONE;

ALTER TABLE home_post
    ALTER COLUMN created_date TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN last_modified_date TYPE TIMESTAMP WITH TIME ZONE;

ALTER TABLE post_comment
    ALTER COLUMN created_date TYPE TIMESTAMP WITH TIME ZONE,
    ALTER COLUMN last_modified_date TYPE TIMESTAMP WITH TIME ZONE;

ALTER TABLE book_cover
    ALTER COLUMN uploaded_at TYPE TIMESTAMP WITH TIME ZONE;

