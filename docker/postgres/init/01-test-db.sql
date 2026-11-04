-- Runs once, on first initialisation of the data volume.
-- A separate database for automated tests so tests never touch your real learning history.
CREATE DATABASE academy_test OWNER academy;
