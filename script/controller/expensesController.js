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

  setSelectOptions(members) {
    const selectElement = document.getElementById("expensesMemberId");
    members.forEach((item) => {
      if (item.id !== 0) {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        selectElement.appendChild(option);
      }
    });
  }

  async reload(memberId) {
    try {
      const expensesOfMember = await this.supabaseService.getExpensesByMemberId(
        memberId
      );
      console.log("Reload expenses:", expensesOfMember);
      this.displayExpenseOfMember(expensesOfMember);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  displayExpenses(expenses) {
    const ul = document.querySelector(".expenses ul");
    ul.innerHTML = "";

    if (!Array.isArray(expenses) || expenses.length === 0) {
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

    let allExpenses = 0;
    for (const id in groupedExpenses) {
      const memberExpenses = groupedExpenses[id];
      allExpenses += memberExpenses.total;
      const li = document.createElement("li");
      li.setAttribute("data-member-id", id);
      li.setAttribute("data-expense-total", memberExpenses.total);

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
          ${memberExpenses.items.map(this.createExpenseItemHTML).join("")}
        </div>
      `;

      ul.appendChild(li);
    }
    document.getElementById("allExpenses").value = allExpenses;
  }

  displayExpenseOfMember(expensesOfMember) {
    console.log("expensesOfMember", expensesOfMember);

    const ul = document.querySelector(".expenses ul");

    if (!Array.isArray(expensesOfMember) || expensesOfMember.length === 0) {
      return;
    }

    const memberId = expensesOfMember[0].member_id;
    const memberName = expensesOfMember[0].members.name;
    const total = expensesOfMember.reduce(
      (sum, expense) => sum + expense.price,
      0
    );

    let li = ul.querySelector(`li[data-member-id="${memberId}"]`);

    if (!li) {
      li = document.createElement("li");
      li.setAttribute("data-member-id", memberId);
      ul.appendChild(li);

      li.innerHTML = `
        <div class="overview">
          <div class="contents">
            <span>${memberName}</span>
            <span>Tổng cộng: ${total.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}</span>
          </div>
          <button class="details-btn" onclick="toggleDetails(this)">Chi Tiết</button>
        </div>
        <div class="details">
          ${expensesOfMember.map(this.createExpenseItemHTML).join("")}
        </div>
      `;
      return;
    }

    const totalSpan = li.querySelector(".overview .contents span:last-child");
    totalSpan.textContent = `Tổng cộng: ${total.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    })}`;

    const detailsDiv = li.querySelector(".details");
    detailsDiv.innerHTML = expensesOfMember
      .map(this.createExpenseItemHTML)
      .join("");
  }

  createExpenseItemHTML(item) {
    return `
      <div class="details-item" data-expense-id="${item.id}">
        <div class="contents" onclick="openFormUpdateExpense({ id: ${
          item.id
        }, member_id: ${item.member_id}, item_name: '${
      item.item_name
    }', price: ${item.price}, purchase_date: '${item.purchase_date}'})">
          <p>Tên sản phẩm: ${item.item_name}</p>
          <p>Ngày mua: ${new Date(item.purchase_date).toLocaleDateString(
            "vi-VN"
          )}</p>
          <p>Giá: ${item.price.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}</p>
        </div>
        <i class="fa-solid fa-trash" onclick="removeExpense(${item.id})"></i>
      </div>
    `;
  }

  async addExpense(itemName, price, memberId, purchaseDate) {
    try {
      const expense = await this.supabaseService.addExpense(
        itemName,
        price,
        memberId,
        purchaseDate
      );
      console.log("Đã thêm chi tiêu: ", expense);
      // Sau khi thêm, hiển thị lại danh sách chi tiêu
      await this.reload(memberId);
    } catch (error) {
      console.error("Error:", error.message);
      return;
    }
  }

  // Update Expenses
  async updateExpense(id, itemName, price, memberId, purchaseDate) {
    try {
      const expense = await this.supabaseService.updateExpense(
        id,
        itemName,
        price,
        memberId,
        purchaseDate
      );
      console.log("Đã cập nhật chi tiêu: ", expense);
      // Sau khi cập nhật, hiển thị lại danh sách chi tiêu
      await this.reload(memberId);
    } catch (error) {
      console.error("Error:", error.message);
      return;
    }
  }

  async removeExpense(id) {
    try {
      const expense = await this.supabaseService.deleteExpense(id);
      console.log("Đã xóa chi tiêu: ", expense);
      // Sau khi xóa, hiển thị lại danh sách chi tiêu
      await this.reload(expense[0].member_id);
    } catch (error) {
      console.error("Error:", error.message);
      return;
    }
  }
}
