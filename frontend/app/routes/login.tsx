
import { Form, useActionData } from "@remix-run/react";
import { verifyLogin } from "~/lib/.server/api/verifyLogin";
import { createUserSession } from "~/lib/.server/session";

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const user = await verifyLogin({ username, password });
    if (!user) {
        return { error: "Неверный логин или пароль" };
    }

    return await createUserSession(String(user.id), "/");
}

export default function Login() {
    const data = useActionData<typeof action>();

    return (
        <Form method="post">
            <input
                name="username"
                type="text"
                placeholder="Username"
                required
            />
            <input
                name="password"
                type="password"
                placeholder="Password"
                required
            />
            {data?.error && <p style={{ color: "red" }}>{data.error}</p>}
            <button type="submit">Войти</button>
        </Form>
    );
}
