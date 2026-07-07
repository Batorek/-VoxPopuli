import type { SurveyStatus } from "@/lib/types";

const labels: Record<SurveyStatus, string> = {
  open: "Otwarta",
  closed: "Zamknięta",
  draft: "Szkic",
};

const classes: Record<SurveyStatus, string> = {
  open: "stamp--open",
  closed: "stamp--closed",
  draft: "stamp--draft",
};

export default function StampBadge({ status }: { status: SurveyStatus }) {
  return (
    <span className={`stamp ${classes[status]}`}>
      <span className="sr-only">Status ankiety: </span>
      {labels[status]}
    </span>
  );
}
