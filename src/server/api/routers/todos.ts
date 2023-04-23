import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const todosRouter = createTRPCRouter({
  getAll: privateProcedure.query(({ ctx }) => {
    return ctx.prisma.todo.findMany({
      where: {
        userId: ctx.userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }),
  create: privateProcedure
    .input(
      z.object({
        title: z.string().min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const todo = await ctx.prisma.todo.create({
        data: {
          userId,
          title: input.title,
        },
      });
      return todo;
    }),
  // delete: privateProcedure.input(todoId: z.string()).mutation(async({ctx, input}) => {
  //   const todo = ctx.prisma.todo.delete({
  //     where: {
  //       id: input.todoId,
  //       userId: ctx.userId,
  //     }
  //   })
  // })
});
