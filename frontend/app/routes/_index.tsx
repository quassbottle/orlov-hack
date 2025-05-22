import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { clickhouse } from "~/lib/.server/clickhouse";

export const loader: LoaderFunction = async () => {
  const data = await clickhouse.getTableInfo();
  console.log(data);
  const result = data.map(
    (row): TableRow => ({
      source: row.source,
      message: row.problem,
      created_at: new Date(row.createdAt!).toLocaleString("ru-RU"),
      longMessage: row.original_text,
    })
  );

  return json(result);
};

interface TableRow {
  created_at?: string;
  message?: string;
  source?: string;
  longMessage?: string;
}

export default function Index() {
  const [isWindowOpened, setWindowOpen] = useState(false);
  const [curInfo, setCurInfo] = useState(0);
  const data = useLoaderData<typeof loader>() as TableRow[];

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      {isWindowOpened ? (
        <div className="fixed top-0 h-screen w-screen right-[1px] z-1 bg-black/50">
          <div>
            <div>
              <div>{data[curInfo].longMessage}</div>
              <div>Важный/нет</div>
            </div>
            <div>Статус</div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <h1 className="text-2xl font-bold mb-4">Жалобы</h1>
      <table className="table-auto w-full border-collapse border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="border border-gray-700 px-4 py-2 text-left">
              Проблема
            </th>
            <th className="border border-gray-700 px-4 py-2 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-800">
              <td className="border border-gray-700 px-4 py-2">
                {row.message}
              </td>
              <td className="border border-gray-700 px-4 py-2">
                <p
                  id={"button_" + index}
                  className="text-[24pt] cursor-pointer"
                  onClick={(event) => {
                    setWindowOpen(!isWindowOpened);
                    setCurInfo(Number(event.target.id.split("_")[1]));
                    console.log(data[curInfo]);
                  }}
                >
                  ···
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
