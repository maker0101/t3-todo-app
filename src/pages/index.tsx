import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { type Todo } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { type ReactNode } from "react";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const router = useRouter();
  const reload = () => router.reload();

  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const { data: todos, isLoading: isTodoListLoading } =
    api.todos.getAll.useQuery();

  return (
    <>
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
        {isSignedIn && (
          <div className="relative h-full w-full overflow-hidden">
            <nav className="absolute flex h-20 w-full justify-center text-gray-600 ">
              <SignOutButton />
            </nav>
            <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center">
              {isTodoListLoading && <TodoListLoading numberOfItems={3} />}
              {!isTodoListLoading && !todos && (
                <TodoListError reload={reload} />
              )}
              {todos && (
                <TodoList>
                  {todos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                  ))}
                  <AddTodoWizard addTodo={() => console.log("Add todo")} />
                </TodoList>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;

/**
 * TodoListLoading
 */
type TodoListLoadingProps = {
  numberOfItems?: number;
};

const TodoListLoading: React.FC<TodoListLoadingProps> = (props) => {
  const { numberOfItems = 3 } = props;

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-600">Todos</h1>
      <div className="h-8" />
      <div className="flex h-full flex-col gap-2">
        {Array.from({ length: numberOfItems }, (_, index) => (
          <div
            className="flex min-h-[48px] w-full animate-pulse gap-4 rounded-lg bg-gray-900 px-4"
            key={index}
          ></div>
        ))}
      </div>
    </>
  );
};

/**
 * TodoListError
 */
type TodoListErrorProps = {
  reload: () => void;
};

const TodoListError: React.FC<TodoListErrorProps> = (props) => {
  const { reload } = props;
  return (
    <div className="flex h-full flex-col items-center">
      <p className="text-gray-300">Something went wrong.</p>
      <p className="text-gray-300">Please reload the page.</p>
      <div className="h-4" />
      <button
        onClick={reload}
        className="rounded-lg bg-gray-900 px-4 py-2 text-gray-300"
      >
        Reload
      </button>
    </div>
  );
};

/**
 * TodoList
 */
type TodoListProps = {
  children: ReactNode;
};

const TodoList: React.FC<TodoListProps> = (props) => {
  const { children } = props;
  const [animationParent] = useAutoAnimate();

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-600">Todos</h1>
      <div className="h-8" />
      <div className="flex h-full flex-col gap-2" ref={animationParent}>
        {children}
      </div>
    </>
  );
};

/**
 * Todo
 */
type TodoItemProps = {
  todo: Todo;
};

const TodoItem: React.FC<TodoItemProps> = (props) => {
  const {
    todo: { id, title },
  } = props;
  return (
    <button
      className="flex min-h-[48px] w-full cursor-pointer items-center gap-4 rounded-lg bg-gray-900 px-4 hover:bg-gray-800"
      key={id}
    >
      <input
        id={`checkbox-${id}`}
        type="checkbox"
        className="h-5 w-5 cursor-pointer rounded border-gray-600 bg-transparent focus:ring-transparent"
      />
      <input
        value={title}
        className="w-full cursor-pointer select-none truncate bg-transparent text-gray-300 outline-none focus:text-gray-100"
      />
    </button>
  );
};

/**
 * AddTodoWizard
 */

type AddTodoWizardProps = {
  addTodo: () => void;
};

const AddTodoWizard: React.FC<AddTodoWizardProps> = (props) => {
  const { addTodo } = props;
  return (
    <form
      className="group flex min-h-[48px] w-full cursor-pointer items-center gap-4 rounded-lg px-4 hover:bg-gray-950"
      onSubmit={addTodo}
    >
      <input
        id={`checkbox-new-todo`}
        type="checkbox"
        className="h-5 w-5 cursor-pointer rounded border-gray-800 bg-transparent focus:ring-transparent group-hover:border-gray-700"
      />
      <input
        className="w-full cursor-pointer select-none truncate bg-transparent text-gray-100 outline-none placeholder:text-gray-700 group-hover:placeholder:text-gray-600"
        placeholder="Add Todo"
      />
    </form>
  );
};
