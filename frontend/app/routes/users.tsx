import { useLoaderData } from "@remix-run/react";
import type { loader } from "./users.server";

export { loader } from "./users.server";

export default function Users() {
  const users = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="animate-bounce">Users</p>
      {users.map((user) => (
        <>
          <div key={user.id}>
            User #{user.id} - {user.username}
          </div>
        </>
      ))}
    </div>
  );
}
