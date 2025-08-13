const https = require('https');
const fs = require('fs');

// Configuration simple
const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = 'Maintenon';  // Changez votre ville ici
const COUNTRY = 'FR';      // Changez votre pays ici

// Fonction pour récupérer et sauvegarder les données météo
function collectWeather() {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&appid=${API_KEY}&units=metric&lang=fr`;
    
    https.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
            data += chunk;
        });
        
        response.on('end', () => {
            try {
                const weather = JSON.parse(data);
                
                // Créer un enregistrement simple
                const record = {
                    date: new Date().toLocaleString('fr-FR'),
                    ville: weather.name,
                    temperature: weather.main.temp,
                    ressenti: weather.main.feels_like,
                    humidite: weather.main.humidity,
                    description: weather.weather[0].description,
                    vent: weather.wind.speed
                };
                
                // Charger les données existantes
                let allData = [];
                if (fs.existsSync('meteo.json')) {
                    allData = JSON.parse(fs.readFileSync('meteo.json', 'utf8'));
                }
                
                // Ajouter la nouvelle donnée
                allData.push(record);
                
                // Sauvegarder
                fs.writeFileSync('meteo.json', JSON.stringify(allData, null, 2));
                
                console.log(`✅ ${record.date} - ${record.ville}: ${record.temperature}°C, ${record.description}`);
                
            } catch (error) {
                console.error('❌ Erreur:', error.message);
            }
        });
        
    }).on('error', (error) => {
        console.error('❌ Erreur de connexion:', error.message);
    });
}

// Lancer la collecte
console.log('🌤️ Collecte des données météo...');
collectWeather();