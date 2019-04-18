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
        this.rawChart = {};
        this.chartLabels = {};
        this.chartPlots = {};
        this.chartColor = {};
        console.log(stockData.chart);
        this.setGraphData(stockData.chart, 'day');
        this.determinePositive ();
    };

    // Accepts data from API and stores for our uses
    setGraphData (graphData, graphLabel) {
        let chartColor = null;
        this.chartLabels[graphLabel] = [];
        this.chartPlots[graphLabel] = [];

        // Set raw data
        this.rawChart[graphLabel] = graphData;

        graphData.forEach((plot) => {
            if (graphLabel === 'day') {
                const segmentClose = (plot.marketClose === null) ? plot.close : plot.marketClose;
                if (segmentClose !== null) {
                    this.chartLabels[graphLabel].push(plot.label);
                    this.chartPlots[graphLabel].push(segmentClose);
                }
            } else {
                // Chart individual plots
                this.chartLabels[graphLabel].push(plot.date);
                this.chartPlots[graphLabel].push(plot.close);
            }
        });

        // Push Opening and closing plots
        if (graphLabel === 'day') {
            // Opening
            this.chartLabels[graphLabel].unshift('Open');
            this.chartPlots[graphLabel].unshift(this.quote.open);

            // Closing
            if (this.quote.latestSource === 'Close' || this.quote.latestSource === 'Previous close') {
                this.chartLabels[graphLabel].push('Close');

            } else {
                this.chartLabels[graphLabel].push('Most Recent');
            }
            this.chartPlots[graphLabel].push(this.quote.latestPrice);

            this.chartColor[graphLabel] = this.getIsPositive() === true ? '84, 138, 2' : '186, 56, 60';
        } else {
            const lastPlot = this.chartPlots[graphLabel].length-1;
            const positive = Math.sign(this.chartPlots[graphLabel][0] - this.chartPlots[graphLabel][lastPlot]) > -1 ? false : true;
            this.chartColor[graphLabel] = positive === true ? '84, 138, 2' : '186, 56, 60';
        }
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

    getPreviousClose () {
        return this.quote.previousClose;
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
        return this.quote.week52Low;
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
        // return this.chart[whichChart];
        return [this.chartLabels[whichChart], this.chartPlots[whichChart], this.chartColor[whichChart]];
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
                let chartName = null;
                let chartColor = null;

                switch (type) {
                    case 'week':
                        chartName = 'Week';
                        [chartLabels, chartPlots, chartColor] = currStock.getChartData('week');
                    break;

                    case 'month':
                        chartName = 'Month';
                        [chartLabels, chartPlots, chartColor] = currStock.getChartData('month');
                    break;

                    case 'day':
                    default:
                        chartName = 'Day';
                        [chartLabels, chartPlots, chartColor] = currStock.getChartData('day');
                    break;
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
                            borderWidth: 3,
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
            $dlStockStats.append(`<dt>Previous Close</dt><dd>${currStock.getPreviousClose()}</dd>`);
            const chngStyle = currStock.getIsPositive() === true ? 'positive' : 'negative';
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
