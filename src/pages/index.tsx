import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { type Todo } from "@prisma/client";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { type FormEvent, useState } from "react";
import { api } from "~/utils/api";
import { TrashIcon } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";

const Home: NextPage = () => {
  // Auth
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();

  // For reload page button in TodoListError
  const router = useRouter();
  const reload = () => router.reload();

  // Animations
  const [animationParent] = useAutoAnimate();

  // Get all todos
  const { data: todos, isLoading: isTodoListLoading } =
    api.todos.getAll.useQuery();

  // Delete todo
  const { mutate: deleteTodo } = api.todos.delete.useMutation({
    onSuccess: () => {
      void ctx.todos.getAll.invalidate();
    },
    onError: () => {
      toast.error("Failed to delete todo. Please try again.");
    },
  });

  // Add todos
  const ctx = api.useContext();
  const { mutate: addTodo, isLoading: isAddingTodo } =
    api.todos.create.useMutation({
      onSuccess: () => {
        void ctx.todos.getAll.invalidate();
      },
      onError: () => {
        toast.error("Failed to add todo. Please try again.");
      },
    });

  const [showAddButton, setShowAddButton] = useState(false);

  const [newTodo, setNewTodo] = useState(INITIAL_NEW_TODO);

  const handleAddTodo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(newTodo);
    addTodo(newTodo);
    setNewTodo(INITIAL_NEW_TODO);
  };

  // Update todos
  const { mutate: updateTodo } = api.todos.update.useMutation({
    onSuccess: () => {
      void ctx.todos.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to update todo. Please try again.");
      }
    },
  });

  const { mutate: toggleDone } = api.todos.toggleDone.useMutation({
    onSuccess: () => {
      void ctx.todos.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to toggle done. Please try again.");
      }
    },
  });

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
          <div className="relative h-full w-full">
            <nav className="flex h-20 w-full justify-center text-gray-600 ">
              <SignOutButton />
            </nav>
            {/** TodoList */}
            <div className="mx-auto flex max-w-lg flex-col justify-center py-12">
              {todos && (
                <>
                  <h1 className="text-3xl font-bold text-gray-600">Todos</h1>
                  <div className="h-8" />
                  <div
                    className="flex h-full flex-col gap-2"
                    ref={animationParent}
                  >
                    {/** Display list of todos */}
                    {todos
                      .sort((a, b) =>
                        a.isDone === b.isDone ? 0 : a.isDone ? 1 : -1
                      )
                      .map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          deleteTodo={deleteTodo}
                          updateTodo={updateTodo}
                          toggleDone={toggleDone}
                        />
                      ))}

                    {/** AddTodoWizard */}
                    <form
                      className="group flex min-h-[48px] w-full cursor-pointer items-center gap-4 rounded-lg px-4 hover:bg-gray-950"
                      onSubmit={(e) => handleAddTodo(e)}
                    >
                      <input
                        id={`checkbox-new-todo`}
                        type="checkbox"
                        checked={newTodo.isDone}
                        onChange={(e) =>
                          setNewTodo({ ...newTodo, isDone: e.target.checked })
                        }
                        onFocus={() => setShowAddButton(true)}
                        onBlur={() => setShowAddButton(false)}
                        disabled={isAddingTodo}
                        className="h-5 w-5 cursor-pointer rounded border-gray-800 bg-transparent focus:ring-transparent group-hover:border-gray-700"
                      />
                      <input
                        className="w-full cursor-pointer select-none truncate border-transparent bg-transparent text-gray-100 outline-none placeholder:text-gray-700 focus:border-transparent focus:ring-transparent group-hover:placeholder:text-gray-600"
                        type="text"
                        value={newTodo.title}
                        onChange={(e) =>
                          setNewTodo({ ...newTodo, title: e.target.value })
                        }
                        onFocus={() => setShowAddButton(true)}
                        onBlur={() => setShowAddButton(false)}
                        disabled={isAddingTodo}
                        placeholder="Add Todo"
                      />
                      <input
                        type="submit"
                        value="Add"
                        className={`${
                          showAddButton ? "visible" : "invisible"
                        } cursor-pointer rounded bg-[#2563EB] px-2 py-1 duration-100 ease-in-out`}
                      />
                    </form>
                  </div>
                </>
              )}

              {/** Todos list loading state */}
              {isTodoListLoading && <TodoListLoading numberOfItems={4} />}

              {/** Todos list error state */}
              {!isTodoListLoading && !todos && (
                <TodoListError reload={reload} />
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
 * Todo
 */
type TodoItemProps = {
  todo: Todo;
  deleteTodo: ({ todoId }: { todoId: string }) => void;
  updateTodo: ({ todoId, newTodo }: { todoId: string; newTodo: Todo }) => void;
  toggleDone: ({ todoId, isDone }: { todoId: string; isDone: boolean }) => void;
};

const TodoItem: React.FC<TodoItemProps> = (props) => {
  const { todo, deleteTodo, updateTodo, toggleDone } = props;
  const [todoState, setTodoState] = useState(todo);
  const { id, title, isDone } = todoState;

  // Todo: does this belong here? Or outside?
  const handleUpdateTodo = (
    e: FormEvent<HTMLFormElement>,
    todoId: string,
    newTodo: Todo
  ) => {
    e.preventDefault();
    updateTodo({ todoId, newTodo });

    // Blur all input fields
    const inputs = e.currentTarget.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
      inputs[i]?.blur();
    }
  };

  return (
    <form
      className="group flex min-h-[48px] w-full cursor-pointer items-center gap-4 rounded-lg bg-gray-900 px-4 hover:bg-gray-800"
      key={id}
      onSubmit={(e) => handleUpdateTodo(e, id, todoState)}
      onBlur={(e) => handleUpdateTodo(e, id, todoState)}
    >
      <input
        id={`checkbox-${id}`}
        type="checkbox"
        checked={isDone}
        onChange={(e) => {
          setTodoState({ ...todoState, isDone: e.target.checked });
          toggleDone({ todoId: id, isDone: e.target.checked });
        }}
        className="h-5 w-5 cursor-pointer rounded border-gray-600 bg-transparent focus:ring-transparent"
      />
      <input
        value={title}
        onChange={(e) => setTodoState({ ...todoState, title: e.target.value })}
        className={`w-full cursor-pointer select-none truncate bg-transparent  outline-none focus:text-gray-100 ${
          isDone ? "text-gray-600 line-through" : "text-gray-300"
        }`}
      />
      <TrashIcon
        onClick={() => deleteTodo({ todoId: id })}
        className="invisible h-6 w-6 text-gray-700 hover:text-gray-400 group-hover:visible"
      />
    </form>
  );
};

/**
 * Helper
 */

const INITIAL_NEW_TODO = {
  title: "",
  isDone: false,
};
