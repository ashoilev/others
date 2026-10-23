import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const waitlist = sqliteTable('waitlist', {email:text('email').primaryKey(),createdAt:integer('created_at').notNull(),consentVersion:text('consent_version').notNull()});
