import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    username: text('username').notNull().unique(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    avatar: text('avatar'),
    role: text('role', { enum: ['user', 'creator', 'superadmin'] }).notNull().default('user'),
    verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
    created: integer('created', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated: integer('updated', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});