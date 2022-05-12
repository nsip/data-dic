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

    let sv = $('#search-entity').val()

    if (!isNaN(sv)) {
        sv = String(sv).padStart(4, '0')
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
        const code = await resp.status
        if (code == 200) {
            form.submit()
            return
        }
    }

    alert(`Couldn't find ${sv}`)
}

// normal POST action
const new_entity = async () => {

    let entityName = prompt('Please entre new entity name:', '')
    if (entityName.length == 0) {
        return
    }

    // existing check
    const respChk = await fetch(
        `http://localhost:3000/api/entity/${entityName}`,
        {
            method: 'GET',
            mode: 'cors',
        }
    )
    const codeChk = await respChk.status
    if (codeChk == 200) {
        alert(`[${entityName}] is already existing`)
        return
    }

    // new an empty entity
    const newEntity = {
        Entity: entityName,
        Definition: "",
        SIF: [],
        OtherStandards: [],
        LegalDefinitions: [],
        Collections: [],
        Meta: "",
    }

    const respNew = await fetch(
        `http://localhost:3000/new`,
        {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEntity),
        }
    )

    const codeNew = await respNew.status
    if (codeNew == 200) {

        await (async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            window.location.replace(`http://localhost:3000/?entity=${entityName}`)
        })()

    }
}

// double click content
const OnEdit = (span) => {

    const arr = span.id.split("#")
    const entity = arr[0]
    const cat = arr[1]
    const idx = arr[2]
    const subcat = arr[3]

    let prompt_msg = 'Modify:    ' + entity + ' @' + cat + '.' + idx + '.' + subcat
    if (subcat === undefined) {
        prompt_msg = 'Modify:    ' + entity + ' @' + cat + '.' + idx
    }
    if (idx === undefined) {
        prompt_msg = 'Modify:    ' + entity + ' @' + cat
    }

    // load from db
    let value = ''
    // value = P[Entity]

    // popup input box
    let modified = prompt(prompt_msg, value)
    if (modified.length == 0) {
        return
    }

    // update db

}