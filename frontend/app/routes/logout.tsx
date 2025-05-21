import { ActionFunction, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { logout } from "~/lib/.server/session";

export const action: ActionFunction = async ({ request }) => {
  return redirect("/login", {
    headers: (await logout(request)).headers,
  });
};

export default function LogoutPage() {
  return (
    <Form method="post">
      <button type="submit">Выйти</button>
    </Form>
  );
}
