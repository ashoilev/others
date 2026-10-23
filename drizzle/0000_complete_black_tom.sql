CREATE TABLE `waitlist` (
	`email` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`consent_version` text NOT NULL
);
