import { LoaderFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { createUser } from "~/lib/.server/api/createUser";
import { createUserSession } from "~/lib/.server/session";

type ActionData = {
  error?: string;
};

export const loader: LoaderFunction = async () => {
  return null;
};

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");
  const confirm = formData.get("confirm");

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof confirm !== "string"
  ) {
    return new Response(
      JSON.stringify({ error: "Неверный формат данных" } satisfies ActionData),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (password !== confirm) {
    return new Response(
      JSON.stringify({ error: "Пароли не совпадают" } satisfies ActionData),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const user = await createUser({ username, password });
    return await createUserSession(user.id, "/dashboard");
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "P2002"
    ) {
      return new Response(
        JSON.stringify({
          error: "Пользователь уже существует",
        } satisfies ActionData),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ошибка регистрации" } satisfies ActionData),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export default function RegisterPage() {
  const data = useActionData<ActionData>();

  return (
    <div className="w-full flex justify-center items-center h-[100dvh] bg-gray-900">
      <div className="w-[40%] h-[40%] flex justify-center items-center bg-gray-700 rounded-md">
        <Form
          className="rounded-md p-4 flex flex-col justify-center items-center gap-3 bg-gray-800 w-[99%] h-[99%]"
          method="post"
        >
          <h1>Регистрация</h1>
          <input
            className="pl-2 h-[15%] w-3/4 bg-gray-700"
            name="username"
            type="text"
            placeholder="Имя пользователя"
            required
          />
          <input
            className="pl-2 h-[15%] w-3/4 bg-gray-700"
            name="password"
            type="password"
            placeholder="Пароль"
            required
          />
          <input
            className="pl-2 h-[15%] w-3/4 bg-gray-700"
            name="confirm"
            type="password"
            placeholder="Повторите пароль"
            required
          />
          {data?.error && <p style={{ color: "red" }}>{data.error}</p>}
          <button
            className="h-[15%] w-[40%] mt-10 bg-gray-700 rounded-md hover:bg-gray-800 hover:border-[1px] hover:border-white"
            type="submit"
          >
            Зарегистрироваться
          </button>
        </Form>
      </div>
    </div>
  );
}
