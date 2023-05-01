const backendURL = 'https://ref-storage-api.onrender.com'
//const backendURL = 'http:localhost:3001'

//discord log in stuff
const fragment = new URLSearchParams(window.location.hash.slice(1));
const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

function setAttributes(el, attrs) {
    for(var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }

async function checkAuth(authFor,id) {
    const authorityResRaw = await fetch(`${backendURL}/authorityCheck?type=${authFor}&userId=${id}`)
    const authorityRes = await authorityResRaw.json()
    
    if (authorityRes.status == 'ok')
        return 'authorized'
    else if (authorityRes.status == 'no-auth')
        return 'not authorized'
    else
        return authorityRes.status
}

//load add ref form
async function loadAddRefForm() {
    console.log(accessToken)
    //displays err for not being logged in
    if (!accessToken) {
        document.getElementById('add-ref-modal-body').innerHTML = `
            <p>You must be logged in with an authorized account to upload a ref.</p>`
        document.getElementById('add-ref-modal-footer').innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button id="add-ref-modal-btn-primary" onclick="window.location = 'https://discord.com/api/oauth2/authorize?client_id=1102411465484410891&redirect_uri=https%3A%2F%2Fref-storage.netlify.app%2F&response_type=token&scope=identify'" class="btn btn-primary">Login</button>
        `
    }
    else {
        //get user id from discord
        const discordRes = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${tokenType} ${accessToken}`,
            },
        })
        const discordData = await discordRes.json()
        userId = discordData.id
    
        publishAuth = await checkAuth('publisher',userId)
    
        if (publishAuth == 'not authorized') {
            //displays err for incorrect authority
            document.getElementById('add-ref-modal-body').innerHTML = `
                <p>You don't have authorisation to uplaod references. | If you want to upload an image, visit <button type="button" onclick="showModal(this.innerText)" class="btn btn-primary" data-bs-dismiss="modal">Become a Contributor</button></p>
            `
            document.getElementById('add-ref-modal-footer').innerHTML = `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            `
        }   else if (publishAuth == 'authorized') {
                const addRefAuthorisedContentRaw = await fetch('https://raw.githubusercontent.com/RageBoy152/ref-storage-frontend/main/modals/Add%20Ref.html')
                const addRefAuthorisedContent = await addRefAuthorisedContentRaw.json()
                console.log(addRefAuthorisedContentRaw,addRefAuthorisedContent)
                document.getElementById('add-ref-modal-body').innerHTML = addRefAuthorisedContent
                document.getElementById('add-ref-modal-body').classList.add('authorised-to-add-ref')
                document.getElementById('add-ref-modal-footer').innerHTML = `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button id="add-ref-modal-btn-primary" type="submit" class="btn btn-primary">Add Ref</button>
                </form>
                `
            }
       else {
            console.log(publishAuth)
            document.getElementById('add-ref-modal-body').innerHTML = `<p>Sorry, an error occured whilst loading this form. <br> Error: ${publishAuth}</p>`
            document.getElementById('add-ref-modal-footer').innerHTML = `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>`
       }
    }
}
loadAddRefForm()


function createTopCat(cat) {
    //get container
    sideNav = document.getElementById('side-nav-wrapper')

    //Dropdown Toggler
    topCatLinkDiv = document.createElement('div')
    topCatLinkDiv.classList.add("link-level-1","col-12")

    topCatLinkA = document.createElement('a')
    href = cat.toLowerCase().replace(/\s/g, "")
    setAttributes(topCatLinkA, {"data-bs-toggle":"collapse","href":`#${href}`,"role":"button","aria-expanded":"false","aria-controls":`${href}`})
    topCatLinkA.innerText = cat
    topCatLinkDiv.appendChild(topCatLinkA)

    //Dropdown Content
    dropdownContainerDiv = document.createElement('div')
    dropdownContainerDiv.classList.add("cat-level-1", "col-12", "collapse")
    dropdownContainerDiv.id = href

    //append to sidebar
    sideNav.appendChild(topCatLinkDiv)
    sideNav.appendChild(dropdownContainerDiv)
}

