class ScheduleController {
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
  }

  async showCleaningSchedule() {
    try {
      const cleaningSchedule = await supabaseService.getCleaningSchedule();
      console.log("CleaningSchedule:", cleaningSchedule);
      this.populateCleaningSchedule(cleaningSchedule);
      this.highlightCurrentDay();
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  populateCleaningSchedule(schedule) {
    const scheduleList = document.querySelector(".schedule ul");
    scheduleList.innerHTML = schedule
      .map(
        (item) => `
        <li>
          <span>${item.day_of_week}: ${item.name}</span>
        </li>
      `
      )
      .join("");
  }

  highlightCurrentDay() {
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    const currentDay = days[new Date().getDay()];
    const scheduleItems = document.querySelectorAll(".schedule li");
    scheduleItems.forEach((item) => {
      if (item.textContent.includes(currentDay)) {
        item.classList.add("current-day");
      }
    });
  }
}
