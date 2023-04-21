// import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const todosRouter = createTRPCRouter({
  // TODO: change to protectedProcedure
  // TODO: filter by userId
  getAll: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.todo.findMany({
      // where: {
      //   userId:
      // }
      orderBy: {
        createdAt: "asc",
      },
    });
  }),
  // TODO: change to protectedProcedure
  // create: privateProcedure
  //   .input(z.object({ title: z.string(), isDone: z.boolean() }))
  //   .mutation((ctx) => {
  //     return;
  //   }),
});
