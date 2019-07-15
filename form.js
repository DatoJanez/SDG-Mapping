const drowForm = () => {
    var form = document.getElementsByTagName('form')[0]

    intOrgsSel = document.createElement('select')
    natOrgsSel = document.createElement('select')
    projectsSel = document.createElement('select')
    natSdgsSel = document.createElement('select')

    intOrgsSel.setAttribute("multiple", "multiple")
    natOrgsSel.setAttribute("multiple", "multiple")
    projectsSel.setAttribute("multiple", "multiple")
    natSdgsSel.setAttribute("multiple", "multiple")
    
    form.appendChild(intOrgsSel)
    form.appendChild(natOrgsSel)
    form.appendChild(projectsSel)
    form.appendChild(natSdgsSel)

    uniq.intOrgs.forEach(str => {
        var option = document.createElement('option')    
        option.setAttribute("value",str)
        option.innerHTML = str
        intOrgsSel.appendChild(option)
    });

    uniq.natOrgs.forEach(str => {
        var option = document.createElement('option')    
        option.setAttribute("value",str)
        option.innerHTML = str
        natOrgsSel.appendChild(option)
    });

    uniq.projects.forEach(str => {
        var option = document.createElement('option')    
        option.setAttribute("value",str)
        option.innerHTML = str
        projectsSel.appendChild(option)
    });

    var group = 0, lastSdg
    uniq.natSdgs.forEach(str => {
        if(str.split('.')[0] != lastSdg){
            if(group){
                natSdgsSel.appendChild(group)        
            }
            group = document.createElement("optgroup")
            group.setAttribute('label', 'SDG' + str.split('.')[0])
            lastSdg = str.split('.')[0]
        }
        var option = document.createElement('option')    
        option.setAttribute("value",str)
        option.innerHTML = str
        group.appendChild(option)
    });
        
    natSdgsSel.appendChild(group)        

    $(natSdgsSel).multiselect({includeSelectAllOption: true, nonSelectedText: 'SDGs', enableFiltering: true , enableClickableOptGroups: true});
    $(projectsSel).multiselect({includeSelectAllOption: true, nonSelectedText: 'Projects', enableFiltering: true});
    $(natOrgsSel).multiselect({includeSelectAllOption: true, nonSelectedText: 'Local Organisations', enableFiltering: true});
    $(intOrgsSel).multiselect({includeSelectAllOption: true, nonSelectedText: 'International Organisations', enableFiltering: true});

    $(natSdgsSel).on('change', filter)
    $(projectsSel).on('change', filter)
    $(natOrgsSel).on('change', filter)
    $(intOrgsSel).on('change', filter)
    
}
var show
const filter = () => {
    if($(natSdgsSel).val() ||  $(projectsSel).val() || $(natOrgsSel).val() ||  $(intOrgsSel).val()) {
        document.getElementsByTagName('b2')[0].setAttribute('style', 'display:none;')
    } else {
        document.getElementsByTagName('b2')[0].setAttribute('style', '')
    }
    
    show = []
    if($(projectsSel).val()){
        show = show.concat($(projectsSel).val())
        $(projectsSel).val().forEach(pr => {
            row = rows.filter(row => row.project == pr)[0]
            show = show.concat(row.intOrgs).concat(row.natOrgs).concat(row.natSdgs)
        })
    }

    if($(natSdgsSel).val()){
        show = show.concat($(natSdgsSel).val())
        rows.forEach(row => {
            row.natSdgs.reduce((isIn, natSdg) => $(natSdgsSel).val().indexOf(natSdg) > -1 || isIn, false) 
                ? show.push(row.project) && (show = show.concat(row.natOrgs)) && (show = show.concat(row.intOrgs))
                : 0
        })
    }

    if($(natOrgsSel).val()){
        show = show.concat($(natOrgsSel).val())
        rows.forEach(row => {
            row.natOrgs.reduce((isIn, natOrg) => $(natOrgsSel).val().indexOf(natOrg) > -1 || isIn, false) 
                ? show.push(row.project) && (show = show.concat(row.natSdgs)) 
                : 0
        })
    }

    if($(intOrgsSel).val()){
        show = show.concat($(intOrgsSel).val())
        rows.forEach(row => {
            row.intOrgs.reduce((isIn, intOrg) => $(intOrgsSel).val().indexOf(intOrg) > -1 || isIn, false) 
                ? show.push(row.project) && (show = show.concat(row.natSdgs)) 
                : 0
        })
    }

    full = uniq.intOrgs.filter(s => show.indexOf(s) > -1).map(a => ({ type: 'intOrg', name: a, color: '#367993'}))
        .concat(uniq.natOrgs.filter(s => show.indexOf(s) > -1).map(a => ({ type: 'natOrg', name: a, color: '#cc4e48'})))
        .concat(uniq.projects.filter(s => show.indexOf(s) > -1).map(a => ({ type: 'project', name: a, color: '#33b7a9'})))
        .concat(uniq.natSdgs.filter(s => show.indexOf(s) > -1).map(a => ({ type: 'sdg', name: a, color: sdgColors[+(a.split('.')[0])]})))
    
    fullHash = uniq.intOrgs.filter(s => show.indexOf(s) > -1)
        .concat(uniq.natOrgs.filter(s => show.indexOf(s) > -1))
        .concat(uniq.projects.filter(s => show.indexOf(s) > -1))
        .concat(uniq.natSdgs.filter(s => show.indexOf(s) > -1))
    
    matrix = []
    for(var ddd = 0; ddd < full.length; ddd++){
        matrix.push(new Array(full.length).fill(0))
    }
    // console.log(uniq)
    rows.filter(s => show.indexOf(s.project) > -1).forEach(row => {
        let mainIntOrg = true
        row.intOrgs.forEach(intOrg_ => {
            if( show.indexOf(intOrg_) > -1){
                matrix[fullHash.indexOf(intOrg_)][fullHash.indexOf(row.project)] = mainIntOrg ? 1.001 : 1
                matrix[fullHash.indexOf(row.project)][fullHash.indexOf(intOrg_)] = mainIntOrg ? 1.001 : 1
            }
            mainIntOrg = false
        })
        row.natOrgs.filter(s => show.indexOf(s) > -1).forEach(natOrg_ => {
            matrix[fullHash.indexOf(natOrg_)][fullHash.indexOf(row.project)] = 1
            matrix[fullHash.indexOf(row.project)][fullHash.indexOf(natOrg_)] = 1
        })
        row.natSdgs.filter(s => show.indexOf(s) > -1).forEach(sdg_ => {
            matrix[fullHash.indexOf(sdg_)][fullHash.indexOf(row.project)] = 1
            matrix[fullHash.indexOf(row.project)][fullHash.indexOf(sdg_)] = 1
        })
    });
    
    d3.selectAll("svg").remove()
    setTimeout(() => draw(matrix), 200)
    
}
