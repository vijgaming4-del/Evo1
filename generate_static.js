const fs = require('fs');
const path = require('path');

const apps = JSON.parse(fs.readFileSync('./public/data/apps.json', 'utf8'));

const template = fs.readFileSync('./app-detail.html', 'utf8');

if (!fs.existsSync('./apps')) {
    fs.mkdirSync('./apps');
}

apps.forEach(app => {
    let content = template;
    
    // Simple replacement for title and meta
    content = content.replace(/<title>.*<\/title>/, `<title>${app.name} - Download APK - Evomk</title>`);
    
    // We can't easily replace everything in the template without a proper parser or regex,
    // but the user wants "html page bana de har 1 app ka".
    // I will modify the template to be more "static friendly" first.
    
    fs.writeFileSync(`./apps/${app.id}.html`, content);
});

console.log(`Generated ${apps.length} app pages.`);
