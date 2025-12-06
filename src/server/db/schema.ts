import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  pgTableCreator,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
}).enableRLS();

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}).enableRLS();

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
}).enableRLS();

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
}).enableRLS();

// Field enum - restricts field names to valid values
export const fieldEnum = pgEnum("field", ["Stone", "Bronze"]);


// Teams table - robotics teams competing
export const team = pgTable("team", {
  number: integer("number").primaryKey(),
  name: text("name").notNull(),
  organization: text("organization").notNull(),
}).enableRLS();

// Export Team type
export type Team = InferSelectModel<typeof team>;

// Matches at a robotics competition
// We have two fields each with table A and table B
export const match = pgTable("match", {
  number: integer("number").primaryKey(),
  isPractice: boolean("is_practice").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  tableA: integer("table_a").references(() => team.number),
  tableB: integer("table_b").references(() => team.number),
  field: fieldEnum("field").notNull(),
  startTime: timestamp("start_time").notNull(),
  isAfterBreak: boolean("is_after_break").notNull().default(false),
}).enableRLS();

// Field type - union of valid field values
export type Field = typeof fieldEnum.enumValues[number];

// Export Match type
export type Match = InferSelectModel<typeof match>;

// Relations
export const teamRelations = relations(team, ({ many }) => ({
  matchesAsTableA: many(match, { relationName: "tableA" }),
  matchesAsTableB: many(match, { relationName: "tableB" }),
}));

export const matchRelations = relations(match, ({ one }) => ({
  teamA: one(team, {
    fields: [match.tableA],
    references: [team.number],
    relationName: "tableA",
  }),
  teamB: one(team, {
    fields: [match.tableB],
    references: [team.number],
    relationName: "tableB",
  }),
}));

// Event state - Bronze and Stone Current Match 
// Also timer data - timer start time (current time is calculated on the client)
// one row kv store. ie values are in the one row keys are the column names
// I still want the typesafety of zod
// field should be the main key
export const eventState = pgTable("event_state", {
  field: fieldEnum("field").primaryKey(),
  currentMatch: integer("current_match").notNull(),
  timerStart: timestamp("timer_start").notNull(),
  holdStart: boolean("hold_start").notNull().default(false),
}).enableRLS();

