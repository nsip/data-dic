"use strict";

const scrollToTop = (eleID) => {
    $('#' + eleID)[0].scrollIntoView(true)
    $('#main')[0].scrollTop = 0
}

const scrollToBottom = (eleID) => {
    $('#' + eleID)[0].scrollIntoView(false)
    $('#main')[0].scrollTop = 0
}

// before real submitting, check background in advance 
const check_search_form = async (form) => {

    let sv = $('#search-entity').val().trim()

    if (!isNaN(sv)) {
        sv = String(sv).padStart(8, '0')
    }

    let api_list = [
        `http://localhost:3000/api/entity/${sv}`,
        `http://localhost:3000/api/identifier/${sv}`
    ]

    for (let api of api_list) {
        const resp = await fetch(
            api, {
            method: 'GET',
            mode: 'cors',
        }
        )
        const code = resp.status
        if (code == 200) {
            form.submit()
            return
        }
    }

    alert(`Couldn't find ${sv}`)
}

// normal POST action
// const new_entity = async () => {

//     let entityName = prompt('Please entre new entity name:', '')
//     if (entityName.length == 0) {
//         return
//     }

//     // existing check
//     const respChk = await fetch(
//         `http://localhost:3000/api/entity/${entityName}`,
//         {
//             method: 'GET',
//             mode: 'cors',
//         }
//     )
//     if (respChk.status == 200) {
//         alert(`[${entityName}] is already existing`)
//         return
//     }

//     // new an empty entity
//     const newEntity = {
//         Entity: entityName,
//         Definition: "",
//         SIF: [],
//         OtherStandards: [],
//         LegalDefinitions: [],
//         Collections: [],
//         Meta: "",
//     }

//     const respNew = await fetch(
//         `http://localhost:3000/new`,
//         {
//             method: 'POST',
//             mode: 'cors',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(newEntity),
//         }
//     )

//     if (respNew.status == 200) {
//         await (async () => {
//             await new Promise(resolve => setTimeout(resolve, 200));
//             window.location.replace(`http://localhost:3000/?entity=${entityName}`)
//         })()
//     }
// }

const Dialog = (prompt_msg, value) => {
    return new Promise(async (resolve, reject) => {
        let ready = false
        let ok = false

        $("#dialog-wrapper").prop('hidden', false)
        // $("#dialog-wrapper").prop('innerHTML', value) // get $("#dialog-wrapper").text() // div usage
        $("#dialog").val(value)                          // textarea usage
        $("#dialog-wrapper").dialog({
            // autoOpen: false,
            title: prompt_msg,
            resizable: true,
            width: 800,
            height: 300,
            modal: true,
            buttons: {
                OK: function () {
                    ready = true
                    ok = true
                    $(this).dialog("close")
                },
                Cancel: function () {
                    ready = true
                    ok = false
                    $(this).dialog("close")
                }
            }
        });

        await (async () => {
            while (!ready) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        })()

        if (ok) {
            resolve($("#dialog").val())
        } else {
            reject('canceled')
        }
    });
}

// double click content
const OnEdit = async (span) => {

    // id: 'Campus # Definition'
    // id: 'Campus # Metadata # Identifier'
    // id: 'Campus # SIF # 1 # XPath'

    const arr = span.id.split("#")
    let entity = arr[0]                 // 'Campus'
    let cat = arr[1]                    // 'SIF'
    let idx_subcat = ''                 // '1'
    let subcat = ''                     // 'XPath'

    let flag = arr.length - 1
    let prompt_msg = ''

    // console.log("flag:  ", flag)

    switch (flag) {
        case 3:
            idx_subcat = arr[2]
            subcat = arr[3]
            prompt_msg = `[${entity}] @${cat}.${idx_subcat}.${subcat}:`
            break
        case 2:
            idx_subcat = arr[2]
            prompt_msg = `[${entity}] @${cat}.${idx_subcat}:`
            break
        case 1:
            prompt_msg = `[${entity}] @${cat}:`
            break
        default:
            console.log('ERROR ID')
    }

    console.log("entity:  ", entity)
    console.log("cat:  ", cat)
    console.log("idx_subcat:  ", idx_subcat)
    console.log("subcat:  ", subcat)

    // load from db --- 'entity' collection
    const respEntity = await fetch(
        `http://localhost:3000/api/entity/${entity}`, {
        method: 'GET',
        mode: 'cors',
    })
    const entityObj = await respEntity.json()
    // console.log("%o", entityObj)

    // remove '_id' field
    delete entityObj._id

    // load from db --- 'class' collection
    // const respEntityPath = await fetch(
    //     `http://localhost:3000/api/entity-path/${entity}`, {
    //     method: 'GET',
    //     mode: 'cors',
    // })
    // const entityPaths = await respEntityPath.json()
    // console.log("%o", entityPaths)

    let value = null
    switch (flag) {
        case 3:
            value = entityObj[cat][idx_subcat][subcat]
            break
        case 2:
            value = entityObj[cat][idx_subcat]
            break
        case 1:
            value = entityObj[cat]
            break
    }

    // check value type: [string or array]
    let valType = 'string'
    if (Array.isArray(value)) {
        valType = 'array'
    }

    // if value is array, join with '<br>'
    if (valType === 'array') {
        value = value.join('<br>')
    }

    ////////////////////////////////////////////////////////////////////////////

    // popup input box & modify entityObject
    let modified = null

    // modified = prompt(prompt_msg, value) // -------------------------------------- INPUT 1
    // if (modified === null) {
    //     return
    // }

    try {
        modified = await Dialog(prompt_msg, value) // -------------------------------------- INPUT 2
    } catch (e) {
        console.log(e)
        return
    }
    // console.log("---:", modified)

    if (modified === value) {
        return
    }

    // if original value is array, restore modified value back to array from string
    if (valType === 'array') {
        modified = modified.split('<br>')
    }

    switch (flag) {
        case 3:
            entityObj[cat][idx_subcat][subcat] = modified
            break
        case 2:
            entityObj[cat][idx_subcat] = modified
            break
        case 1:
            entityObj[cat] = modified
            break
    }

    // update db
    const respUpdate = await fetch(
        `http://localhost:3000/new`,
        {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(entityObj),
        }
    )

    if (respUpdate.status == 200) {
        await (async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            window.location.replace(`http://localhost:3000/?entity=${entity}`)
        })()
    }
}