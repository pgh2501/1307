class RentController {
  static DEFAULT_RENT_HOUSE = 8500000;
  static DEFAULT_RENT_MANAGEMENT_FEE = 50000;
  constructor() {
    this.supabaseService = new SupabaseService(SUPABASE_URL, SUPABASE_KEY);
    this.jsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
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
          <button type="button">Cập nhật</button>
        </div>
      `;

        const detailsBtn = li.querySelector("button");
        detailsBtn.addEventListener("click", function () {
          // Lấy giá trị từ các input
          const parkingInput = li.querySelector(
            `input[name="rentMemberParking-${member.id}"]`
          );
          const otherInput = li.querySelector(
            `input[name="otherPersonalFee-${member.id}"]`
          );
          const parkingFee = parseInt(parkingInput.value);
          const otherFee = parseInt(otherInput.value);

          // Cập nhật giá trị của các input
          parkingInput.value = parkingFee;
          otherInput.value = otherFee;

          // Cập nhật total
          const newTotal = parkingFee + otherFee;

          // Cập nhật data-rent-total
          li.setAttribute("data-rent-total", newTotal);

          // Cập nhật nội dung hiển thị total
          const totalSpan = li.querySelectorAll("span")[1]; // Lấy phần tử span thứ hai
          totalSpan.textContent = `Tổng cộng: ${newTotal.toLocaleString(
            "vi-VN",
            {
              style: "currency",
              currency: "VND",
            }
          )}`;
          totalSpan.setAttribute("data-rent-total", newTotal);

          // Cập nhật member object (nếu cần)
          // const memberIndex = members.findIndex((m) => m.id === member.id);
          // if (memberIndex !== -1) {
          //   members[memberIndex].default_parking_fee = parkingFee;
          //   members[memberIndex].default_other_fee = otherFee;
          // }

          //cập nhật giá trị của biến total để sau này lấy lại được giá trị mới.
          // member.default_other_fee = otherFee;
          // member.default_parking_fee = parkingFee;
        });
        ul.appendChild(li);
      });
  }

  setEvent() {
    const rentForm = document.getElementById("rentForm");
    rentForm.addEventListener("submit", this.submitRent.bind(this));
  }

  // Hàm làm tròn đến hàng nghìn
  roundToThousands(number) {
    return Math.round(number / 1000) * 1000;
  }

  // Hàm định dạng số thành tiền tệ Việt Nam
  formatCurrency(number) {
    const rounded = this.roundToThousands(number);
    return rounded.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }

  submitRent(event) {
    event.preventDefault();
    // Tổng tất cả các phí
    let totallCosts = 0;

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

    // Tính toán Tổng tiền
    const generalCosts =
      rentHouse +
      rentManagementFee +
      rentElectricity +
      rentWater +
      rentOtherFee +
      allExpenses;

    totallCosts += generalCosts;

    // Lấy danh sách thành viên
    const memberItems = document.querySelectorAll(".rent-member-item");
    const numMembers = memberItems.length;

    // Lấy danh sách tiền đã chi cá nhân
    const expensesMap = new Map();
    document.querySelectorAll(".expenses li").forEach((item) => {
      const memberId = item.dataset.memberId;
      const expenseTotal = parseFloat(item.dataset.expenseTotal) || 0;
      expensesMap.set(memberId, expenseTotal);
    });

    // Tính toán Tiền chia đều
    const averageCost = numMembers > 0 ? generalCosts / numMembers : 0;

    // Tính toán Tiền phải đóng của mỗi thành viên
    const personalCosts = {};
    let totalPayableCost = 0;

    memberItems.forEach((item) => {
      const memberName = item.querySelector("span:first-child").textContent;

      // Lấy chi phí riêng
      const rentTotal = parseFloat(item.dataset.rentTotal) || 0;
      // Tính toán tổng chi phí cá nhân
      const personalCost = averageCost + rentTotal;

      totallCosts += rentTotal;

      // Lấy tiền đã chi cá nhân
      const memberId = item.dataset.memberId;
      const personalExpenses = expensesMap.get(memberId) || 0;

      // Tính Tiền phải đóng cá nhân
      const payableCost = personalCost - personalExpenses;

      personalCosts[memberName] = {
        personalCost: this.formatCurrency(personalCost),
        personalExpenses: this.formatCurrency(personalExpenses),
        payableCost: this.formatCurrency(payableCost),
      };

      totalPayableCost += personalCost;
    });

    // In ra các giá trị để kiểm tra
    console.log("TotallCosts:", totallCosts);
    console.log("GeneralCosts:", generalCosts);
    console.log("AverageCost:", averageCost);
    console.log("PersonalCosts:", personalCosts);
    console.log("Total Payable Cost:", totalPayableCost);

    this.displayReport(personalCosts, totallCosts);
    // Thêm mã xử lý submit form của bạn ở đây
  }

  displayReport(data, totallCosts) {
    const container = document.getElementById("reportPopup");

    const table = this.createReportTable(data, totallCosts);
    container.innerHTML = ""; // Xóa nội dung cũ
    container.appendChild(table);

    openForm("reportPopup");
  }

  createReportTable(data, totallCosts) {
    const table = document.createElement("table");
    table.classList.add("report-table");
    table.id = "report";

    const headerRow = table.insertRow();

    const headers = ["Tên", "Chi phí", "Đã chi", "Thu"];
    headers.forEach((headerText) => {
      const headerCell = document.createElement("th");
      headerCell.textContent = headerText;
      headerCell.classList.add("report-header");
      headerRow.appendChild(headerCell);
    });

    for (const member in data) {
      const rowData = data[member];
      const dataRow = table.insertRow();
      const cells = [
        member,
        rowData.personalCost,
        rowData.personalExpenses,
        rowData.payableCost,
      ];
      cells.forEach((cellText) => {
        const dataCell = dataRow.insertCell();
        dataCell.textContent = cellText;
        dataCell.classList.add("report-cell");
      });
    }

    const h1Element = document.createElement("h1");
    h1Element.textContent = "Test in báo cáo + xuất file pdf";

    const h2Element = document.createElement("h2");
    h2Element.textContent = "Tổng cộng: " + this.formatCurrency(totallCosts);

    // Tạo nút in
    const printButton = document.createElement("button");
    printButton.textContent = "In báo cáo";
    printButton.classList.add("print-button");
    printButton.addEventListener("click", this.generatePDF.bind(this));

    // Thêm nút in vào bảng hoặc một phần tử container khác
    const container = document.createElement("div"); // Tạo một container để chứa bảng và nút in
    container.appendChild(h1Element);
    container.appendChild(h2Element);
    container.appendChild(table);
    container.appendChild(printButton);

    return container; // Trả về container thay vì table
  }

  generatePDF() {
    if (this.jsPDF) {
      const doc = new this.jsPDF();
      const elementHTML = document.querySelector("#report");

      doc.addFileToVFS("Roboto-Regular.ttf", robotoBase64);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      doc.setFont("Roboto");

      doc.html(elementHTML, {
        callback: function (doc) {
          doc.save("report.pdf");
        },
        x: 15,
        y: 15,
        width: 170,
        windowWidth: 650,
      });
    } else {
      console.error("jsPDF is not loaded.");
    }
  }
}
