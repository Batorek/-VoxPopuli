import Link from "next/link";
import StampBadge from "./StampBadge";
import type { Survey } from "@/lib/types";

export default function SurveyCard({ survey }: { survey: Survey }) {
  return (
    <li className="flex flex-col gap-3 rounded border border-ink-100 bg-paper-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="truncate font-display text-lg font-semibold text-ink-950">
          <Link
            href={`/surveys/${survey.id}`}
            className="hover:text-seal-600 hover:underline"
          >
            {survey.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-700">{survey.description}</p>
        {typeof survey.responses_count === "number" && (
          <p className="mt-1 font-mono text-xs text-ink-500">
            {survey.responses_count} odpowiedzi
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3 self-start sm:self-center">
        <StampBadge status={survey.status} />
        <Link
          href={`/surveys/${survey.id}/results`}
          className="whitespace-nowrap rounded border border-ink-950 px-3 py-1.5 text-sm font-medium text-ink-950 hover:bg-ink-950 hover:text-paper-50"
        >
          Wyniki
        </Link>
      </div>
    </li>
  );
}
