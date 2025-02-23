class ScheduleController {
  static DAY_OF_WEEK = Object.freeze([
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ]);
  static NO_MEMBER = Object.freeze("Ở dơ 1 bửa");
  constructor() {
    this.supabaseService = new SupabaseService(SUPABASE_URL, SUPABASE_KEY);
  }

  init() {
    this.showSchedule();
  }

  async showSchedule() {
    try {
      const cleaningSchedule = await this.supabaseService.getSchedule();
      console.log("Show schedule:", cleaningSchedule);
      this.updateSchedule(cleaningSchedule);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  updateSchedule(scheduleData) {
    const today = new Date();
    const currentDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    const scheduleList = document.querySelector(".schedule ul");
    if (!scheduleList) return;

    const items = Array.from(scheduleList.children);
    if (!items.length) return;

    const fragment = document.createDocumentFragment();

    items.forEach((li, index) => {
      const span = li.querySelector("span");
      if (!span) return;

      const scheduleItem = scheduleData.find(
        (item) => item.day_of_week - 1 === index
      );
      const memberName = scheduleItem ? scheduleItem.member_name : "";

      const isCurrentDay = index + 1 === currentDayOfWeek;
      const content = `${ScheduleController.DAY_OF_WEEK[index]}: ${
        memberName || ScheduleController.NO_MEMBER
      }`;

      span.textContent = content;

      li.className = ""; // Xóa hết class trước khi thêm mới
      if (isCurrentDay) li.classList.add("current-day");
      if (!memberName) li.classList.add("no-member");

      fragment.appendChild(li);
    });

    scheduleList.innerHTML = ""; // Xóa danh sách cũ để tránh reflow nhiều lần
    scheduleList.appendChild(fragment);
  }
}
