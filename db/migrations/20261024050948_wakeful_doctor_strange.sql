CREATE TABLE `creem_subscription` (
	`id` text PRIMARY KEY NOT NULL,
	`productId` text NOT NULL,
	`referenceId` text NOT NULL,
	`creemCustomerId` text,
	`creemSubscriptionId` text,
	`creemOrderId` text,
	`status` text NOT NULL,
	`periodStart` integer,
	`periodEnd` integer,
	`cancelAtPeriodEnd` integer
);
--> statement-breakpoint
ALTER TABLE `user` ADD `creemCustomerId` text;--> statement-breakpoint
ALTER TABLE `user` ADD `hadTrial` integer;