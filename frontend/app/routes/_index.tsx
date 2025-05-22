import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import SortDropdown from "~/components/dropdown";
import { clickhouse } from "~/lib/.server/clickhouse";

interface TableRow {
  created_at?: string;
  message?: string;
  source?: string;
  longMessage?: string;
  address?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const dateStart = url.searchParams.get("start");
  const dateEnd = url.searchParams.get("end");
  const addressFilter = url.searchParams.get("address")?.toLowerCase().trim();
  const order = url.searchParams.get("order") === "desc" ? "desc" : "asc";

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
    filtered = filtered.filter((row) =>
      row.location?.toLowerCase().includes(addressFilter)
    );
  }

  filtered.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });

  const result = filtered.map((row) => ({
    source: row.source,
    message: row.problem!,
    created_at: new Date(row.created_at).toLocaleString("ru-RU"),
    longMessage: row.original_text!,
    address: row.location ?? "—",
  }));

  return json(result);
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

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (typeof window !== "undefined") {
        let rowHeight = 56;
        const width = window.innerWidth;

        if (width < 640) rowHeight = 32;
        else if (width < 768) rowHeight = 40;
        else if (width < 1024) rowHeight = 48;

        const rows = Math.floor((window.innerHeight - 300) / rowHeight);
        setItemsPerPage(rows > 0 ? rows : 1);
      }
    };
    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

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
    setSearchParams(params);
  };

  useEffect(() => {
    updateParams();
  }, [sortOrder]);

  const [isWindowOpened, setWindowOpen] = useState(false);
  const [curInfo, setCurInfo] = useState(0);

  return (
    <div className="p-4 text-white bg-gray-900 h-screen flex flex-col relative">
      {isWindowOpened && (
        <div className="animate-slide fixed flex justify-end top-0 h-screen w-screen right-[1px] bg-black/75 z-50">
          <div className="flex flex-col w-1/2 h-screen p-5 bg-gray-900">
            <div className="flex flex-row justify-end">
              <button className="text-[30pt]" onClick={() => setWindowOpen(false)}>
                ×
              </button>
            </div>
            <div className="text-[72pt] pb-[300px]">Место для карты</div>
            <div className="bg-gray-800 flex flex-col gap-[20px]">
              <div className="flex flex-row gap-[40%]">
                <div className="flex flex-row gap-4">
                  <div className="max-w-[50%]">{data[curInfo]?.message}</div>
                  <div>Важный/нет</div>
                </div>
                <div>Статус</div>
              </div>
              <div>Дата: {data[curInfo]?.created_at}</div>
              <div>{data[curInfo]?.longMessage}</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Жалобы</h1>
        <SortDropdown onSortChange={(order) => setSortOrder(order)} />
      </div>

      <div className="flex-grow h-full overflow-auto pb-24">
        <table className="table-fixed w-full h-full border-collapse border border-gray-700 text-xs sm:text-sm md:text-base">
          <thead className="bg-gray-800">
            <tr>
              <th className="w-[65%] border border-gray-700 px-2 sm:px-4 py-2 text-left">Проблема</th>
              <th className="w-[25%] border border-gray-700 px-2 sm:px-4 py-2 text-left">Адрес</th>
              <th className="w-[10%] border border-gray-700 px-2 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody className="align-top text-xs sm:text-sm md:text-base">
            {paginatedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-800">
                <td className="border border-gray-700 px-2 sm:px-4 py-2 align-top">
                  <div className="overflow-hidden whitespace-normal break-words line-clamp-2 md:truncate md:line-clamp-none">
                    {row.message}
                  </div>
                </td>
                <td className="border border-gray-700 px-2 sm:px-4 py-2 align-top">
                  <div className="overflow-hidden whitespace-normal break-words line-clamp-2 md:truncate md:line-clamp-none">
                    {row.address}
                  </div>
                </td>
                <td className="border border-gray-700 px-2 py-2 text-center align-top">
                  <button
                    className="text-lg sm:text-xl md:text-2xl cursor-pointer border-none bg-none"
                    onClick={() => {
                      setWindowOpen(true);
                      setCurInfo(index + currentPage * itemsPerPage);
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

      <div className="fixed bottom-12 left-0 right-0 px-4 z-10">
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
            onClick={() => setCurrentPage((p) => Math.min(pageCount - 1, p + 1))}
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
