import { useLoaderData } from "@remix-run/react";
import { getAll } from "~/lib/.server/api/telegram";
import Trash from "public/trash.svg";
import { PageButton } from "~/components/Header";
import { useState } from "react";

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
  const [channelURL, setURL] = useState("");
  const [isOpen, setOpen] = useState(false);
  return (
    <div className=" w-full h-full bg-gray-900 flex flex-col">
      {isOpen ? (
        <div className="fixed flex justify-end top-0 h-screen w-screen flex-row right-0 bg-black/75">
          <div
            className="h-full w-0 md:w-1/2 bg-transparent"
            onClick={() => {
              setOpen(!isOpen);
            }}
          ></div>
          <div className="animate-slide relative flex flex-col w-dvw md:w-1/2 h-screen rounded-md bg-gray-900">
            <div className="flex flex-row justify-end">
              <button
                className="text-[30pt] mr-4"
                onClick={() => {
                  setOpen(!isOpen);
                }}
              >
                ×
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-2xl font-extrabold">Добавление канала</h1>
              <input
                className="w-1/2 px-3 py-2"
                placeholder="Введите ссылку на канал"
                onChange={(e) => {
                  setURL(e.target.value);
                }}
              ></input>
              <button
                className=""
                onClick={() => {
                  console.log(channelURL);
                }}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="flex flex-row justify-between">
        <div className="flex flex-row pb-0 gap-4">
          <PageButton path="/" text="Жалобы"></PageButton>
          <h1 className="text-2xl font-bold mb-4">Каналы</h1>
        </div>
        <button
          className="flex h-6 px-2 hover:text-slate-500"
          onClick={() => {
            setOpen(!isOpen);
          }}
        >
          Добавить канал
        </button>
      </div>
      <div className="flex w-screen md:w-[90dvw] px-3">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="border border-gray-700 px-4 py-2 text-center">
                Источник
              </th>
              <th className="border border-gray-700 w-[85%] px-4 py-2 text-left">
                Канал
              </th>
              <th className="border border-gray-700 px-4 py-2 text-left w-[95px]"></th>
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
