import { useNavigate } from "@remix-run/react";

type IPageButton = {
  path: string;
  text?: string;
};

export const PageButton = (data: IPageButton) => {
  const navigator = useNavigate();
  console.log(data.path);
  return (
    <button
      className="pb-[12px] text-[15pt]"
      onClick={() => {
        navigator(data.path);
      }}
    >
      {data.text}
    </button>
  );
};
