"use client";

import dayjs from "dayjs";
import clsx from "clsx";

const sampleEvents = [
  {
    id: "1",
    title: "IG Reel: Behind-the-scenes",
    platform: "Instagram",
    datetime: dayjs().hour(11).minute(0).toDate(),
  },
  {
    id: "2",
    title: "LinkedIn Thought Leadership",
    platform: "LinkedIn",
    datetime: dayjs().add(1, "day").hour(9).toDate(),
  },
  {
    id: "3",
    title: "TikTok Trend Remix",
    platform: "TikTok",
    datetime: dayjs().add(2, "day").hour(15).toDate(),
  },
];

const platforms: Record<string, string> = {
  Instagram: "bg-pink-500/10 text-pink-500 border-pink-200",
  LinkedIn: "bg-blue-500/10 text-blue-500 border-blue-200",
  TikTok: "bg-emerald-500/10 text-emerald-500 border-emerald-200",
};

export function DashboardCalendar() {
  const startOfWeek = dayjs().startOf("week");
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Publishing calendar</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Drag-and-drop scheduling coming soon.</p>
        </div>
        <button className="rounded-full bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-400">
          New post
        </button>
      </div>
      <div className="mt-6 grid grid-cols-7 gap-3">
        {days.map((day) => (
          <div key={day.format("YYYY-MM-DD")} className="rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800">
            <div className={clsx("flex items-center justify-between", day.isToday() && "text-brand-500")}>
              <span className="font-medium">{day.format("ddd")}</span>
              <span className={clsx("flex h-6 w-6 items-center justify-center rounded-full", day.isToday() && "bg-brand-500 text-white")}>
                {day.format("D")}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {sampleEvents
                .filter((event) => dayjs(event.datetime).isSame(day, "day"))
                .map((event) => (
                  <div
                    key={event.id}
                    className={clsx(
                      "rounded-lg border px-3 py-2 text-xs shadow-sm transition hover:-translate-y-0.5",
                      platforms[event.platform] ?? "bg-slate-500/10 text-slate-600 border-slate-200"
                    )}
                  >
                    <p className="font-semibold">{event.title}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide opacity-75">
                      {event.platform} • {dayjs(event.datetime).format("h:mm A")}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
