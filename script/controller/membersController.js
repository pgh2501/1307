class MembersController {
  constructor(supabaseService) {
    this.supabaseService = supabaseService;
  }

  async showMember() {
    try {
      const members = await supabaseService.getUsers();
      if (members.length > 0) {
        this.setHeaderPopup(members); // Header
        this.setMembersSection(members); // Members Section
      }
      console.log("Users:", members);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  setHeaderPopup(members) {
    const membersList = document.querySelector(".popup-buyers ul");
    membersList.innerHTML = members
      .map(
        (member) => `
      <li>
        <button onclick="selectBuyer({name: '${member.name}', image: '${member.image_url}'})">${member.name}</button>
        </li>
      `
      )
      .join("");
  }

  setMembersSection(members) {
    const membersList = document.querySelector("#members ul");

    const sortedMembers = [...members].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    membersList.innerHTML = sortedMembers
      .map(
        (member) => `
      <li class="card" 
          ontouchstart="handleTouchStart(event)" 
          ontouchmove="handleTouchMove(event)"
          ontouchend="handleTouchEnd(event)">
        <span class="card-content">${member.name}</span>
        <div class="card-remove">Remove</div>
      </li>
    `
      )
      .join("");
  }
}
