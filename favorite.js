"use strict"

const base_url = "https://lighthouse-user-api.herokuapp.com"
const index_url = base_url + "/api/v1/users/"
const dataPanel = document.querySelector("#data-panel")
const friends = JSON.parse(localStorage.getItem("favorite"))
const friendsPerPage = 36
const pagination = document.querySelector(".pagination")
let friendsFiltered = []
const searchForm = document.querySelector(".searchForm")
const keywordEntry = document.querySelector("#keyword-entry")

// Renering Friends List
function renderFriendsList(data) {
  let rawHTML = " "
  data.forEach((datum) => {
    rawHTML += `
<div class="card m-3">
  <img src="${datum.avatar}" class="card-img-top" alt="Cannot Load Photo">
  <div class="card-body">
    <h5 class="card-title">${datum.name} ${datum.surname}</h5>
    <button class="btn btn-info btn-modal-info" data-bs-toggle="modal" data-bs-target="#modal-container" data-id="${datum.id}">
  Info
    </button>
    <button class="btn btn-danger btn-remove" data-id="${datum.id}">x</button>
  </div>
</div>
`
  })
  dataPanel.innerHTML = rawHTML
}

// Rendering Paginator
function renderPaginator(numberOfFriends) {
  const totalPages = Math.ceil(numberOfFriends / friendsPerPage)
  let rawHTML = " "
  for (let page = 1; page <= totalPages; page++) {
    rawHTML += `
<li class="page-item">
  <a class="page-link" href="#" data-page="${page}">${page}</a>
</li>
`
  }
  pagination.innerHTML = rawHTML
}

// Sorting Friends with Page
function friendsSorted(page) {
  const friendData = friendsFiltered.length ? friendsFiltered : friends
  const startPosition = (page - 1) * friendsPerPage
  const endPosition = startPosition + friendsPerPage
  return friendData.slice(startPosition, endPosition)
}

// Displaying Page Content
function displayPageContent() {
      renderPaginator(friends.length)
      renderFriendsList(friendsSorted(1))
}
displayPageContent()

// Rendering Modal
function friendModal(id) {
  const friendName = document.querySelector("#friend-name");
  const friendImg = document.querySelector(".friend-img");
  const friendInfo = document.querySelector(".friend-info");

  friendName.innerText = " "
  friendImg.src = " "
  friendInfo.innerHTML = " "

  axios
    .get(index_url + id)
    .then((res) => {
      const result = res.data;
      friendName.innerText = `${result.name} ${result.surname}`;
      friendImg.src = result.avatar;
      friendInfo.innerHTML = `
     <p>birthday: ${result.birthday}</p>
     <p>age: ${result.age}</p>
     <p>gender: ${result.gender}</p>
     <p>region: ${result.region}</p>
     <p>email: ${result.email}</p>
    `;
    })
    .catch((err) => console.log(err));
}

// Removing Friend from Favorite
function removeFavorites(id) {
  if (!friends) return
  const dataPosition = friends.findIndex((friend) => friend.id === id)
  if (dataPosition === -1) return
  friends.splice(dataPosition,1)
  localStorage.setItem("favorite", JSON.stringify(friends))
  renderFriendsList(friends)
}

// Adding Click Listener to pagination
pagination.addEventListener("click", function paginationRsp(e) {
  if (e.target.tagName !== "A") return
  const page = Number(e.target.dataset.page)
  renderFriendsList(friendsSorted(page))
})

// Adding Submit Listener to searchForm
searchForm.addEventListener("submit", function searchFromRsp(e) {
  e.preventDefault()
  const keyword = keywordEntry.value.trim().toLowerCase()
  friendsFiltered = friends.filter((friend) =>
    friend.name.toLowerCase().includes(keyword) ||
    friend.surname.toLowerCase().includes(keyword)
  )
  if (friendsFiltered.length === 0) {
    return alert("No Match Found")
  } else if (!keyword) {
    return alert("Please Enter Valid Keyword")
  }
  renderPaginator(friendsFiltered.length)
  renderFriendsList(friendsSorted(1))
})

// Adding Click Listener to dataPanel
dataPanel.addEventListener("click", function dataPanelRsp(e) {
  const target = e.target
  if (target.matches(".btn-modal-info")) {
    friendModal(target.dataset.id)
  } else if (target.matches(".btn-remove")) {
    removeFavorites(Number(target.dataset.id))
  }
})