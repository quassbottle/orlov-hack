import { useLoaderData } from "@remix-run/react";
import { getAll } from "~/lib/.server/api/telegram";
import Trash from "public/trash.svg";
import { PageButton } from "~/components/Header";

interface TableRow {
  source?: "Telegram" | "VK";
  tag: string;
}

export const loader = async () => {
  const channels = await getAll();
  return channels;
};

const unsubcribe = () => {};

export default function Channels() {
  const data = useLoaderData<TableRow[]>();
  data.push({ tag: "afdddsdsfdfs" });
  return (
    <div className=" w-full h-full bg-gray-900 flex flex-col">
      <div className="flex flex-row pb-0 gap-4">
        <PageButton path="/" text="Жалобы"></PageButton>
        <h1 className="text-2xl font-bold mb-4">Каналы</h1>
      </div>
      <div>
        <table className="w-[90dvw]">
          <thead className="bg-gray-800">
            <tr>
              <th className="border border-gray-700 px-4 py-2 text-left">
                Источник
              </th>
              <th className="border border-gray-700 px-4 py-2 text-left">
                Канал
              </th>
              <th className="border border-gray-700 px-4 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr className="bg-gray-900 border border-gray-700">
                <td className="p-3 w-6 border-r-[1px] border-gray-700 ">
                  {item.source ? item.source : "Telegram"}
                </td>
                <td className="p-3 ">{item.tag}</td>
                <td className="flex p-3 justify-center">
                  <img
                    className="h-[20px] w-[20px] cursor-pointer"
                    src={Trash}
                    onClick={() => {}}
                  ></img>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
