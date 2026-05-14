import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';

export const creatorProfiles = sqliteTable('creator_profiles', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),

    // Profile info
    headline: text('headline'),             // e.g. "Full-Stack Developer & UI Designer"
    bio: text('bio'),                        // Long description (markdown supported)
    location: text('location'),
    website: text('website'),

    // Social links (stored as JSON: { github, instagram, twitter, youtube, tiktok, discord, telegram, linkedin })
    socialLinks: text('social_links'),

    // Donation links (stored as JSON: { saweria, trakteer, paypal, ko_fi, custom })
    donationLinks: text('donation_links'),

    // Contact links (stored as JSON: { email, whatsapp, phone, telegram, line, wechat })
    contactLinks: text('contact_links'),

    // Visibility
    isPublic: integer('is_public', { mode: 'boolean' }).default(true),

    created: integer('created', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updated: integer('updated', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