function createSubCat(subCat,topCat) {
    //get top dropdown content container
    topContainer = document.getElementById(topCat.toLowerCase().replace(/\s/g, ""))
    
    //sub cat link
    subCatDiv = document.createElement('div')
    subCatDiv.classList.add("col-12","link-level-2")

    href = (topCat.toLowerCase().replace(/\s/g, "")+'>'+subCat.toLowerCase().replace(/\s/g, ""))
    subCatA = document.createElement('a')
    setAttributes(subCatA, {"data-bs-toggle":"collapse","href":`#${href}`,"role":"button","aria-expanded":"false","aria-controls":`${href}`})
    subCatA.innerText = subCat
    subCatDiv.appendChild(subCatA)
    
    //sub cat dropdown container
    subCatDropdownDiv = document.createElement('div')
    subCatDropdownDiv.classList.add("cat-level-2", "col-12", "collapse")
    subCatDropdownDiv.id = href

    //append to top container
    topContainer.appendChild(subCatDiv)
    topContainer.appendChild(subCatDropdownDiv)
}

function noRefMsg(type) {
    container = document.getElementById('refs-container')
    noContentContainer = document.createElement('div')
    noContentContainer.classList.add('no-content-msg')
    if (type == 2) {
        noContentContainer.innerHTML = `
        <p class="display-6 text-center mt-3">No refs found :(</p>
    `
    } else if (type == 1) {
        noContentContainer.innerHTML = `
        <p class="display-6 fs-2 text-center mt-3">Start browsing refs by category or enter a search.</p>
    `
    }
    
    container.appendChild(noContentContainer)
}

function displayFinalLinks(finalLink, subCat,topCat) {
    //add ref form dropdown
    if (document.getElementById('add-ref-modal-body').classList.contains('authorised-to-add-ref')) {
        select = document.getElementById('refCategorySelect')
        option = document.createElement('option')
        option.innerText = `${topCat} > ${subCat} > ${finalLink}`
        option.value = finalLink
        select.appendChild(option)
    }

    //get subCat ontop
    subCatContainer = document.getElementById(topCat.toLowerCase().replace(/\s/g, "")+'>'+subCat.toLowerCase().replace(/\s/g, ""))

    finalLinkDiv = document.createElement('div')
    finalLinkDiv.classList.add("col-12")

    var url = new URL(window.location)
    url.searchParams.set('underTopCat',topCat)
    url.searchParams.set('underSubCat',subCat)
    url.searchParams.set('refCategory',finalLink)
    url.searchParams.set('page',1)
    url.searchParams.delete('search_query')
    url.searchParams.set('search','false')

    finalLinkA = document.createElement('a')
    finalLinkA.classList.add('final-link')
    finalLinkA.href = url.href
    finalLinkA.innerText = finalLink

    finalLinkDiv.appendChild(finalLinkA)
    subCatContainer.appendChild(finalLinkDiv)
}


