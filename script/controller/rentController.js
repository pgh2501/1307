class RentController {
  static DEFAULT_RENT_HOUSE = 8500000;
  static DEFAULT_RENT_MANAGEMENT_FEE = 50000;
  constructor() {
    this.supabaseService = new SupabaseService(SUPABASE_URL, SUPABASE_KEY);
  }

  init() {
    this.setDefaultValueRentFields();
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
        li.addEventListener("click", function () {
          const detailsDiv = this.querySelector(".rent-member-item-details");
          openForm(detailsDiv.id);
        });

        li.innerHTML = `
        <span>${member.name}</span>
        <span>Tổng cộng: ${total.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}</span>
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
}
