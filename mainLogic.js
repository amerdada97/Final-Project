const baseUrl = "https://tarmeezacademy.com/api/v1"

function showAlert(customMessage, type){
  const alertPlaceholder = document.getElementById('success-alert')
  const appendAlert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
  }
  appendAlert(customMessage, type)
  
  
}

function loginBtnClicked(){
    const username = document.getElementById("username-input").value
    const password = document.getElementById("password-input").value

    const url = `${baseUrl}/login`
    const params = {
      "username": username,
      "password": password,
    }
    axios.post(url,params)
    .then(function (response){
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      const modal = document.getElementById("login-modal")
      const modalInstance = bootstrap.Modal.getInstance(modal)
      modalInstance.hide()

      showAlert("Logged in successfully", "success")
      setupUI()
      
    })
    
} 


function registerBtnClicked(){
    const username = document.getElementById("register-username-input").value
    const name = document.getElementById("register-name-input").value
    const password = document.getElementById("register-password-input").value
    const image = document.getElementById("register-image-input").files[0]
    const url = `${baseUrl}/register`

    let formData = new FormData()

    formData.append("username", username)
    formData.append("name", name)
    formData.append("password", password)
    formData.append("image", image)
    
    const headers = {
      "Content-type": "multipart/form-data",
    }
    axios.post(url,formData,{
      headers: headers
    })
    .then(function (response){
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))

      const modal = document.getElementById("register-modal")
      const modalInstance = bootstrap.Modal.getInstance(modal)

      modalInstance.hide()
      showAlert("New user registered successfully","success")
      setupUI()
    })
    .catch(function(error){
      const errorMessage = error.response.data.message
      showAlert(errorMessage,"danger")
    })

}

function logout(){
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showAlert("Logged out successfully","success")
    setupUI()
}


function setupUI(){
    const token = localStorage.getItem("token")

    const loginDiv = document.getElementById("login-div")
    const logoutDiv = document.getElementById("logout-div")
    const addPostBtn = document.getElementById("add-post-btn")

    if(token == null){
      loginDiv.style.setProperty("display", "inline-block", "important")
      logoutDiv.style.setProperty("display", "none","important")
      if(addPostBtn != null){
        addPostBtn.style.setProperty("display", "none","important")
      }
      
    }else{
      loginDiv.style.setProperty("display", "none", "important")
      logoutDiv.style.setProperty("display", "inline-block","important")
      if(addPostBtn != null){
        addPostBtn.style.setProperty("display", "initial","important")
      }
      const user = getCurrentUser()
      document.getElementById("nav-username").innerHTML = user.username
      document.getElementById("nav-user-image").src = user.profile_image
    }
}

function getCurrentUser(){
    let user = null
    const storageUser = localStorage.getItem("user")

    if(storageUser != null){
      user = JSON.parse(storageUser)
    }
    return user
}





function postClicked(postId) {
  // alert(postId)
  window.location = `postDetail.html?postId=${postId}`
}





function editPostBtnClicked(postObject){
  let post = JSON.parse(decodeURIComponent(postObject))
  console.log(post)
  document.getElementById("post-modal-submit-btn").innerHTML = "Edit"
  document.getElementById("post-id-input").value = post.id
  document.getElementById("post-modal-title").innerHTML = "Edit Post"
  document.getElementById("add-post-title-input").value = post.title
  document.getElementById("add-post-body-input").value = post.body

  let postModal = new bootstrap.Modal(document.getElementById("add-btn-modal"), {})
  postModal.toggle()
}


function deletePostBtnClicked(postObject){
  let post = JSON.parse(decodeURIComponent(postObject))
  console.log(post)
  document.getElementById("delete-post-input").value = post.id 

  let postModal = new bootstrap.Modal(document.getElementById("delete-post-modal"), {})
  postModal.toggle()
}

function addNewPostClicked(){
  let postId = document.getElementById("post-id-input").value
  let isCreate = postId == null || postId == ""
  let successMesssage = ""
  


  const title = document.getElementById("add-post-title-input").value
  const body = document.getElementById("add-post-body-input").value
  const image = document.getElementById("add-post-image-input").files[0]

  let formData = new FormData()

  formData.append("body", body)
  formData.append("title", title)
  formData.append("image", image)


  let url = ``
  
  const token = localStorage.getItem("token")
  const headers = {
    "authorization":`Bearer ${token}`
  }

  if (isCreate){
    url = `${baseUrl}/posts`
    successMesssage = "Created post successfully"
    
  }else{
    formData.append("_method","put")
    url = `${baseUrl}/posts/${postId}`
    successMesssage = "Edited post successfully"

  }
  toggleLoader(true)
  axios.post(url,formData,{
    headers: headers
  })
  .then(function (response){
    toggleLoader(false)
    const modal = document.getElementById("add-btn-modal")
    const modalInstance = bootstrap.Modal.getInstance(modal)
    modalInstance.hide()
    showAlert(successMesssage, "success")
    getPosts()
  })
  .catch(function(error){
    const errorMessage = error.response.data.message
    showAlert(errorMessage,"danger")
  })
  
}


function addNewPostBtnClicked(){

  document.getElementById("post-modal-submit-btn").innerHTML = "Create"
  document.getElementById("post-id-input").value = ""
  document.getElementById("post-modal-title").innerHTML = "Create A New Post"
  document.getElementById("add-post-title-input").value = ""
  document.getElementById("add-post-body-input").value = ""

  let postModal = new bootstrap.Modal(document.getElementById("add-btn-modal"), {})
  postModal.toggle()  
}


function deletePostConfirmed() {
  const token = localStorage.getItem("token")
  const postId = document.getElementById("delete-post-input").value
  const url = `${baseUrl}/posts/${postId}`
  const headers = {
    "authorization":`Bearer ${token}`
  }

  axios.delete(url, {
    headers: headers
  })
  .then(function (response){
    
    const modal = document.getElementById("delete-post-modal")
    const modalInstance = bootstrap.Modal.getInstance(modal)
    modalInstance.hide()

    showAlert("Post has been Deleted Successfully", "success")
    getPosts()
    
  }).catch(function(error){
    const errorMessage = error.response.data.message
    showAlert(errorMessage,"danger")
  })
}


function profileClicked(){
  const user = getCurrentUser()
  const userId = user.id
  window.location = `profile.html?userid=${userId}`
}

function toggleLoader(show = true){
  if (show){
    document.getElementById("loader").style.visibility = "visible"
  }else{
    document.getElementById("loader").style.visibility = "hidden"
  }

}

function userClicked(userId){
  window.location = `profile.html?userid=${userId}`
}