//get refs
async function getRefs() {
    document.getElementById('refs-container').innerHTML = ''
    //gets cat from url query
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    if (params.search == 'true') {
        queryType = 'search'
        searchQuery = params.search_query
    }   else if (params.search == 'false' || params.search == null) {
        queryType = 'category'
        searchQuery = null
    }
    //if url has all proper params, opens correct dropdown path on sidebar
    if (queryType == 'category') {
        currentCat = params.refCategory
        topCat = params.underTopCat.toLowerCase().replace(/\s/g, "")
        subCat = params.underSubCat.toLowerCase().replace(/\s/g, "")

        //opens correct path on sidebar
        //top cat
        topLinks = document.getElementsByClassName('link-level-1')
        
        for (let i=0;i<topLinks.length;i++) {
            if (topLinks[i].children[0].getAttribute('aria-controls') == topCat) {
                topLinks[i].children[0].setAttribute('aria-expanded','true')
                break
            }
        }
        document.getElementById(topCat).classList.add("show")

        //sub cat
        subLinks = document.getElementById(topCat).getElementsByClassName('link-level-2')

        for (let i=0;i<subLinks.length;i++) {
            if (subLinks[i].children[0].getAttribute('aria-controls') == topCat+'>'+subCat) {
                subLinks[i].children[0].setAttribute('aria-expanded','true')
                break
            }
        }
        document.getElementById(topCat+'>'+subCat).classList.add("show")
    }

    queryFor = ''
    if (searchQuery == null)
        queryFor = currentCat
    else
        queryFor = searchQuery
    
    page = params.page
    //get refs info from server
    const response = await fetch(`${backendURL}/refs?${queryType}=${queryFor}&page=${page}`,{headers: {
            cors: '*'
        }})
    const refsData = await response.json()
    const refs = refsData.refs
    const finalPage = refsData.finalPage

    if (finalPage == true)
        disabledNext = 'disabled'
    else
        disabledNext = ''

    if (page == '1')
        disabledPrev = 'disabled'
    else
        disabledPrev = ''

    //sets no content msg if there is no refs matching query
    if (refs.length == 0) {
        noRefMsg(2)
        document.getElementById('pageNavTop').style.display = 'none'
    }
    if (document.getElementById('pageNavTop').style.display != 'none') {
        //handles page navigation
        prevPageUrl = new URL(window.location)
        prevPageUrl.searchParams.set('page',parseInt(page)-1)

        nextPageUrl = new URL(window.location)
        nextPageUrl.searchParams.set('page',parseInt(page)+1)
        
        document.getElementById('pageNavTop').innerHTML = `
        <li class="page-item">
        <a class="page-link ${disabledPrev}" href="${prevPageUrl}" aria-label="Previous">
          <span aria-hidden="true"><i class="bi bi-caret-left"></i></span>
        </a>
      </li>
      <li class="page-item"><a class="page-link">${page}</a></li>
      <li class="page-item">
        <a class="page-link ${disabledNext}" href="${nextPageUrl}" aria-label="Next">
          <span aria-hidden="true"><i class="bi bi-caret-right"></i></span>
        </a>
      </li>
        `
        document.getElementById('pageNavBottom').innerHTML = document.getElementById('pageNavTop').innerHTML
    }

    //get logged in users info from discord
    loggedInUserInfo = {}
    if (accessToken) {
        const loggedInUserRes = await fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${tokenType} ${accessToken}`,
            },
        })
        loggedInUserInfo = await loggedInUserRes.json()
    }
        

    for (let i=0;i<refs.length;i++) {
        //get uploader info from discord
        const res = await fetch(`${backendURL}/discordUser?userId=${refs[i].uploadedBy}`)
        var userInfo = await res.json()
        if (userInfo.status=='no auth token!') {
            userInfo = {
                'avatar': '',
                'id': '',
                'username': '',
                'discriminator': ''
            }
        }


        //get img url
        const refImgRaw = await fetch(`${backendURL}/refs/images?refId=${refs[i].refId}`)
        const refImg = await refImgRaw.json()
        if (refImg.filename == 'err') {
            console.log("Couldn't find img for ref #"+refs[i].refId)
            imgUrl = ''
        }   else {
            imgUrl = `https://raw.githubusercontent.com/RageBoy152/ref-storage-api/main/data/refs/${refImg.filename}`
        }
        
        //set vars
        title = refs[i].title
        desc = refs[i].description
        commentCount = refs[i].commentCount
        downloadCount = refs[i].downloadCount
        downloadLink = ''
        commentLink = ''
        pfpUrl = `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=1024`

        //creates card and appends to container
        container = document.getElementById('refs-container')

        wrapperDiv = document.createElement('div')
        wrapperDiv.classList.add('w-auto')
        wrapperDiv.innerHTML = `
        <div class="modal fade" id="refComment${refs[i].refId}Modal" tabindex="-1" aria-labelledby="refComment${refs[i].refId}ModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
                <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="refComment${refs[i].refId}ModalLabel">${title} - Comments</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="commentFormTop input-group border-bottom pb-3 mb-2">
                        <textarea class="form-control fs-6" id="commentInputFor${refs[i].refId}" aria-label="Comment" placeholder="Leave a comment..."></textarea>
                        <button onclick="enterComment('comment',${refs[i].refId},${loggedInUserInfo.id})" type="button" class="input-group-text btn btn-outline-secondary">Comment</button>
                    </div>
                    Comments (${commentCount})
                    <div id="comments-container">
                        
                    </div>
                </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="refImage${refs[i].refId}Modal" tabindex="-1" aria-labelledby="refImage${refs[i].refId}ModalLabel" aria-hidden="true">
            <div class="modal-fullscreen modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="refImage${refs[i].refId}ModalLabel">${title}</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body imgModalBody">
                    <img class="fullImg" src="${imgUrl}" alt="Image Not Found!">
                </div>
                </div>
            </div>
        </div>
        <div class="card" onmouseover="document.getElementById('${refs[i].refId}ImgFullscreen').style.opacity=100" onmouseout="document.getElementById('${refs[i].refId}ImgFullscreen').style.opacity=0">
            <a class="full-screen-link" id="${refs[i].refId}ImgFullscreen" data-bs-toggle="modal" data-bs-target="#refImage${refs[i].refId}Modal"><i class="bi bi-arrows-angle-expand"></i></a>
            <img src="${imgUrl}" class="card-img-top">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text border-bottom pb-3">${desc}</p>
            </div>
            <div class="stats-container row">
                <div class="col-6">
                    <a data-bs-toggle="modal" data-bs-target="#refComment${refs[i].refId}Modal"><i class="bi bi-chat-left-text fs-5"></i></a>
                    <p>${commentCount}</p>
                </div>
                <div class="col-6">
                <a onclick="incDownloadCount(${refs[i].refId})" target="_blank" href="${imgUrl}" download><i class="bi bi-download fs-5"></i></a>
                    <p>${downloadCount}</p>
                </div>
            </div>
            <hr>
            <div class="row uplaoder-container pe-4">
                <div class="col-12">
                    <p>Uploaded By <img src="${pfpUrl}" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="@${userInfo.username}#${userInfo.discriminator}"></p>
                </div>
            </div>
        </div>
        `
        
        //append to thing
        container.appendChild(wrapperDiv)

        //set comments modal
        if (commentCount != 0 && refs[i].comments.length != 0) {
            for (let x=0;x<commentCount-1;x++) {
                let commentId = refs[i].comments[x].commentId
                let commenterId = refs[i].comments[x].commentedBy
                let comment = refs[i].comments[x].comment

                //get commenter info from disc
                const resCom = await fetch(`${backendURL}/discordUser?userId=${commenterId}`)
                const commenterInfo = await resCom.json()

                let commenterPfpUrl = `https://cdn.discordapp.com/avatars/${commenterInfo.id}/${commenterInfo.avatar}?size=1024`
                let hr = '<hr>'
                if (x+1 == refs[i].comments.length) {
                    hr = ''
                }

                document.getElementById('comments-container').innerHTML += `
                    <div class="container-fluid comment pt-2 pb-3">
                        <div class="row align-items-center">
                            <div class="col-1"><img id="pfp" src="${commenterPfpUrl}"></div>
                            <div class="commentBy col-11">@${commenterInfo.username}#${commenterInfo.discriminator}</div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-11 ms-auto ps-4">
                                ${comment}
                            </div>
                        </div>
                        <div class="row mt-3">
                            <div class="col-6"><a id="linkForRepliesToComment${commentId}" onclick="if(this.innerText=='Show Replies (${refs[i].comments[x].replies.length})'){this.innerText='Hide Replies (${refs[i].comments[x].replies.length})'}else{this.innerText='Show Replies (${refs[i].comments[x].replies.length})'}" data-bs-toggle="collapse" href="#repliesToComment${commentId}" role="button" aria-expanded="false" aria-controls="repliesToComment${commentId}">Show Replies (${refs[i].comments[x].replies.length})</a></div>
                            <div class="col-6"><a onclick="if(this.innerText=='Reply to ${userInfo.username}'){this.innerText='Cancel'}else{this.innerText='Reply to ${userInfo.username}'}" data-bs-toggle="collapse" href="#replyToComment${commentId}" role="button" aria-expanded="false" aria-controls="replyToComment${commentId}">Reply to ${userInfo.username}</a></div>
                        </div>
                        <div id="replyToComment${commentId}" class="replyForm collapse commentForm input-group">
                            <textarea class="form-control fs-6" id="replyInputFor${commentId}" aria-label="Post Reply" placeholder="Reply to ${commenterInfo.username}..."></textarea>
                            <button onclick="enterComment('reply',${commentId},${loggedInUserInfo.id})" type="button" class="input-group-text btn btn-outline-secondary">Post Reply</button>
                        </div>
                        <div id="repliesToComment${commentId}" class="collapse ms-4 mt-3 row pe-3">
                        
                        </div>
                    </div>
                    ${hr}
                `
                if (refs[i].comments[x].replies.length != 0) {
                    for (let y=0;y<refs[i].comments[x].replies.length;y++) {
                        replyId = refs[i].comments[x].replies[y].commentId
                        reply = refs[i].comments[x].replies[y].comment
                        replierId = refs[i].comments[x].replies[y].commentedBy

                        // get commenter info from disc
                        const resComRep = await fetch(`${backendURL}/discordUser?userId=${replierId}`)
                        const commenterInfoRep = await resComRep.json()

                        replierPfpUrl = `https://cdn.discordapp.com/avatars/${commenterInfoRep.id}/${commenterInfoRep.avatar}?size=1024`

                        let hrR = '<hr>'
                        if (y+1 == refs[i].comments[x].replies.length) {
                            hrR = ''
                        }

                        document.getElementById(`repliesToComment${commentId}`).innerHTML += `
                        <div class="container-fluid comment pt-2 pb-3">
                            <div class="row align-items-center">
                                <div class="col-1"><img id="pfp" src="${replierPfpUrl}"></div>
                                <div class="commentBy col-11">@${commenterInfoRep.username}#${commenterInfoRep.discriminator}</div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-11 ms-auto ps-4">
                                    ${reply}
                                </div>
                            </div>
                        </div>
                        ${hrR}
                        `
                    }
                }   else {
                    document.getElementById(`linkForRepliesToComment${commentId}`).style.display = 'none'
                    document.getElementById(`repliesToComment${commentId}`).style.display = 'none'
                }
                
            }
        }
        if (!accessToken) {
            replyForms = document.getElementsByClassName('replyForm')
            for (let i=0;i<replyForms.length;i++) {
                replyForms[i].innerHTML = 'You must be logged in to reply'
            }
            commentForms = document.getElementsByClassName('commentFormTop')
            for (let i=0;i<commentForms.length;i++) {
                commentForms[i].innerHTML = 'You must be logged in to add a comment'
            }
        }
        // document.getElementById(`refComment${refs[i].refId}Modal`).innerHTML = ``

        //init bootstrap tooltips for ref uploader pfp
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    }
}


