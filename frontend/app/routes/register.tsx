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
    return new Response(JSON.stringify({ error: "Неверный формат данных" } satisfies ActionData), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (password !== confirm) {
    return new Response(JSON.stringify({ error: "Пароли не совпадают" } satisfies ActionData), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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
      return new Response(JSON.stringify({ error: "Пользователь уже существует" } satisfies ActionData), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ошибка регистрации" } satisfies ActionData), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export default function RegisterPage() {
    const data = useActionData<ActionData>();
  
    return (
      <Form method="post">
        <h1>Регистрация</h1>
        <input name="username" type="text" placeholder="Имя пользователя" required />
        <input name="password" type="password" placeholder="Пароль" required />
        <input name="confirm" type="password" placeholder="Повторите пароль" required />
        {data?.error && <p style={{ color: "red" }}>{data.error}</p>}
        <button type="submit">Зарегистрироваться</button>
      </Form>
    );
  }
