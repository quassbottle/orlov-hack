const BadgesTypes = {
  WAITING: "bg-gray-600",
  PROGRESS: "bg-yellow-700",
  DONE: "bg-green-700",
  DECLINED: "bg-red-700",
};

const BadgesText = {
  WAITING: "Ожидает",
  PROGRESS: "В Работе",
  DONE: "Завершено",
  DECLINED: "Отклонено",
};

export type BadgeType = "WAITING" | "PROGRESS" | "DONE" | "DECLINED";

type IBadge = {
  type: BadgeType;
  className?: string;
};

export const Badge = (data: IBadge) => {
  return (
    <div
      className={`${BadgesTypes[data.type]} ${
        data.className ? data.className : ""
      } text-white w-fit px-2 rounded-md py-2 text-[10pt] text-center align-middle items-center`}
    >
      {BadgesText[data.type]}
    </div>
  );
};
