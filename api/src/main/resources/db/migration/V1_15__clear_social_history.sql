-- Clear all social history from the database

-- Delete all messages and conversations
TRUNCATE TABLE message, conversation RESTART IDENTITY CASCADE;

-- Delete all friendships
TRUNCATE TABLE friendship RESTART IDENTITY CASCADE;

-- Delete all friend requests and follows
TRUNCATE TABLE user_relation RESTART IDENTITY CASCADE;
