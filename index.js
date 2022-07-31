const PORT = process.env.PORT || 8000 // this is for deploying on heroku
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')
const app = express()

const websites = [
    {
        name: 'metoffice',
        address: 'https://www.metoffice.gov.uk/about-us/press-office/news/weather-and-climate/2022/key-climate-change-indicators-break-records-in-2021',
        base: 'https://www.metoffice.gov.uk'
    },
    {
        name: 'nasa',
        address: 'https://climate.nasa.gov',
        base: 'https://climate.nasa.gov'
    },
    {
        name: 'unitednations',
        address: 'https://www.un.org/en/climatechange',
        base: ''
    },
    {
        name: 'globalchange',
        address: 'https://www.globalchange.gov/',
        base: ''
    }
]

const articles = []

websites.forEach(website => {
    axios.get(website.address)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)

            $('a:contains("climate")', html).each(function () { 
                const title = $(this).text()
                const url = $(this).attr('href')

                articles.push({
                    title,
                    url: website.base + url,
                    source: website.name
                })
            })

        })
})

app.get('/', (req,res) => {
    res.json('Welcome to my Climate Change News API')
})

app.get('/news', (req,res) => {
    res.json(articles)
})

app.get('/news/:websiteId', (req, res) => {
    const websiteId = req.params.websiteId

    const websiteAddress = websites.filter(website => website.name == websiteId)[0].address
    const websiteBase = websites.filter(website => website.name == websiteId)[0].base
    
    axios.get(websiteAddress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificArticles = []

            $('a:contains("climate")', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')
                specificArticles.push({
                    title,
                    url: websiteBase + url,
                    source: websiteId
                })
            })
            res.json(specificArticles)
        }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log('server running on PORT ${PORT}'))
