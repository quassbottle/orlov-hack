import { useNavigate } from "@remix-run/react";

type IPageButton = {
  path: string;
  text?: string;
};

export const PageButton = (data: IPageButton) => {
  const navigator = useNavigate();
  return (
    <button
      className="pb-[12px] text-2xl text-gray-700 font-bold mb-1 hover:text-gray-400"
      onClick={() => {
        navigator(data.path);
      }}
    >
      {data.text}
    </button>
  );
};
