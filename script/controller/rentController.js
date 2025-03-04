class RentController {
  static DEFAULT_RENT_HOUSE = 8500000;
  static DEFAULT_RENT_MANAGEMENT_FEE = 50000;
  constructor() {
    this.supabaseService = new SupabaseService(SUPABASE_URL, SUPABASE_KEY);
  }

  init() {
    this.setDefaultValueRentFields();
    this.setEvent();
  }

  setDefaultValueRentFields() {
    document.getElementById("rentHouse").value =
      RentController.DEFAULT_RENT_HOUSE;
    document.getElementById("rentManagementFee").value =
      RentController.DEFAULT_RENT_MANAGEMENT_FEE;
  }

  displayRentMembers(members) {
    const ul = document.querySelector(".rent-members-list");
    if (!Array.isArray(members) || members.length === 0) {
      ul.innerHTML = "<li>Nhà không có người hã???</li>";
      return;
    }

    members
      .filter((member) => member.id !== 0)
      .map((member) => {
        const total = member.default_parking_fee + member.default_other_fee;
        const li = document.createElement("li");
        li.classList.add("rent-member-item");
        li.setAttribute("data-rent-total", total);
        li.setAttribute("data-member-id", member.id);
        li.addEventListener("click", function () {
          const detailsDiv = this.querySelector(".rent-member-item-details");
          openForm(detailsDiv.id);
        });

        li.innerHTML = `
        <span>${member.name}</span>
        <span data-rent-total=${total}>Tổng cộng: ${total.toLocaleString(
          "vi-VN",
          {
            style: "currency",
            currency: "VND",
          }
        )}</span>
        <div class="rent-member-item-details" id="rent-member-item-details-${
          member.id
        }">
          <label>Phí giữ xe: <input type="number" name="rentMemberParking-${
            member.id
          }" value="${member.default_parking_fee}"></label>
          <label>Phí khác: <input type="number" name="otherPersonalFee-${
            member.id
          }" value="${member.default_other_fee}"></label>
        </div>
      `;

        ul.appendChild(li);
      });
  }

  setEvent() {
    const rentForm = document.getElementById("rentForm");
    rentForm.addEventListener("submit", this.submitRent);
  }

  submitRent(event) {
    event.preventDefault();

    // Lấy giá trị phí chung
    const rentHouse =
      parseFloat(document.getElementById("rentHouse").value) || 0;
    const rentManagementFee =
      parseFloat(document.getElementById("rentManagementFee").value) || 0;
    const rentElectricity =
      parseFloat(document.getElementById("rentElectricity").value) || 0;
    const rentWater =
      parseFloat(document.getElementById("rentWater").value) || 0;
    const rentOtherFee =
      parseFloat(document.getElementById("rentOtherFee").value) || 0;
    const allExpenses =
      parseFloat(document.getElementById("allExpenses").value) || 0;

    // Tính toán GeneralCosts
    const generalCosts =
      rentHouse +
      rentManagementFee +
      rentElectricity +
      rentWater +
      rentOtherFee +
      allExpenses;

    // Lấy danh sách thành viên
    const memberItems = document.querySelectorAll(".rent-member-item");
    const numMembers = memberItems.length;

    // Tính toán averagCost
    const averageCost = numMembers > 0 ? generalCosts / numMembers : 0;

    // Tính toán personalCosts và định dạng tiền tệ
    const personalCosts = {};
    let totalPayableCost = 0; // Thêm biến để tích lũy tổng payableCost

    memberItems.forEach((item) => {
      const memberName = item.querySelector("span:first-child").textContent;
      const rentTotal = parseFloat(item.dataset.rentTotal) || 0;
      const personalCost = averageCost + rentTotal;

      // Lấy personalExpenses từ data-expense-total của li trong expenses
      const memberId = item.dataset.memberId;
      const expenseItem = document.querySelector(
        `.expenses li[data-member-id="${memberId}"]`
      );
      const personalExpenses = expenseItem
        ? parseFloat(expenseItem.dataset.expenseTotal) || 0
        : 0;

      // Tính payableCost
      const payableCost = personalCost - personalExpenses;

      // Lưu giá trị trước khi làm tròn
      const originalCost = payableCost;

      // Làm tròn đến hàng nghìn
      const roundedCost = Math.round(payableCost / 1000) * 1000;

      // Định dạng tiền tệ Việt Nam
      const formattedCost = roundedCost.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });

      personalCosts[memberName] = {
        original: originalCost,
        rounded: roundedCost,
        formatted: formattedCost,
        personalCost: personalCost,
        personalExpenses: personalExpenses,
        payableCost: payableCost,
      };

      totalPayableCost += originalCost; // Tích lũy totalPayableCost
    });

    // In ra các giá trị để kiểm tra
    console.log(
      "GeneralCosts:",
      generalCosts.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })
    );
    console.log(
      "AverageCost:",
      averageCost.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })
    );
    console.log("PersonalCosts:", personalCosts);
    console.log(
      "Total Payable Cost:",
      totalPayableCost.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      })
    );

    // Thêm mã xử lý submit form của bạn ở đây
  }
}
