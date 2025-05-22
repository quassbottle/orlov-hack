import { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import SortDropdown from "~/lib/.client/components/dropdown";
import { clickhouse } from "~/lib/.server/clickhouse";

interface TableRow {
    created_at?: string;
    message?: string;
    source?: string;
    longMessage?: string;
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
                row.location &&
                row.location.toLowerCase().includes(addressFilter)
        );
    }

    const result = filtered.map(
        (row): TableRow => ({
            source: row.source,
            message: row.problem!,
            created_at: new Date(row.created_at).toLocaleString("ru-RU"),
            longMessage: row.original_text!,
        })
    );

    // filtered.sort((a, b) => {
    //     const addrA = parseAddress(a.address);
    //     const addrB = parseAddress(b.address);
    //     const streetCompare = addrA.street.localeCompare(addrB.street, "ru");
    //     return streetCompare !== 0
    //         ? streetCompare
    //         : addrA.number - addrB.number;
    // });

    return result;
};

export default function Index() {
    const data = useLoaderData<TableRow[]>();
    const [, setSearchParams] = useSearchParams();

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [address, setAddress] = useState("");

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
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Жалобы</h1>
                <div className="z-20">
                    <SortDropdown />
                </div>
            </div>
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
                                <button
                                    id={"button_" + index}
                                    className="text-[24pt] cursor-pointer border-none bg-none"
                                    onClick={(event) => {
                                        setWindowOpen(!isWindowOpened);
                                        setCurInfo(
                                            Number(
                                                (
                                                    event.target as HTMLButtonElement
                                                ).id.split("_")[1]
                                            )
                                        );
                                        console.log(data[curInfo]);
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
