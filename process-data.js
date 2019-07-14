const parseSDG = sdg => sdg.replace('SDG', '').split(' ')[0].replace(/(^")|("$)|(\?$)|(\.$)|(,$)|(:$)|( )/g, "").trim()


const parseCsv =  (collection, row) => {
    // console.log(row)
    if(!row.project) console.log(row)
    collection.projects.push(row.project);
    collection.intOrgs.push(...row.intOrgs.split('\n').filter(a => a));
    collection.natOrgs.push(...row.natOrgs.split('\n').filter(a => a));
    collection.natSdgs.push(...row.natSdgs.split('\n').map(parseSDG).filter(a => a && a != 'n/a'));
    return collection;
}

const sortSdgs = (a,b) => {
    var aint = +(a.split('.')[0])*10 + (Number.isInteger(+(a.split('.')[1])) ? +(a.split('.')[1]) : 0)
    var bint = +(b.split('.')[0])*10 + (Number.isInteger(+(b.split('.')[1])) ? +(b.split('.')[1]) : 0)
    var l = aint > bint ? 1 : bint > aint ? -1 : 0; 
    return l;
}

const sdgColors = ["", "#e5233d", "#dda73a", "#4ca146", "#c7212f", "#ee402d", "#28bfe6", "#fbc412", "#a31d44", "#f26a2e", "#df1a83", "#f89d2a", "#bf8d2c", "#407f46", "#1f97d4", "#59ba47", "#136a9f", "#14496b"]
var matrix, rows, uniq, full

const procc = (rows_) => {
    rows = rows_
    uniq = rows.reduce(parseCsv, { intOrgs: [], natOrgs: [], projects: [], natSdgs: [] })
    uniq = {
        intOrgs: [...new Set(uniq.intOrgs)].sort(),
        natOrgs: [...new Set(uniq.natOrgs)].sort(), 
        projects: [...new Set(uniq.projects)].sort(), 
        natSdgs: [...new Set(uniq.natSdgs)].sort(sortSdgs)
    };
    rows = rows.map(row => ({ 
        project: row.project, 
        intOrgs: row.intOrgs.split('\n').filter(a => a), 
        natOrgs: row.natOrgs.split('\n').filter(a => a), 
        natSdgs: row.natSdgs.split('\n').map(parseSDG).filter(a => a && a != 'n/a')
    }))
    drowForm()
}
