class Stock {
    constructor (stockData) {
        this.quote = stockData.quote;
        this.logo = stockData.logo;
        this.profile = stockData.company;
        this.chart = { day: stockData.chart };
        this.determinePositive ();
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

            // Ensure working with an empty canvas
            const $main = $('main').empty();

            console.log(data);

            let chartData = null;

            const chartPromise = $.ajax(
                { url: `https://api.iextrading.com/1.0/stock/${$symbol}/chart/1m` }
            ).then((apiData) => {
                stocks[$symbol].chart.month = apiData;
                stocks[$symbol].chart.week = apiData.slice(apiData.length - 7);
            });

            // Main Section with market graph
            const $mainSection = $('<section>').addClass('main-tab').appendTo($main);
            $mainSection.append(`<div class="logo"><img src="${data.logo.url}" alt="${data.company.companyName}" /></div>`)
            $mainSection.append(`<h1>${stocks[$symbol].profile.symbol}</h1>`);
            $mainSection.append(`<h3>${data.company.companyName}</h3>`);

            // Graph Container
            const $graphContain = $('<div>').addClass('graph-container').appendTo($mainSection);


            // Build Graphs: Day, Week, Month
            let chartJs = null;

            const createGraph = (type) => {
                // Chart Plots Arrays
                let chartLabels = [];
                let chartPlots = [];

                let data = null;
                let currentChartName = null;
                let chartColor = null;

                switch (type) {
                    case 'week':
                        currentChartName = 'Week';
                        data = stocks[$symbol].chart.week;
                    break;

                    case 'month':
                        currentChartName = 'Month';
                        data = stocks[$symbol].chart.month;
                    break;

                    case 'day':
                    default:
                        currentChartName = 'Day';
                        data = stocks[$symbol].chart.day;
                    break;
                }
                console.log(data);

                if (type === 'day') {
                    // Push Opening Plot
                    chartLabels.push('Open');
                    chartPlots.push(stocks[$symbol].quote.open);
                }

                // Chart individual plots
                data.forEach((plot) => {
                    if (type !== 'day') {
                        // Chart individual plots
                        chartLabels.push(plot.date);
                        chartPlots.push(plot.close);

                        // Chart Color
                        const positive = Math.sign(chartPlots[0] - chartPlots[chartPlots.length-1]) > -1 ? false : true;
                        console.log(chartPlots[0] - chartPlots[chartPlots.length-1]);
                        console.log(Math.sign(chartPlots[0] - chartPlots[chartPlots.length-1]));
                        chartColor = positive === true ? '84, 138, 2' : '186, 56, 60';
                    } else {
                        // Skip over data without any useful information
                        const segmentClose = (plot.marketClose === null) ? plot.close : plot.marketClose;
                        if (segmentClose !== null) {
                            chartLabels.push(plot.label);
                            chartPlots.push(segmentClose);
                        }
                        chartColor = stocks[$symbol].getPositive() === true ? '84, 138, 2' : '186, 56, 60';
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
                            label: currentChartName,
                            data: chartPlots,
                            backgroundColor: `rgba(${chartColor}, 0.8)`,
                            borderColor: `rgb(${chartColor})`,
                            borderWidth: 1,
                        }]
                    },
                });
            };

            const dailyGraph = () => {

                // Chart Plots Arrays
                let chartLabels = [];
                let chartPlots = [];

                // Push Opening Plot
                chartLabels.push('Open');
                chartPlots.push(data.quote.open);

                // Chart individual plots
                data.chart.forEach((plot) => {
                    // Skip over data without any useful information
                    const segmentClose = (plot.marketClose === null) ? plot.close : plot.marketClose;
                    if (segmentClose !== null) {
                        chartLabels.push(plot.label);
                        chartPlots.push(segmentClose);
                    }
                });

                // Push Closing/Current Plot
                if (data.quote.latestSource === 'Close' || data.quote.latestSource === 'Previous close') {
                    chartLabels.push('Close');

                } else {
                    chartLabels.push('Most Recent');
                }
                chartPlots.push(data.quote.latestPrice);

                // Chart Color
                const chartColor = stocks[$symbol].getPositive() === true ? '84, 138, 2' : '186, 56, 60';
                chartJs = new Chart($('#graph'), {
                    type: 'line',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'Daily',
                            data: chartPlots,
                            backgroundColor: `rgba(${chartColor}, 0.8)`,
                            borderColor: `rgb(${chartColor})`,
                            borderWidth: 1,
                        }]
                    },
                });
            };
            const weekGraph = () => {
                console.log(stocks[$symbol].chart);
                // Chart Plots Arrays
                let chartLabels = [];
                let chartPlots = [];

                // Chart individual plots
                stocks[$symbol].chart.week.forEach((plot) => {
                    chartLabels.push(plot.date);
                    chartPlots.push(plot.close);
                });

                // Chart Color
                const positive = Math.sign(chartPlots[0] - chartPlots[chartPlots.length-1]) > -1 ? false : true;
                console.log(chartPlots[0] - chartPlots[chartPlots.length-1]);
                console.log(Math.sign(chartPlots[0] - chartPlots[chartPlots.length-1]));
                const chartColor = positive === true ? '84, 138, 2' : '186, 56, 60';
                chartJs = new Chart($('#graph'), {
                    type: 'line',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'Week',
                            data: chartPlots,
                            backgroundColor: [
                                `rgba(${chartColor}, 0.5)`
                            ],
                            borderColor: [
                                `rgb(${chartColor})`
                            ],
                            borderWidth: 1
                        }]
                    }
                });
            };
            const monthGraph = () => {
                console.log(stocks[$symbol].chart);
                // Chart Plots Arrays
                let chartLabels = [];
                let chartPlots = [];

                // Chart individual plots
                stocks[$symbol].chart.month.forEach((plot) => {
                    chartLabels.push(plot.date);
                    chartPlots.push(plot.close);
                });

                // Chart Color
                const positive = Math.sign(chartPlots[0] - chartPlots[chartPlots.length-1]) > -1 ? false : true;
                console.log(chartPlots[0] - chartPlots[chartPlots.length-1]);
                console.log(Math.sign(chartPlots[0] - chartPlots[chartPlots.length-1]));
                const chartColor = positive === true ? '84, 138, 2' : '186, 56, 60';
                chartJs = new Chart($('#graph'), {
                    type: 'line',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: 'Month',
                            data: chartPlots,
                            backgroundColor: [
                                `rgba(${chartColor}, 0.5)`
                            ],
                            borderColor: [
                                `rgb(${chartColor})`
                            ],
                            borderWidth: 1
                        }]
                    }
                });
            };

            // Register functions for carousel
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
            $dlStockStats.append(`<dt>Last Updated</dt><dd>${data.quote.latestTime}</dd>`);
            $dlStockStats.append(`<dt>Price</dt><dd>\$${data.quote.latestPrice}</dd>`);
            $dlStockStats.append(`<dt>Previous Close</dt><dd>${data.quote.previousClose}</dd>`);
            $dlStockStats.append(`<dt>52 Wk High</dt><dd>${data.quote.week52High}</dd>`);
            $dlStockStats.append(`<dt>52 Week Low</dt><dd>${data.quote.week52Low}</dd>`);
            const chngStyle = stocks[$symbol].getPositive() === true ? 'positive' : 'negative';
            $dlStockStats.append(`<dt>Change</dt><dd class="${chngStyle}">${data.quote.change}</dd>`);
            data.changePercent = (data.quote.changePercent * 100).toFixed(2);
            $dlStockStats.append(`<dt>Change %</dt><dd class="${chngStyle}">${data.changePercent}</dd>`);

            // Stock Profile Section
            $subSection2 = $('<section>').appendTo($asideColumn);
            $dlStockProfile = $('<dl>').appendTo($subSection2);
            $dlStockProfile.append(`<dt>Sector</dt><dd>${data.company.sector}</dd>`);
            $dlStockProfile.append(`<dt>Industry</dt><dd>${data.company.industry}</dd>`);
            $dlStockProfile.append(`<dt>Website</dt><dd>${data.company.website}</dd>`);
            $subSection2.append(`<div>${data.company.description}</div>`);

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
