'use strict'

export const validateEntity = (entity) => {
    for (let attr of ['Entity', 'Definition', 'SIF', 'OtherStandards', 'LegalDefinitions', 'Collections', 'Metadata']) {
        if (entity[attr] === undefined) {
            console.log(attr, `is not in ${entity}`)
            return false
        }
    }
    return true
}

console.log(
    validateEntity(
        {
            "Entity": 1,
            "Definition": 1,
            "SIF": 1,
            "OtherStandards": 1,
            "LegalDefinitions": 1,
            "Collections": 1,
            "Metadata": 1,
        }
    )
)