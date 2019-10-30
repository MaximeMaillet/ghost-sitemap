const path = require('path');
require('dotenv').config();
const builder = require('xmlbuilder');
const moment = require('moment');
const fs = require('fs');
const date = moment().format();
const GhostContentAPI = require("@tryghost/content-api");
const apiContent = new GhostContentAPI({
  url: process.env.GHOST_API_URL,
  key: process.env.GHOST_API_KEY,
  version: 'v2'
});

let urls = [];

async function loadPosts() {
    const response = await apiContent.posts.browse({});
    for(let i = 0; i<response.length; i++) {
        urls.push({url: `${process.env.GHOST_POSTS_URL}/${response[i].slug}`, priority: 0.9});
    }
}

async function loadTags() {
    const response = await apiContent.tags.browse({});
    for(let i = 0; i<response.length; i++) {
        urls.push({url: `${process.env.GHOST_TAGS_URL}/${response[i].slug}`, priority: 0.8, changefreq: 'monthly'});
    }
}

async function launch() {
    try {
        urls.push({url: process.env.GHOST_MAIN_URL, priority: 1, changefreq: 'monthly'});
        await loadPosts();
        await loadTags();
        urls = urls.map((item) => {
            return {
                loc: {'#text': item.url},
                lastmod: {'#text': date},
                changefreq: {'#text': item.changefreq || 'yearly'},
                priority: {'#text': item.priority || '0.5'}
            };
        })

        const obj = {
            urlset: {
                '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
                url: urls,
            }
        }; 

        var xml = builder.create(obj).end();
        fs.writeFile('public/sitemap.xml', xml, function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    } catch(e) {
        console.log(e);
    }
}

launch();