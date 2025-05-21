import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

interface TableRow {
  time: string;
  address: string;
  complaint: string;
  source: string;
}

export const loader: LoaderFunction = async () => {
  const data: TableRow[] = [
    {
      time: "2024-07-11 15:55:14",
      address: "ул. Ленина, 12",
      complaint: "Нет горячей воды",
      source: "Житель дома"
    },
    {
      time: "2024-07-11 15:54:10",
      address: "пр. Победы, 45",
      complaint: "Сильный запах газа",
      source: "Диспетчер"
    },
    {
      time: "2024-07-11 15:53:30",
      address: "ул. Гагарина, 7",
      complaint: "Отсутствие освещения",
      source: "Портал ЖКХ"
    },
    {
      time: "2024-07-11 15:51:20",
      address: "ул. Кирова, 20",
      complaint: "Протекает крыша",
      source: "Житель дома"
    },
    {
      time: "2024-07-11 15:51:20",
      address: "ул. Кирова, 20",
      complaint: "Протекает крыша",
      source: "Житель дома"
    }
  ];

  return json(data);
};

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
          {data.map((row: TableRow, index: number) => (
            <tr key={index} className="hover:bg-gray-800">
              <td className="border border-gray-700 px-4 py-2">{row.time}</td>
              <td className="border border-gray-700 px-4 py-2">{row.address}</td>
              <td className="border border-gray-700 px-4 py-2">{row.complaint}</td>
              <td className="border border-gray-700 px-4 py-2">{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
