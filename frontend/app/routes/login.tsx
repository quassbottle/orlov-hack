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

    return await createUserSession(user.id, "/");
}

export default function Login() {
    const data = useActionData<typeof action>();

    return (
        <div className="w-full flex justify-center items-center h-[100dvh] bg-gray-900 ">
            <div className="w-[40%] h-[40%] flex justify-center items-center bg-gray-700 rounded-md">
                <Form
                    className="rounded-md p-4 flex flex-col justify-center items-center gap-4 bg-gray-800 w-[99%] h-[99%]"
                    method="post"
                >
                    <h1 className="text-lg mb-4">Войти</h1>
                    <input
                        className="pl-2 h-[15%] w-5/6 bg-gray-700 rounded-md"
                        name="username"
                        type="text"
                        placeholder="Логин"
                        required
                    />
                    <input
                        className="pl-2 h-[15%] w-5/6 bg-gray-700 rounded-md"
                        name="password"
                        type="password"
                        placeholder="Пароль"
                        required
                    />
                    {data?.error && (
                        <p style={{ color: "red" }}>{data.error}</p>
                    )}
                    <button
                        className="h-[15%] w-5/6 mt-10 bg-gray-700 rounded-md hover:bg-gray-800 hover:border-[1px] hover:border-white"
                        type="submit"
                    >
                        Войти
                    </button>
                </Form>
            </div>
        </div>
    );
}
