import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { type Todo } from "@prisma/client";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

// import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();

  const { data: todos, isLoading } = api.todos.getAll.useQuery();

  return (
    <>
      <Head>
        <title>T3 Todo App</title>
        <meta
          name="description"
          content="Lernt to build a todo app with the T3 stack"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen w-screen flex-col items-center">
        {!isSignedIn && (
          <div className="flex min-h-full flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-500">T3 Todo app</h1>
            <div className="h-8" />
            <button
              className={`h-10 rounded-lg bg-gray-900 px-4 py-2 text-gray-300 ${
                !isUserLoaded ? "animate-pulse cursor-wait" : ""
              }`}
            >
              <SignInButton />
            </button>
          </div>
        )}
        {!!isSignedIn && (
          <div className="relative h-full w-full overflow-hidden">
            <nav className="absolute flex h-20 w-full justify-center text-gray-600 ">
              <SignOutButton />
            </nav>
            <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center">
              <TodoList todos={todos} isLoading={isLoading} />
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;

type TodoListType = {
  todos: Todo[] | undefined;
  isLoading: boolean;
};

const TodoList: React.FC<TodoListType> = (props) => {
  const { todos, isLoading } = props;
  const [animationParent] = useAutoAnimate();
  const router = useRouter();

  if (isLoading)
    return (
      <>
        <h1 className="text-3xl font-bold text-gray-600">Todos</h1>
        <div className="h-8" />
        <div className="flex h-full flex-col gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              className="flex min-h-[48px] w-full animate-pulse gap-4 rounded-lg bg-gray-900 px-4"
              key={index}
            ></div>
          ))}
        </div>
      </>
    );
  if (!todos)
    return (
      <div className="flex h-full flex-col items-center">
        <p className="text-gray-300">Something went wrong.</p>
        <p className="text-gray-300">Please reload the page.</p>
        <div className="h-4" />
        <button
          onClick={() => router.reload()}
          className="rounded-lg bg-gray-900 px-4 py-2 text-gray-300"
        >
          Reload
        </button>
      </div>
    );
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-600">Todos</h1>
      <div className="h-8" />
      <div className="flex h-full flex-col gap-2" ref={animationParent}>
        {todos?.map((todo) => (
          <form
            className="flex min-h-[48px] w-full cursor-pointer items-center gap-4 rounded-lg bg-gray-900 px-4 hover:bg-gray-800"
            key={todo.id}
          >
            <input
              id={`checkbox-${todo.id}`}
              type="checkbox"
              className="h-5 w-5 cursor-pointer rounded border-gray-600 bg-transparent focus:ring-transparent"
            />
            <input
              value={todo.title}
              className="w-full cursor-pointer select-none truncate bg-transparent text-gray-300 outline-none focus:text-gray-100"
            />
          </form>
        ))}
        <form className="group flex min-h-[48px] w-full cursor-pointer items-center gap-4 rounded-lg border border-dashed border-gray-800 px-4 hover:border-gray-700 hover:bg-gray-950">
          <input
            id={`checkbox-new-todo`}
            type="checkbox"
            className="h-5 w-5 cursor-pointer rounded border-dashed border-gray-800 bg-transparent focus:ring-transparent  group-hover:border-gray-700"
          />
          <input
            className="w-full cursor-pointer select-none truncate bg-transparent text-gray-100 outline-none placeholder:text-gray-700"
            placeholder="Add Todo"
          />
        </form>
      </div>
    </>
  );
};
