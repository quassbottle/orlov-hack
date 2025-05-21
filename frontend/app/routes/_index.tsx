import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { clickhouse } from "~/lib/.server/clickhouse";

export const loader: LoaderFunction = async () => {
  const data = await clickhouse.getTableInfo();

  const result = data.map((row): TableRow => ({
    source: row.source,
    message: row.message,
    created_at: new Date(row.created_at).toLocaleString("ru-RU"),
    address: row.address
  }));

  return json(result);
};

interface TableRow {
  created_at: string;
  address: string;
  message: string;
  source: string;
}

export default function Index() {
  const data = useLoaderData<typeof loader>() as TableRow[];

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Жалобы</h1>
      <table className="table-auto w-full border-collapse border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="border border-gray-700 px-4 py-2 text-left">Время</th>
            <th className="border border-gray-700 px-4 py-2 text-left">Адрес</th>
            <th className="border border-gray-700 px-4 py-2 text-left">Жалоба</th>
            <th className="border border-gray-700 px-4 py-2 text-left">Источник</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-800">
              <td className="border border-gray-700 px-4 py-2">{row.created_at}</td>
              <td className="border border-gray-700 px-4 py-2">{row.address}</td>
              <td className="border border-gray-700 px-4 py-2">{row.message}</td>
              <td className="border border-gray-700 px-4 py-2">{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
