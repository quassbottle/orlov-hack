const BadgesTypes = {
  processing: "bg-gray-600",
  researching: "bg-yellow-700",
  done: "bg-green-700",
};

const BadgesText = {
  processing: "Не рассмотрено",
  researching: "Изучается",
  done: "Завершено",
};

type IBadge = {
  type: "processing" | "researching" | "done";
  className?: string;
};

export const Badge = (data: IBadge) => {
  return (
    <div
      className={`${BadgesTypes[data.type]} ${
        data.className ? data.className : ""
      } text-white w-fit px-1.5 rounded-md pt-[7px] text-[10pt] text-center align-middle`}
    >
      {BadgesText[data.type]}
    </div>
  );
};
