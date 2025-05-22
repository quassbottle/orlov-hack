import { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { clickhouse } from "~/lib/.server/clickhouse";
import Fire from "public/fire.svg";
import { Badge, BadgeType } from "~/lib/.client/components/Badges";
import { status } from "~/lib/.server/api/status";
import { toast } from "react-toastify";

interface TableRow {
  created_at?: string;
  message?: string;
  source?: string;
  longMessage?: string;
  status: BadgeType;
  uuid: string;
}

// Сортировка по улице и номеру
// function parseAddress(address: string) {
//   const regex = /(.+?),\s*([0-9]+)$/;
//   const match = address.match(regex);
//   return {
//     street: match?.[1]?.trim() || address.trim(),
//     number: match?.[2] ? parseInt(match[2], 10) : 0,
//   };
// }

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const dateStart = url.searchParams.get("start");
  const dateEnd = url.searchParams.get("end");
  const addressFilter = url.searchParams.get("address")?.toLowerCase().trim();

  const raw = await clickhouse.getTableInfo();

  let filtered = raw;

  if (dateStart) {
    const start = new Date(dateStart);
    filtered = filtered.filter((row) => new Date(row.created_at) >= start);
  }
  if (dateEnd) {
    const end = new Date(dateEnd);
    filtered = filtered.filter((row) => new Date(row.created_at) <= end);
  }

  if (addressFilter) {
    filtered = filtered.filter(
      (row) =>
        row.location && row.location.toLowerCase().includes(addressFilter)
    );
  }

  const result = await Promise.all(
    filtered.map(
      async (row): Promise<TableRow> => ({
        source: row.source,
        message: row.problem!,
        created_at: new Date(row.created_at).toLocaleString("ru-RU"),
        longMessage: row.original_text!,
        status: (await status.get({ messageId: row.uuid })).status as BadgeType,
        uuid: row.uuid,
      })
    )
  );

  return result;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const messageId = formData.get("messageId") as string;
  const actionType = formData.get("actionType") as BadgeType;

  await status.upsert({ messageId, status: actionType });

  return null;
};

export default function Index() {
  const data = useLoaderData<TableRow[]>();
  const [, setSearchParams] = useSearchParams();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [address, setAddress] = useState("");
  const isImportant = true;

  const updateParams = (custom?: Record<string, string | null>) => {
    const params = new URLSearchParams();

    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    if (address) params.set("address", address);

    if (custom) {
      for (const key in custom) {
        if (custom[key] === null) params.delete(key);
        else params.set(key, custom[key] as string);
      }
    }

    setSearchParams(params);
  };

  const [isWindowOpened, setWindowOpen] = useState(false);
  const [curInfo, setCurInfo] = useState(0);

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      {isWindowOpened ? (
        <div className="fixed flex justify-end top-0 h-screen w-screen flex-row right-0 bg-black/75">
          <div
            className="h-full w-1/2 bg-transparent"
            onClick={() => {
              setWindowOpen(!isWindowOpened);
            }}
          ></div>
          <div className="animate-slide flex flex-col w-1/2 h-screen rounded-md bg-gray-900">
            <div className="flex flex-row justify-end">
              <button
                className="text-[30pt] mr-4"
                onClick={() => {
                  setWindowOpen(!isWindowOpened);
                }}
              >
                ×
              </button>
            </div>
            <div className="text-2xl pb-[30%] mx-4">Место для карты</div>
            <div className="bg-gray-800 flex flex-col rounded-bl-md justify-between overflow-y-auto h-full overflow-x-hidden p-8">
              <div className="flex flex-col gap-5">
                <div className="flex items-center w-full">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isImportant && (
                      <img
                        alt="fire"
                        className="flex-shrink-0 w-6 h-6"
                        src={Fire}
                      />
                    )}
                    <div className="text-xl truncate">
                      {data[curInfo].message}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <Badge type={data[curInfo].status} />
                  </div>
                </div>
                <div className="text-wrap">{data[curInfo].longMessage}</div>
              </div>
              <div className="justify-end flex flex-col gap-4">
                <p className=" text-gray-400">
                  Дата: {data[curInfo].created_at}
                </p>
                {data[curInfo].status !== "DONE" && (
                  <Form method="post">
                    <div className="flex flex-row justify-between w-full">
                      <input
                        type="hidden"
                        name="messageId"
                        value={data[curInfo].uuid}
                      />
                      {data[curInfo].status === "WAITING" ||
                      data[curInfo].status === "DECLINED" ? (
                        <button
                          type="submit"
                          name="actionType"
                          value="PROGRESS"
                          className="rounded-md py-2 px-4 bg-green-600"
                        >
                          Взять в работу
                        </button>
                      ) : (
                        <button
                          type="submit"
                          name="actionType"
                          value="DONE"
                          className="rounded-md py-2 px-4 bg-green-600"
                        >
                          Завершить
                        </button>
                      )}
                      {data[curInfo].status !== "DECLINED" && (
                        <button
                          type="submit"
                          name="actionType"
                          value="DECLINED"
                          className="rounded-md py-2 px-4 bg-red-600"
                        >
                          Отклонить
                        </button>
                      )}
                    </div>
                  </Form>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <h1 className="text-4xl font-bold mb-4">Жалобы</h1>
      <table className="table-auto w-full border-collapse border border-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th className="border border-gray-700 px-4 py-2 text-center">
              Статус
            </th>
            <th className="border border-gray-700 px-4 py-2 text-left">
              Проблема
            </th>
            <th className="border border-gray-700 px-4 py-2 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-gray-800"
              onClick={() => {
                setWindowOpen(!isWindowOpened);
                setCurInfo(Number(("button_" + index).split("_")[1]));
              }}
            >
              <td className="border border-gray-700 px-4 py-2">
                <Badge className="w-[90px]" type={row.status}></Badge>
              </td>
              <td className="border border-gray-700 px-4 py-2">
                {row.message}
              </td>
              <td className="border border-gray-700 flex justify-center px-4 py-2">
                <button
                  id={"button_" + index}
                  className="text-[24pt] cursor-pointer border-none bg-none"
                  onClick={(event) => {
                    setWindowOpen(!isWindowOpened);
                    setCurInfo(
                      Number(
                        (event.target as HTMLButtonElement).id.split("_")[1]
                      )
                    );
                  }}
                >
                  ···
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
