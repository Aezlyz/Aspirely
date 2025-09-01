-- log in as root first, then run:
CREATE DATABASE aspirely_auth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'aspirely'@'localhost' IDENTIFIED BY 'Strong#Password123';
GRANT ALL PRIVILEGES ON aspirely_auth.* TO 'aspirely'@'localhost';
FLUSH PRIVILEGES;
sys_configusersidid