function displayCats(data) {
    //top cats
    //change to i<data.topCats.length
    for (let i=0;i<data.topCats.length;i++) {
        createTopCat(data.topCats[i])

        //sub cats
        for (let x=0;x<data.subCats[i].subCategories.length;x++) {
            createSubCat(data.subCats[i].subCategories[x],data.topCats[i])
        
            for (let y=0;y<data.subCats[i].finalLinks[x].links.length;y++) {
                displayFinalLinks(data.subCats[i].finalLinks[x].links[y],data.subCats[i].subCategories[x],data.topCats[i])
            }
        }
    }
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    })
    if ((params.search == null || params.search == 'false') && (params.underTopCat==null || params.underSubCat==null || params.refCategory==null))
        noRefMsg(1) //default, no search or cat
    else if (params.underTopCat != null && params.underSubCat != null && params.refCategory != null)
        getRefs()   //after category is selected
    else if (params.search == 'true') {
        //after search is entered
        document.getElementById('searchBar').value = params.search_query
        getRefs()
    }
    
}

async function getCats() {
    const response = await fetch(`${backendURL}/categories`)
    const catData = JSON.parse(await response.json())

    displayCats(catData)
}
getCats()


//handles logged in status
window.onload = () => {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

    if (accessToken) {
        document.getElementById('loggedOutProfile').style.display = 'none'
        document.getElementById('loggedInProfile').style.display = 'block'
        
        fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${tokenType} ${accessToken}`,
        },
        })
        .then(result => result.json())
        .then(response => {
            document.getElementById('loggedInPfp').src = `https://cdn.discordapp.com/avatars/${response.id}/${response.avatar}?size=1024`
        })
        .catch(console.error);
    }
    //handle notifications
    showNotifications()
};


