CREATE TABLE `user_channels` (
	`user_id` bigint unsigned NOT NULL,
	`channel_id` bigint unsigned NOT NULL
);
--> statement-breakpoint
ALTER TABLE `user_channels` ADD CONSTRAINT `user_channels_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_channels` ADD CONSTRAINT `user_channels_channel_id_channels_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `channels`(`id`) ON DELETE no action ON UPDATE no action;