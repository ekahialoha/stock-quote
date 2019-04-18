// ==============================
// Stock Class, data passed from
// API calls to be parsed and
// manipulated as necessary to
// then display within the DOM.
// ==============================

class Stock {
    constructor (stockData) {
        this.quote = stockData.quote;
        this.logo = stockData.logo;
        this.profile = stockData.company;
        this.chart = { day: stockData.chart };
        this.determinePositive ();
    };

    // Accepts data from API and stores for our uses
    setGraphData (graphData, graphLabel = 'day') {
        this.chart[graphLabel] = graphData;
    };

    getLogo () {
        return this.logo.url;
    };

    getStockName () {
        return this.profile.companyName;
    };

    getSymbol () {
        return this.profile.symbol;
    };

    getLastUpdate () {
        return this.quote.latestTime;
    };

    getLatestPrice () {
        return this.quote.latestPrice;
    };

    getIsPositive () {
        return Math.sign(this.quote.change) > -1 ? true : false;
    };

    getChange () {
        return this.quote.change;
    };

    getPercentChange () {
        return (this.quote.changePercent * 100).toFixed(2);
    };

    get52WkHigh () {
        return this.quote.week52High;
    };

    get52WkLow () {
        return this.week52Low;
    };

    getSector () {
        return this.profile.sector;
    };

    getIndustry () {
        return this.profile.industry;
    };

    getWebsite () {
        return this.profile.website;
    }

    getDescription () {
        return this.profile.description;
    }

    getChartData (whichChart) {
        return this.chart[whichChart];
    };

    determinePositive () {
        this.marketPositive = Math.sign(this.quote.change) > -1 ? true : false;
    };

}

const stocks = {};

