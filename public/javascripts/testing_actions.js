
/**
 * Only for testing purposes
 * Buys/sells stocks for portfolio 2
 */
function performTransactionTest() {
    var tickers = ['AAPL', 'MSFT', 'FB'];
    for (var i = 0; i < 50; i++) {
        // Randomly decide between buy/sell
        if (Math.random() <= 0.5) {
            var url = '/api/transaction/sellStock/2';
        } else {
            var url = '/api/transaction/buyStock/2';
        }
        var data = {};
        data.ticker = tickers[Math.floor(Math.random() * 3)];
        data.quantity = Math.floor(Math.random() * 80) + 5;
        data.price = Math.floor(Math.random() * 100) + 21;
        console.log(data);

        $.ajax({
            url: url,
            type: 'POST',
            data: data,
            datatype: 'application/json'
        });
    }

}