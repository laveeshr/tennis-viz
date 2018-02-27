/**
 * Created by laveeshrohra on 20/02/18.
 */

const callback = (country) => {
    const playerCard = $('#playerData');
    playerCard.show();
    document.querySelector('#playerData').scrollIntoView({
        behavior: 'smooth'
    });

    $('#countryName').html(country.properties.name);
    populatePlayerList(country.data);

    // console.log(country);
};

const populatePlayerList = (data) => {
    const playerList = $('#playerList');
    const playerListEl = $('#playerListEl');

    //Clear list
    playerList.empty();

    Object.keys(data).forEach(playerName => {
        let listEl = playerListEl.clone();
        listEl.show();
        listEl.removeAttr('id');
        listEl.find('.playerName').html(playerName);
        listEl.find('.playerWins').html(data[playerName].length);
        listEl.data('data', data[playerName]);
        playerList.append(listEl);
    });

    activatePlayer($('#playerList a:first-child'));
};

const activatePlayer = (el) => {
    $('#playerList a.active').removeClass('active');
    $(el).addClass('active');
    const playerName = $(el).find('.playerName').html();

    // $('#playerChart').html($(el).find('.playerName').html());
    initDivGraph('#playerChart', [playerName + " Avg", "Opponent[s] Avg"], parseData($(el).data('data')));

    // makeDivergingGraph('#playerChart', parseData($(el).data('data')), [playerName + " Avg", "Opponent[s] Avg"]);
};

const parseData = (data) => {
    let finalData = [];
    let attrs = ["ace", "avgFirstServe", "avgSecServe", "double", "error", "fastServe", "total", "winner"];
    let attrCount = {
        "ace1": 0,
        "ace2": 0,
        "avgFirstServe1": 0,
        "avgFirstServe2": 0,
        "avgSecServe1": 0,
        "avgSecServe2": 0,
        "double1": 0,
        "double2": 0,
        "error1": 0,
        "error2": 0,
        "fastServe1": 0,
        "fastServe2": 0,
        "total1": 0,
        "total2": 0,
        "winner1": 0,
        "winner2": 0
    };

    const cleanData = d => {
        if(d === "NULL" || d === "null"){
            return 0;
        }
        return +d;
    };

    data.forEach(d => {
        Object.keys(attrCount).forEach(attr => {
            attrCount[attr] += cleanData(d[attr]);
        });
    });

    Object.keys(attrCount).forEach(attr => {
        attrCount[attr] /= data.length;
    });

    attrs.forEach(attr => {
        if(attrCount[attr+"1"] === 0 && attrCount[attr+"2"] === 0){
            return;
        }
        let dataObj = {
            type: attr,
            1: attrCount[attr+"1"].toFixed(2),
            2: attrCount[attr+"2"].toFixed(2),
            N: (attrCount[attr+"1"] + attrCount[attr+"2"]).toFixed(2),
        };
        finalData.push(dataObj);
    });

    return finalData;
};