import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { eventState, match } from "@/server/db/schema";
import { eq } from "drizzle-orm";


export const matchesRouter = createTRPCRouter({
  updateTeams: protectedProcedure
    .input(z.object({ number: z.number(), tableA: z.number(), tableB: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(match).set({
        tableA: input.tableA,
        tableB: input.tableB,
      }).where(eq(match.number, input.number));
    }),
  // get next match at field Stone or Bronze
  nextMatch: publicProcedure
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
  getFieldState: publicProcedure
    .input(z.object({ field: z.enum(["Stone", "Bronze"]) }))
    .query(async ({ ctx, input }) => {
      try {
        const state = await ctx.db.select().from(eventState).where(eq(eventState.field, input.field));
        return state[0];
      } catch (error) {
        console.log(error);
        return null;
      }
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
  getTeam: publicProcedure
    .input(z.object({ teamNumber: z.number() }))
    .query(async ({ ctx, input }) => {
      const teamData = await ctx.db.query.team.findFirst({
        where: (team, { eq }) => eq(team.number, input.teamNumber),
      });
      return teamData;
    }),
  getCurrentMatch: publicProcedure
    .input(z.object({ field: z.enum(["Stone", "Bronze"]) }))
    .query(async ({ ctx, input }) => {
      const state = await ctx.db.query.eventState.findFirst({
        where: (eventState, { eq }) => eq(eventState.field, input.field),
        with: {
          match: {
            with: {
              teamA: true,
              teamB: true,
            },
          },
        },
      });
      return state;
    }),
});
