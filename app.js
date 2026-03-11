const cl = console.log;

const postForm = document.getElementById('postForm')
const titleControl = document.getElementById('title')
const bodyControl = document.getElementById('body')
const userIdControl = document.getElementById('userId')
const spinner = document.getElementById('spinner')
const addPostBtn = document.getElementById('addPostBtn')
const updatePostBtn = document.getElementById('updatePostBtn')

// create >> POST
// get from DB >> GET
// remove >> DELETE
// update >> PUT/PATCH

const BASE_URL = `https://jsonplaceholder.typicode.com/`

const POSTS_URL = `${BASE_URL}/posts`;
const postContainer = document.getElementById('postContainer')

let postsArr = []

function snackbar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    })
}


const createPostCards = arr => {
    postsArr = arr;
    let result = '';
    for (let i = arr.length - 1; i >= 0; i--) {
        result += `<div class="col-md-4 mb-4" id="${arr[i].id}">
                <div class="card h-100">
                    <div class="card-header">
                        <h3 data-toggle="tooltip" title="${arr[i].title}">
                            ${arr[i].title}
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">
                            ${arr[i].body}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button 
                        onclick="onEdit(this)"
                        class="btn btn-sm btn-outline-primary">Edit</button>
                        <button 
                        onclick="onRemove(this)"
                        class="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                </div>
            </div>`

    };

    postContainer.innerHTML = result;

}

// GET, POST, PATCH/PUT, DELETE

function makeApiCall(method_name, api_url, msgBody = null, cbFun) {
    // Spinner Show
    spinner.classList.remove('d-none')
    let xhr = new XMLHttpRequest()

    xhr.open(method_name, api_url, true)

    xhr.send(msgBody)

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 299) {
            let res = JSON.parse(xhr.response)
            if (method_name === "POST") {
                postForm.reset()
                let post = { ...JSON.parse(msgBody), ...res } // res = {id : 123}
                cbFun(post)
                spinner.classList.add('d-none')

                return
            }
            if (method_name === 'PATCH') {
                cbFun(JSON.parse(msgBody))
                spinner.classList.add('d-none')

                return
            }
            cbFun(res)
            // Spinner Hide
            spinner.classList.add('d-none')

        } else {
            snackbar(`Something went Wrong !!!`)

            // Spinner Hide
            spinner.classList.add('d-none')
        }
    }
}

makeApiCall("GET", POSTS_URL, null, createPostCards)


function onPostSubmit(eve) {
    eve.preventDefault();
    // POST_OBJ from form-controls

    let postObj = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value
    }

    // API CALL

    makeApiCall("POST", POSTS_URL, JSON.stringify(postObj), createSinglePostCard)

    // cbFunc createCard()

}

function createSinglePostCard(obj) {
    let col = document.createElement('div');
    col.className = 'col-md-4 mb-4'
    col.id = obj.id;
    col.innerHTML = `
                <div class="card h-100">
                    <div class="card-header">
                        <h3>
                            ${obj.title}
                        </h3>
                    </div>
                    <div class="card-body">
                        <p class="m-0">
                            ${obj.body}
                        </p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button 
                        onclick="onEdit(this)"
                        class="btn btn-sm btn-outline-primary">Edit</button>
                        <button 
                        onclick="onRemove(this)"
                        class="btn btn-sm btn-outline-danger">Remove</button>
                    </div>
                </div>`

    postContainer.prepend(col)

    snackbar(`The new post with id ${obj.id} is added successfully !!!`, 'success')

}


function onEdit(ele) {
    let EDIT_ID = ele.closest('.col-md-4').id
    localStorage.setItem("EDIT_ID", EDIT_ID)
    let EDIT_URL = `${BASE_URL}/posts/${EDIT_ID}`


    makeApiCall("GET", EDIT_URL, null, patchDataInform)

}

function patchDataInform(postObj) {
    titleControl.value = postObj.title;
    bodyControl.value = postObj.body;
    userIdControl.value = postObj.userId;
    addPostBtn.classList.add('d-none')
    updatePostBtn.classList.remove('d-none')
    snackbar(`The post with id ${postObj.id} is patched successfully !!!`, 'success')
}


function onPostUpdate() {
    // UPDATE_ID
    let UPDATE_ID = localStorage.getItem('EDIT_ID')

    // UPDATED_OBJ
    let UPDATED_OBJ = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value,
        id: UPDATE_ID
    }
    cl(UPDATED_OBJ)
    // UPDATE_URL

    let UPDATE_URL = `${BASE_URL}/posts/${UPDATE_ID}`

    // API CALL TO UPDATE POST

    makeApiCall("PATCH", UPDATE_URL, JSON.stringify(UPDATED_OBJ), updatePostCard)
}


function updatePostCard(obj) {
    postForm.reset()
    cl(obj)
    let col = document.getElementById(obj.id)
    col.querySelector(".card-header h3").innerText = obj.title
    col.querySelector(".card-body p").innerText = obj.body
    updatePostBtn.classList.add('d-none')
    addPostBtn.classList.remove('d-none')
    snackbar(`The post with id ${obj.id} is updated successfully !!!`, 'success')
}

function onRemove(ele) {
    let REMOVE_ID = ele.closest('.col-md-4').id

    Swal.fire({
        title: `Do you want to remove the Post with id ${REMOVE_ID}`,
        showCancelButton: true,
        confirmButtonText: "Remove",
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem('REMOVE_ID', REMOVE_ID)
            let REMOVE_URL = `${BASE_URL}/posts/${REMOVE_ID}`
            makeApiCall("DELETE", REMOVE_URL, null, removeCardFromUI)
        }

    });

}

function removeCardFromUI() {
    let REMOVE_ID = localStorage.getItem('REMOVE_ID')
    document.getElementById(REMOVE_ID).remove()
    // REMOVE CARD FROM UI

    snackbar(`The Post with id ${REMOVE_ID}, is removed successfully !!!`, 'success')

}

postForm.addEventListener('submit', onPostSubmit)
updatePostBtn.addEventListener('click', onPostUpdate)



// makeApiCall("POST", POSTS_URL, postObj ,createCardInUi)
// makeApiCall("GET", SINGLE_POSTS_URL, null , patchDataInform)
// makeApiCall("PATCH", SINGLE_POSTS_URL, updatedObj , updatePostCard)
// makeApiCall("DELETE", SINGLE_POSTS_URL, null , removeCardFromUI)


// base_utl/posts/:id
// updatedObj == body
// id == params(url)































