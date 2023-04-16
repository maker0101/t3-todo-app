import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

// import { api } from "~/utils/api";

const Home: NextPage = () => {
  const user = useUser();

  const { data: todos } = api.todos.getAll.useQuery();
  console.log(todos);

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
        <div className="h-full w-full max-w-lg overflow-hidden">
          <nav className="flex h-12 justify-end text-gray-300">
            {!user.isSignedIn && <SignInButton />}
            {!!user.isSignedIn && <SignOutButton />}
          </nav>
          <div className="h-1/5"></div>
          <h1 className="text-3xl font-bold text-gray-500">Today</h1>
          <div className="mt-8 flex h-full flex-col gap-2">
            {todos?.map((todo) => (
              <div
                className="flex min-h-[48px] w-full items-center gap-4 rounded-lg bg-gray-900 px-4 hover:bg-gray-800"
                key={todo.id}
              >
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-600 bg-transparent"
                />
                <label className="text-gray-300">{todo.title}</label>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