const runStockQuote = () => {
    event.preventDefault();
    // Store current symbol
    const $symbol = $('#symbol').val();

    if ($symbol.trim() === '') {
        return;
    }

    const stockPromise = $.ajax(
        { url: `https://api.iextrading.com/1.0/stock/${$symbol}/batch?types=quote,logo,company,chart&range=1d&chartInterval=10` }
    ).then((data) => {
            // Store main container
            stocks[$symbol] = new Stock(data);

            // Create reference to stock class
            const currStock = stocks[$symbol];

            // Ensure working with an empty canvas
            const $main = $('main').empty();

            // Grab other graph data
            const chartPromise = $.ajax(
                { url: `https://api.iextrading.com/1.0/stock/${$symbol}/chart/1m` }
            ).then((apiData) => {
                currStock.setGraphData(apiData, 'month');
                currStock.setGraphData(apiData.slice(apiData.length - 7), 'week')
            });

            // Main Section with market graph
            const $mainSection = $('<section>').addClass('main-tab').appendTo($main);
            $mainSection.append(`<div class="logo"><img src="${currStock.getLogo()}" alt="${currStock.getStockName()}" /></div>`)
            $mainSection.append(`<h1>${currStock.getSymbol()}</h1>`);
            $mainSection.append(`<h3>${currStock.getStockName()}</h3>`);

            // Graph Container
            const $graphContain = $('<div>').addClass('graph-container').appendTo($mainSection);

            // Build Graphs: Day, Week, Month
            let chartJs = null;

            const createGraph = (type) => {
                // Chart Plots Arrays
                let chartLabels = [];
                let chartPlots = [];

                // Create variables
                let chartData = null;
                let chartName = null;
                let chartColor = null;

                switch (type) {
                    case 'week':
                        chartName = 'Week';
                        chartData = currStock.getChartData('week');
                    break;

                    case 'month':
                        chartName = 'Month';
                        chartData = currStock.getChartData('month');
                    break;

                    case 'day':
                    default:
                        chartName = 'Day';
                        chartData = currStock.getChartData('day');
                    break;
                }

                if (type === 'day') {
                    // Push Opening Plot
                    chartLabels.push('Open');
                    chartPlots.push(stocks[$symbol].quote.open);
                }

                // Chart individual plots
                chartData.forEach((plot) => {
                    if (type !== 'day') {
                        // Chart individual plots
                        chartLabels.push(plot.date);
                        chartPlots.push(plot.close);

                        // Chart Color
                        const positive = Math.sign(chartPlots[0] - chartPlots[chartPlots.length-1]) > -1 ? false : true;
                        chartColor = positive === true ? '84, 138, 2' : '186, 56, 60';
                    } else {
                        // Skip over data without any useful information
                        const segmentClose = (plot.marketClose === null) ? plot.close : plot.marketClose;
                        if (segmentClose !== null) {
                            chartLabels.push(plot.label);
                            chartPlots.push(segmentClose);
                        }
                        chartColor = stocks[$symbol].getIsPositive() === true ? '84, 138, 2' : '186, 56, 60';
                    }
                });

                if (type === 'day') {
                    // Push Closing/Current Plot
                    if (stocks[$symbol].quote.latestSource === 'Close' || stocks[$symbol].quote.latestSource === 'Previous close') {
                        chartLabels.push('Close');

                    } else {
                        chartLabels.push('Most Recent');
                    }
                    chartPlots.push(stocks[$symbol].quote.latestPrice);
                }

                // Chart Color
                chartJs = new Chart($('#graph'), {
                    type: 'line',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: chartName,
                            data: chartPlots,
                            backgroundColor: `rgba(${chartColor}, 0.6)`,
                            borderColor: `rgb(${chartColor})`,
                            borderWidth: 4,
                        }]
                    },
                });
            };

            // Register graph options for carousel
            const graphs = ['day', 'week', 'month'];

            // Previous graph button
            $prevGraph = $('<div>').addClass('graph-btn material-icons').text('arrow_back').appendTo($graphContain);

            // Graph canvas
            $graphContain.append('<div class="graphs"><div class="canvas-container"><canvas id="graph"></canvas></div></div>');

            // Render first graph
            createGraph('day');

            // Next graph button
            $nextGraph = $('<div>').addClass('graph-btn material-icons').text('arrow_forward').appendTo($graphContain);

            // Graph carousel click handlers
            let currentGraph = 0;
            const lastGraph = graphs.length - 1;
            $prevGraph.on('click', () => {
                // Decrease current graph
                currentGraph = (currentGraph > 0) ? currentGraph - 1 : lastGraph;

                // Destory current graph
                chartJs.destroy();

                // Render graph
                createGraph(graphs[currentGraph]);
            });
            $nextGraph.on('click', () => {
                // Increase current graph
                currentGraph = (currentGraph < lastGraph) ? currentGraph + 1 : 0;

                // Destory current graph
                chartJs.destroy();

                // Render graph
                createGraph(graphs[currentGraph]);
            });

            // Stock Stats Section
            $asideColumn = $('<aside>').appendTo($main);
            $subSection1 = $('<section>').appendTo($asideColumn);
            $dlStockStats = $('<dl>').appendTo($subSection1);
            $dlStockStats.append(`<dt>Last Updated</dt><dd>${currStock.getLastUpdate()}</dd>`);
            $dlStockStats.append(`<dt>Price</dt><dd>\$${currStock.getLatestPrice()}</dd>`);
            $dlStockStats.append(`<dt>Previous Close</dt><dd>${data.quote.previousClose}</dd>`);
            const chngStyle = currStock.getIsPositive() === true ? 'positive' : 'negative';
            data.changePercent = (data.quote.changePercent * 100).toFixed(2);
            $dlStockStats.append(`<dt>Change</dt><dd><span class="${chngStyle}">${currStock.getChange()}</span> (<span class="${chngStyle}">${currStock.getPercentChange()}%</span>)</dd>`);
            $dlStockStats.append(`<dt>52 Wk High</dt><dd>${currStock.get52WkHigh()}</dd>`);
            $dlStockStats.append(`<dt>52 Week Low</dt><dd>${currStock.get52WkLow()}</dd>`);

            // Stock Profile Section
            $subSection2 = $('<section>').appendTo($asideColumn);
            $dlStockProfile = $('<dl>').appendTo($subSection2);
            $dlStockProfile.append(`<dt>Sector</dt><dd>${currStock.getSector()}</dd>`);
            $dlStockProfile.append(`<dt>Industry</dt><dd>${currStock.getIndustry()}</dd>`);
            $dlStockProfile.append(`<dt>Website</dt><dd>${currStock.getWebsite()}</dd>`);
            $subSection2.append(`<div>${currStock.getDescription()}</div>`);

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
    // console.log($($.parseXML('<test>Testing</test>')).text());
});