(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        if (form.classList.contains('add-ref-form')&&form.checkValidity()) {
            //wtf why refresh
            event.preventDefault()
            addRef(form)
            event.preventDefault()
            return false;
        }
  
        form.classList.add('was-validated')
      },false)
    })
  })()

async function addRef(form) {
    //close modal
    const modalToClose = new bootstrap.Modal(`#addRefModal`, {})
    modalToClose.hide()

    //open upload status notification toast
    const toastTrigger = document.getElementById('liveToastBtn')
    const toastLiveExample = document.getElementById('liveToast')

    if (toastTrigger) {
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
    toastTrigger.addEventListener('click', () => {
        toastBootstrap.show()
    })
    }

    //get user id from discord
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

    const discordRes = await fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${tokenType} ${accessToken}`,
        },
    })
    const discordData = await discordRes.json()
    userId = discordData.id
    // userId = '693191740961718420'


    //img
    const formData = new FormData()
    formData.append(`image`,form.img.files[0])
    title = form.title.value,
    description = form.desc.value,
    category = form.refCategorySelect.value,
    categoryPath = form.refCategorySelect.options[refCategorySelect.selectedIndex].innerText,
    userId = userId

    const rawResponse = await fetch(`${backendURL}/new-ref?title=${title}&desc=${description}&cat=${category}&catPath=${categoryPath}&userId=${userId}`, {
        method: 'POST',
        headers: {
            cors: '*'
        },
        body: formData
        })
    const content = await rawResponse.json();
    
    if (await content.msg == 'ok') {
        url = new URL(window.location)
        url.searchParams.notifications = [
            {
                "notification":"Ref Uploaded!",
                "notificationStatus":"done",
                "notificationContent":""
            }
        ]
        window.location = url
    }   else
        url = new URL(window.location)
        url.searchParams.notifications = [
            {
                "notification":"Failed to upload ref.",
                "notificationStatus":"failed",
                "notificationContent":"Please make sure your image is less than 10MB."
            }
        ]
        window.location = url
    return false
}



function showFooter() {
    document.getElementById('footer').classList.add('show')
    document.getElementById('refs-container').style.paddingBottom = '20vh'
    document.getElementById('showFooterBtn').style.display = 'none'
    document.getElementById('hideFooterBtn').style.display = 'block'
    document.getElementById('side-bar-nav').style.paddingBottom = '25vh'
}

function hideFooter() {
    document.getElementById('footer').classList.remove('show')
    document.getElementById('refs-container').style.paddingBottom = '0vh'
    document.getElementById('showFooterBtn').style.display = 'block'
    document.getElementById('hideFooterBtn').style.display = 'none'
    document.getElementById('side-bar-nav').style.paddingBottom = '5vh'
}

function showModal(modal) {
    modal = modal.replace(/\s/g,'-')
    modal = modal.toLowerCase()

    $(`#${modal}Modal`).load(`modals/${modal}.html`,()=>{
        //open modal
        const modalToOpen = new bootstrap.Modal(`#${modal}Modal`, {})
        modalToOpen.show()
    })
}

