
function getAllPortfolios() {
    $.ajax({
        url: '/api/portfolio/',
        type: 'GET',
        datatype: 'application/json'
    })
        .done(function(data){
            console.log(JSON.stringify(data));
            for (var i = 0; i < data.length; i++) {
                var portfolio = data[i];

                // Create the panels based on the portfolios we have
                var htmlCode = '<div id="accordion" role="tablist" aria-multiselectable="true" class="panel-group"> <div class="panel panel-primary"> <div role="tab" id="headingOne" class="panel-heading"> <h4 class="panel-title"><a role="button" data-toggle="collapse" data-parent="#accordion" href="#portfolio_' +
                    portfolio.pId + '_Body" aria-expanded="false" aria-controls="portfolio_' +
                    portfolio.pId + '_Body">Portfolio ' +
                    portfolio.pId + '</a></h4> </div><div id="portfolio_' +
                    portfolio.pId + '_Body" role="tabpanel" aria-labelledby="headingOne" class="panel-collapse collapse in"> <div class="panel-body"> <div class="row"> <div class="col-md-6"> <div class="jumbotron"> <div class="container"> <div class="portfolio-breakdown-chart"></div></div></div></div><div class="col-md-6"> <div class="jumbotron"> <div class="container"> <div class="stock-daily-performance"></div></div></div></div></div><div class="jumbotron"> <div class="container"> <div id="portfolio-performance"></div></div></div></div></div></div></div>';
                // var parser = new DOMParser();
                // var doc = parser.parseFromString(htmlCode, "text/xml");
                $('#panelList').append(htmlCode);

                console.log('portfolio: ' + JSON.stringify(portfolio));
            }
            // return data;
        });
}

function getPortfolioById() {
    var id = $('#getPIdParam').val();
    $.ajax({
        url: '/api/portfolio/'+id,
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
        url: '/api/portfolio/' + pId,
        type: 'POST',
        datatype: 'application/json',
        data: jsonPortfolio
    });
}

function getPortfolioId() {
    var id;
    $.ajax({
        url: '/api/portfolio/pid/latestPid',
        type: 'GET',
        datatype: 'application/json'
    })
        .done(function (data) {
            id = JSON.stringify(data);
        })
    return id;
}

function deletePortfolioById() {
    var id = $('#deletePIdParam').val();
    $.ajax({
        url: '/api/portfolio/'+id,
        type: 'DELETE',
        datatype: 'application/json'
    })
        .done(function(data) {
            console.log(JSON.stringify(data));
        })
}

function displayAllPortfolios() {
    var portfolios = getAllPortfolios();
    console.log(portfolios);
    for (var portfolio in portfolios) {
        console.log('portfolio: ' + JSON.stringify(portfolio));
    }
}
