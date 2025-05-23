import { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import SortDropdown from "~/components/dropdown";
import { clickhouse } from "~/lib/.server/clickhouse";
import { Badge, BadgeType } from "~/components/Badges";
import { status } from "~/lib/.server/api/status";
import Important from "~/components/Important";
import { PageButton } from "~/components/Header";
import { getFireMessageIds } from "~/lib/.server/api/analytics";

interface TableRow {
  created_at?: string;
  message?: string;
  source?: string;
  longMessage?: string;
  status: BadgeType;
  uuid: string;
  address?: string;
  fire: number;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const dateStart = url.searchParams.get("start");
  const dateEnd = url.searchParams.get("end");
  const addressFilter = url.searchParams.get("address")?.toLowerCase().trim();
  const order = url.searchParams.get("order") === "desc" ? "desc" : "asc";

  const raw = await clickhouse.getTableInfo();
  const fire = await getFireMessageIds();

  let filtered = await Promise.all(
    raw.map(async (row) => ({
      source: row.source,
      message: row.problem!,
      created_at: new Date(row.created_at).toLocaleString("ru-RU"),
      longMessage: row.original_text!,
      address: row.location ?? "—",
      status: (await status.get({ messageId: row.uuid })).status as BadgeType,
      uuid: row.uuid,
      fire: fire.includes(row.uuid) ? 1 : 0,
    }))
  );

  if (dateStart) {
    const start = new Date(dateStart);
    filtered = filtered.filter((row) => new Date(row.created_at) >= start);
  }

  if (dateEnd) {
    const end = new Date(dateEnd);
    filtered = filtered.filter((row) => new Date(row.created_at) <= end);
  }

  if (addressFilter) {
    filtered = filtered.filter((row) =>
      row.address?.toLowerCase().includes(addressFilter)
    );
  }

  filtered.sort((a, b) => {
    if (a.fire !== b.fire) return b.fire - a.fire;
    const dateA = new Date(a.created_at!).getTime();
    const dateB = new Date(b.created_at!).getTime();
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });

  return filtered;
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
  const [searchParams, setSearchParams] = useSearchParams();

  const [startDate, setStartDate] = useState(searchParams.get("start") || "");
  const [endDate, setEndDate] = useState(searchParams.get("end") || "");
  const [address, setAddress] = useState(searchParams.get("address") || "");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") || "asc"
  );

  const pageFromUrl = parseInt(searchParams.get("page") || "0", 10);
  const [currentPage, setCurrentPage] = useState(
    isNaN(pageFromUrl) ? 0 : pageFromUrl
  );
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const pageCount = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const updateParams = (custom?: Record<string, string | null>) => {
    const params = new URLSearchParams();
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    if (address) params.set("address", address);
    if (custom) {
      for (const key in custom) {
        if (custom[key] === null) params.delete(key);
        else params.set(key, custom[key]!);
      }
    }
    params.set("order", sortOrder);
    params.set("page", currentPage.toString());
    setSearchParams(params);
  };
  useEffect(() => {
    updateParams();
  }, [sortOrder, currentPage]);

  const [isWindowOpened, setWindowOpen] = useState(false);
  const [curInfo, setCurInfo] = useState(0);

  return (
    <div className="p-4 text-white bg-gray-900 min-h-screen">
      {isWindowOpened ? (
        <div className="fixed flex justify-end top-0 h-screen w-screen flex-row right-0 bg-black/75 z-10">
          <div
            className="h-full w-0 md:w-1/2  bg-transparent"
            onClick={() => {
              setWindowOpen(!isWindowOpened);
            }}
          ></div>
          <div className="animate-slide w-full relative flex flex-col md:w-1/2 h-screen rounded-md bg-gray-900">
            <div className="absolute top-0 right-4">
              <button
                className="text-[30pt] items-center"
                onClick={() => {
                  setWindowOpen(!isWindowOpened);
                }}
              >
              </button>
            </div>
            <div className="w-full h-[85%] flex items-center justify-center">
              <p className="text-2xl text-gray-600 select-none">нет локации</p>
            </div>
            <div className="bg-gray-800 flex flex-col rounded-bl-md rounded-t-md justify-between overflow-y-auto h-full overflow-x-hidden p-8">
              <div className="flex flex-col gap-5">
                <div className="flex items-center w-full">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Important
                      value={data[curInfo].fire}
                      className="flex-shrink-0 w-6 h-6"
                    />

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
      <div className="flex flex-row gap-5">
        <h1 className="text-2xl font-bold mb-4">Жалобы</h1>
        <PageButton path="/channels" text="Каналы"></PageButton>
        <SortDropdown onSortChange={(order) => setSortOrder(order)} />
      </div>

      <table className="table-fixed w-full border-collapse border border-gray-700">
        <thead className="bg-gray-800 select-none">
          <tr>
            <th className="border border-gray-700 py-2 px-4 text-center w-[120px] min-w-[90px]">
              Статус
            </th>
            <th className="border border-gray-700 p-2 text-left">Проблема</th>
            <th className="border border-gray-700 text-left w-[100px] h-full hidden md:table-cell"></th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-gray-800"
              onClick={() => {
                setWindowOpen(!isWindowOpened);
                setCurInfo(Number(("button_" + index).split("_")[1]));
              }}
            >
              <td className="border border-gray-700 p-2 w-[90px]">
                <Badge className="w-full" type={row.status}></Badge>
              </td>
              <td className="border gap-2 border-gray-700 px-4 py-2">
                <div className="gap-2 flex flex-row">
                  <Important
                    value={row.fire}
                    className="flex-shrink-0 w-6 h-6"
                  />

                  <p className="truncate overflow-hidden whitespace-nowrap">
                    {row.message}
                  </p>
                </div>
              </td>
              <td className="border border-gray-700 hidden justify-center h-[66px] md:table-cell">
                <button
                  id={"button_" + index}
                  className="text-[24pt] w-full h-full cursor-pointer border-none bg-none"
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

      <div className="p-4 z-10">
        <div className="flex justify-center items-center gap-2 text-sm bg-gray-900 py-2 rounded shadow">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1 rounded disabled:opacity-40 bg-gray-700 hover:bg-gray-600 active:bg-gray-800"
            disabled={currentPage === 0}
          >
            ← Назад
          </button>
          <span className="text-center">
            Страница {currentPage + 1} из {pageCount}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(pageCount - 1, p + 1))
            }
            className="px-3 py-1 rounded disabled:opacity-40 bg-gray-700 hover:bg-gray-600 active:bg-gray-800"
            disabled={currentPage === pageCount - 1}
          >
            Вперёд →
          </button>
        </div>
      </div>
    </div>
  );
}
