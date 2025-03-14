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
    // Thêm xử lý kiểm tra tháng hiện tại đã tổng kết chưa

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
          <label>Phí giữ xe: <input type="number" name="rentMemberParking" value="${
            member.default_parking_fee
          }"></label>
          <label>Phí khác: <input type="number" name="otherPersonalFee" value="${
            member.default_other_fee
          }"></label>
          <div class="group-button">
            <button type="button">Cập nhật</button>
            <input type="checkbox" checked>
          </div>
        </div>
      `;

        const detailsBtn = li.querySelector("button");
        detailsBtn.addEventListener("click", function (event) {
          // Ngăn chặn sự kiện click lan truyền lên li
          event.stopPropagation();

          // Lấy giá trị từ các input
          const parkingInput = li.querySelector(
            `input[name="rentMemberParking"]`
          );
          const otherInput = li.querySelector(`input[name="otherPersonalFee"]`);
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

          closeForm();

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

        // Thêm sự kiện change cho checkbox
        const calculateCheckbox = li.querySelector('input[type="checkbox"]');
        const detailsDiv = li.querySelector(".rent-member-item-details");
        calculateCheckbox.addEventListener("change", function () {
          if (this.checked) {
            li.style.backgroundColor = "";
            detailsDiv.style.backgroundColor = "";
          } else {
            li.style.backgroundColor = "#ddd";
            detailsDiv.style.backgroundColor = "#ddd";
          }
        });
        ul.appendChild(li);
      });
  }

  setEvent() {
    const rentForm = document.getElementById("rentForm");
    rentForm.addEventListener("submit", this.submitRent.bind(this));

    const reportButtonGroup = document.querySelector(
      "#reportPopup .report-button"
    );
    // Lưu
    const saveButton = reportButtonGroup.children[0];
    saveButton.addEventListener("click", this.save.bind(this));

    // PDF
    const pdfButton = reportButtonGroup.children[1];
    pdfButton.addEventListener("click", this.generatePDF.bind(this));
  }

  // Hàm làm tròn đến hàng nghìn
  roundToThousands(number) {
    return Math.round(number / 1000) * 1000;
  }

  // Hàm định dạng số thành tiền tệ Việt Nam
  formatCurrency(number) {
    const rounded = this.roundToThousands(number);

    const short = (rounded / 1000).toLocaleString("vi-VN") + " k";

    const full = rounded.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

    return { full: full, short: short, normal: rounded };
  }

  submitRent(event) {
    event.preventDefault();
    // Tổng tất cả các phí
    let totallCosts = 0;
    let totalOtherPersonalFee = 0;

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
    const selectedMembers = []; // Danh sách thành viên được chọn
    // Lọc ra các thành viên được chọn
    memberItems.forEach((item) => {
      const calculateCheckbox = item.querySelector('input[type="checkbox"]');
      if (calculateCheckbox.checked) {
        selectedMembers.push(item);

        const otherPersonalFee =
          parseFloat(
            item.querySelector('input[name="otherPersonalFee"]').value
          ) || 0;
        totalOtherPersonalFee += otherPersonalFee;
      }
    });

    const numMembers = selectedMembers.length;

    // Lấy danh sách tiền đã chi cá nhân
    const expensesMap = new Map();
    document.querySelectorAll(".expenses li").forEach((item) => {
      const memberId = item.dataset.memberId;
      const expenseTotal = parseFloat(item.dataset.expenseTotal) || 0;
      expensesMap.set(memberId, expenseTotal);
    });

    // Tính chi phí chung sau khi trừ otherPersonalFee
    const adjustedGeneralCosts = generalCosts - totalOtherPersonalFee;
    // Tính toán Tiền chia đều
    const averageCost = numMembers > 0 ? adjustedGeneralCosts / numMembers : 0;

    // Tính toán Tiền phải đóng của mỗi thành viên
    const personalCosts = {};
    let totalPayableCost = 0;

    selectedMembers.forEach((item) => {
      const memberName = item.querySelector("span:first-child").textContent;
      const rentMemberParking =
        parseFloat(
          item.querySelector('input[name="rentMemberParking"]').value
        ) || 0;
      const otherPersonalFee =
        parseFloat(
          item.querySelector('input[name="otherPersonalFee"]').value
        ) || 0;

      // Lấy chi phí riêng
      const rentTotal = parseFloat(item.dataset.rentTotal) || 0;
      // Tính toán tổng chi phí cá nhân
      let personalCost = averageCost + rentMemberParking;
      if (otherPersonalFee > 0) {
        personalCost += otherPersonalFee;
      }

      totallCosts += rentMemberParking;

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

  displayReport(personalCosts, totallCosts) {
    const reportPopup = document.getElementById("reportPopup");

    // Nội dung report
    const printContent = reportPopup.querySelector(".report-content");
    printContent.innerHTML = "";

    const h1Element = document.createElement("h1");
    h1Element.textContent = "Test in báo cáo + xuất file pdf";
    printContent.appendChild(h1Element);

    const h2Element = document.createElement("h2");
    h2Element.textContent =
      "Tổng cộng: " + this.formatCurrency(totallCosts).full;
    printContent.appendChild(h2Element);

    const table = this.createReportTable(personalCosts);
    printContent.appendChild(table);

    openForm("reportPopup");
  }

  createReportTable(data) {
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

    let personalCost = 0;
    let personalExpenses = 0;
    let payableCost = 0;
    for (const member in data) {
      const rowData = data[member];

      personalCost += rowData.personalCost.normal;
      personalExpenses += rowData.personalExpenses.normal;
      payableCost += rowData.payableCost.normal;

      const dataRow = table.insertRow();
      const cells = [
        member,
        rowData.personalCost.short,
        rowData.personalExpenses.short,
        rowData.payableCost.short,
      ];
      cells.forEach((cellText) => {
        const dataCell = dataRow.insertCell();
        dataCell.textContent = cellText;
        dataCell.classList.add("report-cell");
      });
    }

    // Last row
    const dataLastRow = table.insertRow();
    const cells = ["Tổng", personalCost, personalExpenses, payableCost];
    cells.forEach((cellText) => {
      const dataCell = dataLastRow.insertCell();
      dataCell.textContent = cellText;
      dataCell.classList.add("report-header");
    });

    return table;
  }

  save() {
    console.log("save funtion");
  }

  generatePDF() {
    if (this.jsPDF) {
      const doc = new this.jsPDF();
      const elementHTML = document.querySelector(
        "#reportPopup .report-content"
      );

      doc.addFileToVFS("Roboto-Regular.ttf", robotoBase64);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      doc.setFont("Roboto");

      const pageWidthPt = doc.internal.pageSize.getWidth(); // Chiều rộng trang PDF (pt)
      const contentWidthPt = 170; // Chiều rộng nội dung HTML (pt)
      const xPt = (pageWidthPt - contentWidthPt) / 2; // Vị trí x (pt)

      doc.html(elementHTML, {
        callback: function (doc) {
          doc.save("report.pdf");
        },
        x: xPt,
        y: 15,
        width: contentWidthPt,
        windowWidth: 650,
      });
    } else {
      console.error("jsPDF is not loaded.");
    }
  }
}
