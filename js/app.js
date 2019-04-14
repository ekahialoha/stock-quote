const runStockQuote = () => {

    const promise = $.ajax(
        // {
        //     url: 'https://www.alphavantage.co/query',
        //     data: {
        //         function: 'GLOBAL_QUOTE',
        //         symbol: 'MSFT',
        //         apikey: 'demo'
        //     }
        // }
        {
            url: `https://api.iextrading.com/1.0/stock/${$('#symbol').val()}/quote`
        }
    ).then(
        (data) => {
            console.log(data);
            const $main = $('main').empty();

            const $mainSection = $('<section>').addClass('main-tab').appendTo($main);
            $mainSection.append(`<h1>${data.symbol}</h1>`);
            $mainSection.append(`<h3>${data.companyName}</h3>`);
            $mainSection.append('<div class="graph-left-btn"></div>');
            $mainSection.append('<canvas id="graph"></canvas>');
            $mainSection.append('<div class="graph-right-btn"></div>');

            $subSection1 = $('<section>').appendTo($main);
            $dlSub1 = $('<dl>').appendTo($subSection1);
            $dlSub1.append(`<dt>Symbol</dt><dd>${data.symbol}</dd>`);
            $dlSub1.append(`<dt>Last Updated</dt><dd>${data.latestTime}</dd>`);
            $dlSub1.append(`<dt>Price</dt><dd>\$${data.latestPrice}</dd>`);

            $subSection2 = $('<section>').appendTo($main);
            $dlSub2 = $('<dl>').appendTo($subSection2);
            $dlSub2.append(`<dt>Previous Close</dt><dd>${data.previousClose}</dd>`);
            $dlSub2.append(`<dt>52 Wk High</dt><dd>${data.week52High}</dd>`);
            $dlSub2.append(`<dt>52 Week Low</dt><dd>${data.week52Low}</dd>`);
            console.log(Math.sign(data.change));
            $dlSub2.append(`<dt>Change</dt><dd>${data.change}</dd>`);
            data.changePercent = (data.changePercent *100).toFixed(2);
            $dlSub2.append(`<dt>Change %</dt><dd>${data.changePercent}</dd>`);
            $dlSub2.append(`<dt>Sector</dt><dd>${data.sector}</dd>`);
        },
        (err) => {
            console.log(err);
            // trigger error
        }
    );
    return false;
};

$(() => {

    $('form').on('submit', runStockQuote);
});
