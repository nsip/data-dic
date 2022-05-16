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
        const code = resp.status
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
    if (respChk.status == 200) {
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

    if (respNew.status == 200) {
        await (async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            window.location.replace(`http://localhost:3000/?entity=${entityName}`)
        })()
    }
}

// double click content
const OnEdit = async (span) => {

    const arr = span.id.split("#")
    const entity = arr[0]
    const cat = arr[1]
    const idx_subcat = arr[2]
    const subcat = arr[3]

    let flag = 3
    let prompt_msg = `Modify:    [${entity}] @${cat}.${idx_subcat}.${subcat}`
    if (subcat === undefined) {
        flag = 2
        prompt_msg = `Modify:    [${entity}] @${cat}.${idx_subcat}`
    }
    if (idx_subcat === undefined) {
        flag = 1
        prompt_msg = `Modify:    [${entity}] @${cat}`
    }

    console.log("flag:  ", flag)

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
    const respEntityPath = await fetch(
        `http://localhost:3000/api/entity-path/${entity}`, {
        method: 'GET',
        mode: 'cors',
    })
    const entityPaths = await respEntityPath.json()
    console.log("--- %o ---", entityPaths)

    let defParent = 'NULL'
    if (entityPaths.length > 0 && entityPaths[0].length > 1) {
        defParent = entityPaths[0][entityPaths[0].length - 2]
    }

    let value = null
    switch (flag) {
        case 3:
            value = entityObj[cat][idx_subcat][subcat]
            break

        case 2:
            if (cat == "Metadata") {
                if (idx_subcat == "DefaultParent") {
                    value = defParent
                } else {
                    value = entityObj[idx_subcat]
                }
            }
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

    // popup input box & modify entityObject
    let modified = null
    modified = prompt(prompt_msg, value)
    if (modified === null || modified === value) {
        return
    }

    // if original value is array, restore modified value back to array from string
    if (valType === 'array') {
        modified = modified.split('<br>')
    }

    switch (flag) {
        case 3:
            console.log('--- updating idx subcat ---')
            entityObj[cat][idx_subcat][subcat] = modified
            break

        case 2:
            console.log('--- updating subcat ---')
            if (cat == "Metadata") {
                if (idx_subcat != "DefaultParent") {
                    entityObj[idx_subcat] = modified
                }
            }
            break

        case 1:
            console.log('--- updating cat ---')
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