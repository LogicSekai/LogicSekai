import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    username: text('username').notNull().unique(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    avatar: text('avatar'),
    role: text('role', { enum: ['user', 'creator', 'superadmin'] }).notNull().default('user'),
    verified: integer('verified', { mode: 'timestamp' }), // null = not verified, timestamp = verified date
    suspended: integer('suspended', { mode: 'timestamp' }), // 0 = active, 1 = suspended
    deleted: integer('deleted', { mode: 'timestamp' }), // null = active, timestamp = soft deleted
    created: integer('created', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated: integer('updated', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relations akan didefinisikan di index.ts untuk menghindari circular imports