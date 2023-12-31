CREATE TABLE `channels` (
	`id` serial AUTO_INCREMENT,
	`title` varchar(50) NOT NULL,
	`description` varchar(100) NOT NULL,
	`owner_id` bigint unsigned NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT,
	`email` varchar(60) NOT NULL,
	`first_name` varchar(20) NOT NULL,
	`last_name` varchar(25),
	`username` varchar(25) NOT NULL,
	`password` varchar(100) NOT NULL,
	`user_type` enum('user','administrator','manager') NOT NULL DEFAULT 'user',
	`status` enum('inactive','active','deleted') NOT NULL DEFAULT 'inactive'
);
--> statement-breakpoint
ALTER TABLE `channels` ADD CONSTRAINT `channels_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;