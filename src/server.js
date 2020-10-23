const express = require('express');
const csv = require('csv-parser')
const fs = require('fs')
const app = express();
const port = process.env.PORT || 8081;

// initializing view engine
app.set('view engine', 'ejs');

// configuring access to public directory
app.use(express.static('public'));

// parsing CSV files
const indiceParAnnée = {name: "noname", labels: new Set(), datasets:{}};
var npMoyen = 0;
var npMax = 0;
var nbCumuls = 0;
var npCumulé = 0;
fs.createReadStream('resources/IndiceParAnnée.csv')
    .pipe(csv())
    .on('data', (data) => {
        //console.log(data);
        indiceParAnnée.labels.add(data['Pays ']);
        if(!indiceParAnnée.datasets[data.annee]) indiceParAnnée.datasets[data.annee] = [];
        indiceParAnnée.datasets[data.annee].push(data['indice total']);
        npCumulé += parseFloat(data['indice total']);
        npMax = npMax < data['indice total'] ? data['indice total'] : npMax;
        nbCumuls++;
    })
    .on('end', () => {
        indiceParAnnée.labels = Array.from(indiceParAnnée.labels);
        npMoyen = npCumulé / nbCumuls;
});

const indiceParSexe = {};
var npMoyenHomme = 0;
var npMoyenFemme = 0;
var nbCumulsHomme = 0;
var npCumuléHomme = 0;
var nbCumulsFemme = 0;
var npCumuléFemme = 0;
fs.createReadStream('resources/IndiceParSexe.csv')
    .pipe(csv())
    .on('data', (data) => {
        //console.log(data);
        if(!indiceParSexe[data.annee]) indiceParSexe[data.annee] = {
            name: data.annee, labels: new Set(), datasets:{}
        }
        indiceParSexe[data.annee].labels.add(data['Pays ']);
        let datasetname = data.sexe;
        if(!indiceParSexe[data.annee].datasets[datasetname]) 
            indiceParSexe[data.annee].datasets[datasetname] = [];
        indiceParSexe[data.annee].datasets[datasetname].push(data['indice obesite']);
        if(data.sexe == "Hommes") {
            npCumuléHomme += parseFloat(data['indice obesite']);
            nbCumulsHomme++;
        } else if(data.sexe == "Femmes") {
            npCumuléFemme += parseFloat(data['indice obesite']);
            nbCumulsFemme++;
        }
    })
    .on('end', () => {
        Object.keys(indiceParSexe).forEach(key => {
            indiceParSexe[key].labels = Array.from(indiceParSexe[key].labels);
            console.log(nbCumulsHomme);
            console.log(npCumuléHomme);
            npMoyenHomme = npCumuléHomme / nbCumulsHomme;
            npMoyenFemme = npCumuléFemme / nbCumulsFemme;
        });
});

// "GET /": dynamic index page 
app.get('/', function(req, res) {
    const precision = 6;
    numbersArticles = [
        {
            title: "Niveau de prévalence moyen de l'obésité",
            number: parseFloat(npMoyen).toFixed(precision)
        },
        {
            title: "Niveau de prévalence maximum de l'obésité",
            number: parseFloat(npMax).toFixed(precision)
        },
        {
            title: "Niveau de prévalence moyen de l'obésité chez l'homme",
            number: parseFloat(npMoyenHomme).toFixed(precision)
        },
        {
            title: "Niveau de prévalence moyen de l'obésité chez la femme",
            number: parseFloat(npMoyenFemme).toFixed(precision)
        }
    ]
    chartArticles = [
        {
            title: "Indice d\'obésité en fonction du pays et de l'année",
            charts: [ indiceParAnnée ]
        },
        {
            title: "Indice d\'obésité en fonction du pays et du sexe",
            charts: Object.values(indiceParSexe)
        }
    ];
    res.render('index', {
        numbersArticles: numbersArticles,
        chartArticles: chartArticles
    });
});

// "GET /about": static about page 
app.get('/about', function(req, res) {
    res.sendFile(__dirname + "/../public/html/about.html");
});

app.listen(port, '0.0.0.0');
console.log(`Listening to port ${port}`);