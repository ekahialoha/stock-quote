# stock-quote

Stock Quote tool and Market News application for GA Unit 1 Project.

## Technologies Used
StockQuote uses HTML, CSS, jQuery/Javascript. Additionally the libraries include: [Chart.js](https://www.chartjs.org/), [Google Fonts](https://fonts.google.com/), [Material Design Icons](https://material.io/tools/icons/?style=baseline).

## Description
On the main application screen will show Market News from remote [NewsAPI](https://newsapi.org/) and will also give general market sector performance and the functionality of searching individual stock details from [IEX API](https://iextrading.com/developer/).

## Approach Taken
My first step was to locate an API to get the individual stock information. I located IEX and after rigorously testing the API, I was satisfied with the results and knew what data I had to work with. My next step was to wireframe my design and pseudocode my application. I then dove into coding using all of the technologies and libraries previously mentioned. After getting my stock search working, I felt something was missing. I decided to use NewsAPI to get some market news to display the main page. I felt made my application complete.

## How to Use
Upon loading the main page, users will be given 15 different stock market/business related articles which include a brief overview and a link to the full article for further reading. Also on the main page, includes US sector performance. Towards to top of the page, you will find a search field where you are able to search for a specific stock symbol. Now the stock page will include 3 different graphs detailing the current day (or last trading day), weekly, and monthly performance of the designated stock. It will also include some company related information and other stock details such as 52 Weekly High and Low, price change, etc.

## Live Demo
https://projects.chriskelsom.com/stock-quote/
