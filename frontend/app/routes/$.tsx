import { useNavigate } from "@remix-run/react";

export default function EndOfSite() {
  const navigator = useNavigate();
  return (
    <div className="flex flex-col h-[100dvh] justify-center items-center bg-gray-900">
      <p className="text-[72pt]">Страница не найдена</p>
      <button
        className="bg-gray-700 h-[5%] w-[10%] rounded-md hover:bg-gray-800"
        onClick={() => {
          navigator(-1);
        }}
      >
        Вернуться назад
      </button>
    </div>
  );
}
