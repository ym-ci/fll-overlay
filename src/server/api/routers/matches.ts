import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { eventState, match } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const matchesRouter = createTRPCRouter({
  updateTeams: protectedProcedure
  .input(z.object({ number: z.number(), tableA: z.number(), tableB: z.number()}))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.update(match).set({
      tableA: input.tableA,
      tableB: input.tableB,
    }).where(eq(match.number, input.number));
  }),
  // get next match at field Stone or Bronze
  nextMatch:  protectedProcedure
  .input(z.object({ field: z.enum(["Stone", "Bronze"]) }))
  .query(async ({ ctx, input }) => {
    const match = await ctx.db.query.match.findFirst({
      where: (match, { eq }) => eq(match.field, input.field),
    });
    return match;
  }),
  previousMatch: protectedProcedure
  .input(z.object({ field: z.enum(["Stone", "Bronze"]) }))
  .query(async ({ ctx, input }) => {
    const match = await ctx.db.query.match.findFirst({
      where: (match, { eq }) => eq(match.field, input.field),
    });
    return match;
  }),
  setFieldMatch: protectedProcedure
  .input(z.object({ number: z.number(), field: z.enum(["Stone", "Bronze"]) }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.update(eventState).set({
      currentMatch: input.number,
      timerStart: new Date(),
    }).where(eq(eventState.field, input.field));
  }),
  getFieldState: protectedProcedure
  .input(z.object({ field: z.enum(["Stone", "Bronze"]) }))
  .query(async ({ ctx, input }) => {
    const state = await ctx.db.query.eventState.findFirst({
      where: (eventState, { eq }) => eq(eventState.field, input.field),
    });
    return state;
  }),
  startTimer: protectedProcedure
  .input(z.object({ field: z.enum(["Stone", "Bronze"]) }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.update(eventState).set({
      timerStart: new Date(),
      holdStart: false,
    }).where(eq(eventState.field, input.field));
  }),
  resetTimer: protectedProcedure
  .input(z.object({ field: z.enum(["Stone", "Bronze"]) }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.update(eventState).set({
      holdStart: true,
    }).where(eq(eventState.field, input.field));
  }),
});
