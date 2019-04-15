class Stock {
    constructor (stockData) {
        this.quote = stockData.quote;
        this.logo = stockData.logo;
        this.profile = stockData.company;
        this.chart = { today: stockData.chart };
    };

    determinePositive () {
        this.marketPositive = Math.sign(this.quote.change) > -1 ? true : false;
    };

    getPositive () {
        return this.marketPositive;
    }
};

const stocks = {};

const runStockQuote = () => {
    // Store current symbol
    const $symbol = $('#symbol').val();

    const promise = $.ajax(
        {
            url: `https://api.iextrading.com/1.0/stock/${$symbol}/batch?types=quote,logo,company,chart&range=1d&chartInterval=10`
        }
    ).then(
        (data) => {
            // Store main container
            stocks[$symbol] = new Stock(data);
            const $main = $('main').empty();

            console.log(data);

            // Main Section with merket graph
            const $mainSection = $('<section>').addClass('main-tab').appendTo($main);
            $mainSection.append(`<h1>${stocks[$symbol].profile.symbol}</h1>`);
            $mainSection.append(`<h3>${data.company.companyName}</h3>`);
            const $graphContain = $('<div>').addClass('graph-container').appendTo($mainSection);
            $graphContain.append('<div class="graph-btn material-icons">arrow_back</div>');
            $graphContain.append('<div class="graph"><canvas id="graph"></canvas></div>');
            $graphContain.append('<div class="graph-btn material-icons">arrow_forward</div>');

            // Stock Stats Section
            $subSection1 = $('<section>').appendTo($main);
            $dlStockStats = $('<dl>').appendTo($subSection1);
            $dlStockStats.append(`<dt>Last Updated</dt><dd>${data.quote.latestTime}</dd>`);
            $dlStockStats.append(`<dt>Price</dt><dd>\$${data.quote.latestPrice}</dd>`);
            $dlStockStats.append(`<dt>Previous Close</dt><dd>${data.quote.previousClose}</dd>`);
            $dlStockStats.append(`<dt>52 Wk High</dt><dd>${data.quote.week52High}</dd>`);
            $dlStockStats.append(`<dt>52 Week Low</dt><dd>${data.quote.week52Low}</dd>`);
            $dlStockStats.append(`<dt>Change</dt><dd>${data.quote.change}</dd>`);
            data.changePercent = (data.quote.changePercent * 100).toFixed(2);
            $dlStockStats.append(`<dt>Change %</dt><dd>${data.changePercent}</dd>`);
            $dlStockStats.append(`<dt>Sector</dt><dd>${data.quote.sector}</dd>`);

            // Stock Profile Section
            $subSection2 = $('<section>').appendTo($main);
            $dlStockProfile = $('<dl>').appendTo($subSection2);
            $dlStockProfile.append(`<dt>Sector</dt><dd>${data.company.sector}</dd>`);
            $dlStockProfile.append(`<dt>Industry</dt><dd>${data.company.industry}</dd>`);
            $dlStockProfile.append(`<dt>Website</dt><dd>${data.company.website}</dd>`);
            $dlStockProfile.append(`<dt>Description</dt><dd>${data.company.description}</dd>`);

            // Chart Plots Arrays
            let chartLabels = [];
            let chartPlots = [];

            // Push Opening Plot
            chartLabels.push('Open');
            chartPlots.push(data.quote.open);

            // Chart individual plots
            data.chart.forEach((plot) => {
                // Skip over data without any useful information
                if (plot.marketClose != null) {
                    chartLabels.push(plot.label);
                    chartPlots.push(plot.marketClose);
                }
            });

            // Push Closing Plot
            chartLabels.push('Close');
            chartPlots.push(data.quote.close);

            // Chart Color
            const chartColor = stocks[$symbol].getPositive() === true ? '84, 138, 2' : '186, 56, 60';

            const graph = $('#graph');
            var dailyGraph = new Chart(graph, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: data.company.symbol,
                        data: chartPlots,
                        backgroundColor: [
                            `rgba(${chartColor}, 0.5)`
                        ],
                        borderColor: [
                            `rgb(${chartColor})`
                        ],
                        borderWidth: 1
                    }]
                },
            });
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
