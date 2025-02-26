class ExpensesController {
  constructor() {
    this.supabaseService = new SupabaseService(SUPABASE_URL, SUPABASE_KEY);
  }

  init() {
    this.showExpenses();
  }

  async showExpenses() {
    try {
      const expenses = await this.supabaseService.getExpenses();
      console.log("Show expenses:", expenses);
      this.displayExpenses(expenses);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  displayExpenses(expenses) {
    const ul = document.querySelector(".purchases ul");
    ul.innerHTML = "";

    if (!Array.isArray(expenses) || expenses.length === 0) {
      // Xử lý trường hợp expenses không hợp lệ hoặc rỗng
      ul.innerHTML = "<li>Không có chi tiêu nào.</li>";
      return;
    }

    const groupedExpenses = expenses.reduce((group, expense) => {
      const memberId = expense.member_id;
      if (!group[memberId]) {
        group[memberId] = { total: 0, items: [], name: expense.members.name };
      }
      group[memberId].total += expense.price;
      group[memberId].items.push(expense);
      return group;
    }, {});

    for (const id in groupedExpenses) {
      const memberExpenses = groupedExpenses[id];
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="overview">
          <div class="contents">
            <span>${memberExpenses.name}</span>
            <span>Tổng cộng: ${memberExpenses.total.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}</span>
          </div>
          <button class="details-btn" onclick="toggleDetails(this)">Chi Tiết</button>
        </div>
        <div class="details">
          ${memberExpenses.items
            .map(
              (item) => `
                <div class="details-item">
                  <div class="contents">
                    <p>Tên sản phẩm: ${item.item_name}</p>
                    <p>Ngày mua: ${new Date(
                      item.purchase_date
                    ).toLocaleDateString("vi-VN")}</p>
                    <p>Giá: ${item.price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}</p>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      `;

      ul.appendChild(li);
    }
  }
}
