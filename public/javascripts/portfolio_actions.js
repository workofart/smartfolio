
function getAllPortfolios() {
    $.ajax({
        url: '/api/analysis/',
        type: 'GET',
        datatype: 'application/json'
    })
        .done(function(data){
            console.log(JSON.stringify(data));
        });
}

function getPortfolioById() {
    var id = $('#pIdParam').val();
    $.ajax({
        url: '/api/analysis/'+id,
        type: 'GET',
        datatype: 'application/json'
    })
        .done(function(data) {
            console.log(JSON.stringify(data));
        })
}


// auto fill the add to portfolio fields
function fillAddToPortfolioForm() {
    if (ticker[$("#searchBox").val()] != null){
        $('#tickerInput').val(ticker[$("#searchBox").val()].text);
        console.log('Found ticker: ' + ticker[$("#searchBox").val()].text);
    }
}

// Utility function
function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); }

// calculates the total dollar amount based on the latest price and quantity entered by user
function getTotalAmount() {
    var latestPrice = $('#latestPrice').text().substr(1);
    var quantity = $('#quantity').val();
    if (isNumber(quantity)) {
        var totalAmount = (Number(latestPrice) * Number(quantity)).toFixed(2);
        $('#totalAmount').text(totalAmount);
    }

}

function addPortfolio() {
    var pId = getPortfolioId();
    var ticker = $('#tickerInput').val();
    var quantity = $('#quantity').val();
    var amount = $('#totalAmount').text();
    console.log(amount);
    var jsonPortfolio = {
        "pName" : "BestPortfolio",
        "userId" : "100",
        "stock" : {
            "ticker" : ticker,
            "quantity" : quantity,
            "totalAmount" : amount
        }
    };
    var portStr = JSON.stringify(jsonPortfolio);
    console.log(portStr);
    $.ajax({
        url: '/api/analysis/' + pId,
        type: 'POST',
        datatype: 'application/json',
        data: jsonPortfolio
    });
}

function getPortfolioId() {
    return 1;
}
