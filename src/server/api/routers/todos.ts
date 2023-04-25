import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

// Is there a way to avoid redeclaring a Typescript type in zod?
// E.g. By inferring a zod schema from a Typescript type
// I would like to take a type from prisma client and refernce it directly via something like z.infer(TypescriptType)
const todoSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  userId: z.string(),
  isDone: z.boolean(),
});

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
  update: privateProcedure
    .input(z.object({ todoId: z.string(), newTodo: todoSchema }))
    .mutation(async ({ ctx, input }) => {
      const todo = await ctx.prisma.todo.findUnique({
        where: { id: input.todoId },
      });

      if (!todo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Can't update todo. Todo not found.",
        });
      } else if (todo.userId !== ctx.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to update the todo",
        });
      } else {
        const newTodo = await ctx.prisma.todo.update({
          where: { id: input.todoId },
          data: { title: input.newTodo.title, isDone: input.newTodo.isDone },
        });
        return newTodo;
      }
    }),
  delete: privateProcedure
    .input(z.object({ todoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find the todo with the specified todoId
      const todo = await ctx.prisma.todo.findUnique({
        where: { id: input.todoId },
      });

      // If the todo is found and belongs to the user, delete it
      if (!todo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Can't delete todo. Todo not found.",
        });
      } else if (todo.userId !== ctx.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authorized to delete the todo",
        });
      } else {
        await ctx.prisma.todo.delete({ where: { id: input.todoId } });
        return { success: true };
      }
    }),
});
