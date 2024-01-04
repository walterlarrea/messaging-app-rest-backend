CREATE TABLE `user_friends` (
	`user_id_1` bigint unsigned NOT NULL,
	`user_id_2` bigint unsigned NOT NULL,
	`status` enum('req_uid1','req_uid2','approved'),
	CONSTRAINT `user_friends_user_id_1_user_id_2_pk` PRIMARY KEY(`user_id_1`,`user_id_2`)
);
--> statement-breakpoint
ALTER TABLE `user_friends` ADD CONSTRAINT `user_friends_user_id_1_users_id_fk` FOREIGN KEY (`user_id_1`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_friends` ADD CONSTRAINT `user_friends_user_id_2_users_id_fk` FOREIGN KEY (`user_id_2`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;