var request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    urls = []

request('http://www.reddit.com', function (err, resp, body) {
    if(!err && resp.statusCode == 200) {
        var $ = cheerio.load(body);
        $('a.title', '#siteTable').each(function () {
            var url = $(this).attr('href');

            // Only scrapes imgur links
            if(url.indexOf('i.imgur.com') != -1) {
                urls.push(url);
            }
        });

        console.log(urls);

        // Save all the images to a folder
        var savedFiles = 0;
        var folderName = 'img/'
        var imgExt = '.jpg'
        for(var i = 0; i < urls.length; i++) {
            request(urls[i]).pipe(fs.createWriteStream(folderName + i + imgExt));
            savedFiles++;
        }

        console.log("Saved", savedFiles, "images to folder", folderName);
    }
})
