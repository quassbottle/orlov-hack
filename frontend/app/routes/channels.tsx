import { useNavigate } from "@remix-run/react";

const unsubcribe = () => {};

export default function Channels() {
  const navigator = useNavigate();
  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col">
      <div className="flex flex-row p-2">
        <button
          className="p-1 pointer border-2 border-gray-700 rounded-md hover:bg-gray-700"
          onClick={(event) => {
            navigator("/");
          }}
        >
          На главную
        </button>
      </div>
      <div></div>
    </div>
  );
}