document.getElementById('searchForm').addEventListener('submit',e=>{
    e.preventDefault()
    searchValue = document.getElementById('searchBar').value
    if (searchValue.replace(/\s/g,'') == '') {
        document.getElementById('searchBar').value = ''
        document.getElementById('searchBar').classList.add('border-danger')
        document.getElementById('searchAddon').classList.add('border-danger')
        setTimeout(()=>{
            document.getElementById('searchBar').classList.remove('border-danger')
            document.getElementById('searchAddon').classList.remove('border-danger')
        },750)
    }   else {
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        })
        if (searchValue == params.search_query) {
            window.location.reload()
        }   else {
            //fills ref container with default msg
            document.getElementById('refs-container').innerHTML = ''
            noRefMsg(2)

            //gets new refs by redirecting and passing queries
            url = new URL(window.location)
            url.searchParams.set('page',1)
            url.searchParams.set('search','true')
            url.searchParams.set('search_query',searchValue)
            url.searchParams.delete('underTopCat')
            url.searchParams.delete('underSubCat')
            url.searchParams.delete('refCategory')
            redirect(url)
        }
    }
})

function redirect(url) {
    if (window.location == url) {
        window.location.reload()
    }   else {
        window.location = url
    }
}



// comments
async function enterComment(type,refId,userId) {
    //checks if logged in
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];

    if (accessToken) {
        commentValue = document.getElementById(`${type}InputFor${refId}`).value
        if (commentValue != '') {
            //post comment to server
            const rawResponseCom = await fetch(`${backendURL}/add-comment?type=${type}&toRef=${refId}&comment=${commentValue}&userId=${userId}`, {
            method: 'POST',
            headers: {
                cors: '*'
            }
            })
            const contentCom = await rawResponseCom.json();
            if (contentCom.status == 'ok') {
                url = new URL(window.location)
                url.searchParams.notifications = [
                    {
                        "notification":"Comment Added!",
                        "notificationStatus":"done",
                        "notificationContent":""
                    }
                ]
                window.location = url
            }   else {
                url = new URL(window.location)
                url.searchParams.notifications = [
                    {
                        "notification":"Failed to add comment.",
                        "notificationStatus":"failed",
                        "notificationContent":contentCom.status
                    }
                ]
                window.location = url
            } 
        }
    }
    else {
        //not logged in err
        console.log("not logged in")
    }
}

