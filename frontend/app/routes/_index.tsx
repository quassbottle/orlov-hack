import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { clickhouse } from "~/lib/.server/clickhouse";
import { useState } from "react";

interface TableRow {
    created_at: string;
    address: string;
    message: string;
    source: string;
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
        filtered = filtered.filter((row) =>
            row.address.toLowerCase().includes(addressFilter)
        );
    }

    // filtered.sort((a, b) => {
    //     const addrA = parseAddress(a.address);
    //     const addrB = parseAddress(b.address);
    //     const streetCompare = addrA.street.localeCompare(addrB.street, "ru");
    //     return streetCompare !== 0
    //         ? streetCompare
    //         : addrA.number - addrB.number;
    // });

    const result: TableRow[] = filtered.map((row) => ({
        source: row.source,
        message: row.message,
        created_at: new Date(row.created_at).toLocaleString("ru-RU"),
        address: row.address,
    }));

    return json(result);
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

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Жалобы</h1>

            {/* === ФИЛЬТРЫ === */}
            <div className="flex flex-wrap items-end gap-4 mb-6">
                {/* Фильтр по дате С */}
                <div>
                    <label htmlFor="start-date" className="block text-sm">
                        С:
                    </label>
                    <div className="flex gap-2 items-center">
                        <input
                            id="start-date"
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-gray-800 border border-gray-700 p-2 rounded text-white"
                        />
                        {startDate && (
                            <button
                                onClick={() => {
                                    setStartDate("");
                                    updateParams({ start: null });
                                }}
                                className="text-red-500 text-xl leading-none"
                            >
                                ❌
                            </button>
                        )}
                    </div>
                </div>

                {/* Фильтр по дате По */}
                <div>
                    <label htmlFor="end-date" className="block text-sm">
                        По:
                    </label>
                    <div className="flex gap-2 items-center">
                        <input
                            id="end-date"
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-gray-800 border border-gray-700 p-2 rounded text-white"
                        />
                        {endDate && (
                            <button
                                onClick={() => {
                                    setEndDate("");
                                    updateParams({ end: null });
                                }}
                                className="text-red-500 text-xl leading-none"
                            >
                                ❌
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => updateParams()}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mt-6"
                >
                    Фильтровать по дате
                </button>

                {/* Фильтр по адресу */}
                <div>
                    <label htmlFor="address-filter" className="block text-sm">
                        По адресу:
                    </label>
                    <div className="flex gap-2 items-center">
                        <input
                            id="address-filter"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="например: сияй мага"
                            className="bg-gray-800 border border-gray-700 p-2 rounded text-white"
                        />
                        {address && (
                            <button
                                onClick={() => {
                                    setAddress("");
                                    updateParams({ address: null });
                                }}
                                className="text-red-500 text-xl leading-none"
                            >
                                ❌
                            </button>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => updateParams()}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded mt-6"
                >
                    Фильтровать по адресу
                </button>
            </div>

            {/* === ТАБЛИЦА === */}
            <table className="table-auto w-full border-collapse border border-gray-700">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="border border-gray-700 px-4 py-2 text-left">
                            Время
                        </th>
                        <th className="border border-gray-700 px-4 py-2 text-left">
                            Адрес
                        </th>
                        <th className="border border-gray-700 px-4 py-2 text-left">
                            Жалоба
                        </th>
                        <th className="border border-gray-700 px-4 py-2 text-left">
                            Источник
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-800">
                            <td className="border border-gray-700 px-4 py-2">
                                {row.created_at}
                            </td>
                            <td className="border border-gray-700 px-4 py-2">
                                {row.address}
                            </td>
                            <td className="border border-gray-700 px-4 py-2">
                                {row.message}
                            </td>
                            <td className="border border-gray-700 px-4 py-2">
                                {row.source}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
