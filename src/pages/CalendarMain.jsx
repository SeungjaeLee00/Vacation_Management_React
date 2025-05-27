import React, { useRef, useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";
import "../styles/pages/CalendarMain.css";

import {
  getHolidayList,
  getMyVacations,
  getMyDepartmentVacations,
} from "../api/vacationList";

export default function VacationCalendar() {
  const calendarRef = useRef(null);
  const [vacationData, setVacationData] = useState([]);
  const [holidayDates, setHolidayDates] = useState([]);
  const [viewMyDepartment, setViewMyDepartment] = useState(false);
  const [calendarOptions, setCalendarOptions] = useState({});

  const fetchEvents = useCallback(
    async (fetchInfo, successCallback, failureCallback) => {
      const yearStart = fetchInfo.start.getFullYear();
      const monthStart = fetchInfo.start.getMonth() + 1;
      const yearEnd = fetchInfo.end.getFullYear();
      const monthEnd = fetchInfo.end.getMonth() + 1;

      const currentMonthDate = new Date(fetchInfo.start);
      currentMonthDate.setDate(currentMonthDate.getDate() + 7);
      const currentMonth = currentMonthDate.getMonth();
      const currentYear = currentMonthDate.getFullYear();

      try {
        const holidayJson = await getHolidayList(
          yearStart,
          monthStart,
          yearEnd,
          monthEnd
        );
        const holidays = holidayJson.map((holiday) => {
          console.log("공휴일 데이터", holidayJson);
          const date = new Date(holiday.holidayDate);
          const isCurrentMonth =
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear;

          return {
            title: holiday.name,
            start: holiday.holidayDate,
            allDay: true,
            backgroundColor: isCurrentMonth ? "#ff6666" : "#ffe5e5",
            textColor: isCurrentMonth ? "white" : "#944",
            borderColor: isCurrentMonth ? "#ff4444" : "#f5aaaa",
          };
        });
        setHolidayDates(holidayJson.map((h) => h.holidayDate));

        const vacationJson = viewMyDepartment
          ? await getMyDepartmentVacations()
          : await getMyVacations();

        let vacations = [];

        if (viewMyDepartment) {
          const seen = new Set();
          vacations = vacationJson.data
            .filter((v) => {
              if (seen.has(v.vacationId)) return false;
              seen.add(v.vacationId);
              return true;
            })
            .map((v) => {
              const endDate = new Date(v.end_at);
              endDate.setDate(endDate.getDate() + 1);
              return {
                title: `${v.userName} 휴가`,
                start: v.start_at,
                end: endDate.toISOString().slice(0, 10),
                allDay: true,
                backgroundColor: "#4B89DC",
                textColor: "white",
                borderColor: "#5cb536",
              };
            });
        } else {
          vacations = vacationJson
            .filter(
              (v) => !["REJECTED", "CANCELLED", "DELETED"].includes(v.status)
            )
            .map((v) => {
              const endDate = new Date(v.endAt);
              endDate.setDate(endDate.getDate() + 1);

              const startDate = new Date(v.startAt);
              const isCurrentMonth =
                startDate.getMonth() === currentMonth &&
                startDate.getFullYear() === currentYear;

              let backgroundColor = "#6bd13f";
              let textColor = "#1a4209";
              let borderColor = "#5cb536";

              if (v.status === "PENDING") {
                backgroundColor = isCurrentMonth ? "#f7ed5c" : "#fcfad9";
                textColor = "#5c5121";
                borderColor = isCurrentMonth ? "#ccc44e" : "#d1c177";
              }

              return {
                title: "휴가",
                start: v.startAt,
                end: endDate.toISOString().slice(0, 10),
                allDay: true,
                backgroundColor,
                textColor,
                borderColor,
              };
            });
        }

        setVacationData(vacations);
        successCallback([...holidays, ...vacations]);
      } catch (error) {
        console.error("이벤트 로딩 실패:", error);
        failureCallback(error);
      }
    },
    [viewMyDepartment]
  );

  const adjustCalendarSize = useCallback(() => {
    const width = window.innerWidth;
    setCalendarOptions((prev) => ({
      ...prev,
      height: width <= 768 ? 350 : 650,
      contentHeight: width <= 768 ? 250 : 450,
      dayMaxEvents: width <= 768 ? 0 : 2,
      headerToolbar:
        width <= 768
          ? { left: "prev,next", center: "title", right: "" }
          : {
              left: "prev,next today",
              center: "title",
              right:
                "myVacationButton,myDepartmentButton dayGridMonth,dayGridWeek",
            },
    }));
  }, []);

  useEffect(() => {
    setCalendarOptions({
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      locale: "ko",
      locales: [koLocale],
      events: fetchEvents,
      customButtons: {
        myVacationButton: {
          text: "내 휴가 보기",
          click: () => setViewMyDepartment(false),
        },
        myDepartmentButton: {
          text: "내 부서 휴가 보기",
          click: () => setViewMyDepartment(true),
        },
      },
      dayCellClassNames: (arg) => {
        const y = arg.date.getFullYear();
        const m = String(arg.date.getMonth() + 1).padStart(2, "0");
        const d = String(arg.date.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`;
        const day = arg.date.getDay();
        const classes = [];
        if (day === 0) classes.push("sunday");
        if (holidayDates.includes(dateStr)) classes.push("holiday");
        return classes;
      },
    });
  }, [fetchEvents, holidayDates]);

  useEffect(() => {
    adjustCalendarSize();
    window.addEventListener("resize", adjustCalendarSize);
    return () => window.removeEventListener("resize", adjustCalendarSize);
  }, [adjustCalendarSize]);

  return (
    <div className="calendar-wrapper">
      <div className="calendar-container">
        {calendarOptions.plugins ? (
          <FullCalendar ref={calendarRef} {...calendarOptions} />
        ) : (
          <div>로딩 중.. </div>
        )}
      </div>
    </div>
  );
}