async function incDownloadCount(refId) {
    await fetch(`${backendURL}/incDownloadCount?ref=${refId}`)
}

function showNotifications() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    })
    if (params.notifications == '' || params.notifications == null)
        return
    
    const notifications = JSON.parse(params.notifications)
    toastContainer = document.getElementById('toasts')
    for (let n=0;n<notifications.length;n++) {
        //sets border color
        if (notifications[n].notificationStatus == 'done')
            border = 'border-success'
        else if (notifications[n].notificationStatus == 'failed')
            border = 'border-danger'
        else 
            border = ''
        
        if (notifications[n].notificationContent == null || notifications[n].notificationContent == '') {
            body = ''
            headerBorder = 'rounded'
        }
        else {
            body = `<div class="toast-body">${notifications[n].notificationContent}</div>`
            headerBorder = ''
        }

        //appends new toast to contianer
        toastContainer.innerHTML += `
        <div id="toast${n}" class="toast ${border} show" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
            <div class="toast-header ${headerBorder}">
                <strong class="me-auto">${notifications[n].notification}</strong>
                <button onclick="afterNotiClosed()" type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            ${body}
        </div>
        `
    }
    //initialize toasts
    const toastElList = document.querySelectorAll('.toast')
    const toastList = [...toastElList].map(toastEl => new bootstrap.Toast(toastEl))
}

function afterNotiClosed() {
    const notis = document.getElementsByClassName('toast')
    hidden = document.getElementsByClassName('hide').length
    
    if (hidden == notis.length-1) {
        //if all other toasts are hidden do
        var url = new URL(window.location)
        url.searchParams.delete('notifications')
        window.location = url
    }
}
