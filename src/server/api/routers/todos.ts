import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const todosRouter = createTRPCRouter({
  // TODO: change to protectedProcedure
  // TODO: filter by userId
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.todo.findMany();
  }),
  // TODO: change to protectedProcedure
  // create: publicProcedure.input({todo: }).mutation((ctx) => {
  //   return
  // })
});
