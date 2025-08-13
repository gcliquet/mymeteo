const https = require('https');
const fs = require('fs');

// Configuration simple
const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = 'Plounévez-Moëdec';  // Changez votre ville ici
const COUNTRY = 'FR';      // Changez votre pays ici

// Fonction pour convertir les degrés en direction
function degreesToDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

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
                
                // Créer un enregistrement enrichi
                const record = {
                    date: new Date().toLocaleString('fr-FR'),
                    timestamp: new Date().toISOString(),
                    ville: weather.name,
                    pays: weather.sys.country,
                    
                    // Températures
                    temperature: Math.round(weather.main.temp * 10) / 10,
                    ressenti: Math.round(weather.main.feels_like * 10) / 10,
                    temp_min: Math.round(weather.main.temp_min * 10) / 10,
                    temp_max: Math.round(weather.main.temp_max * 10) / 10,
                    
                    // Conditions atmosphériques
                    humidite: weather.main.humidity,
                    pression: weather.main.pressure,
                    visibilite: weather.visibility || 0,
                    
                    // Vent
                    vent_vitesse: Math.round((weather.wind?.speed || 0) * 10) / 10,
                    vent_direction_deg: weather.wind?.deg || 0,
                    vent_direction: degreesToDirection(weather.wind?.deg || 0),
                    vent_rafales: Math.round((weather.wind?.gust || 0) * 10) / 10,
                    
                    // Nuages et météo
                    nuages: weather.clouds?.all || 0,
                    meteo_principale: weather.weather[0].main,
                    description: weather.weather[0].description,
                    icone: weather.weather[0].icon,
                    
                    // Pluie et neige (si présentes)
                    pluie_1h: weather.rain?.['1h'] || 0,
                    pluie_3h: weather.rain?.['3h'] || 0,
                    neige_1h: weather.snow?.['1h'] || 0,
                    neige_3h: weather.snow?.['3h'] || 0,
                    
                    // Soleil
                    lever_soleil: new Date(weather.sys.sunrise * 1000).toLocaleTimeString('fr-FR'),
                    coucher_soleil: new Date(weather.sys.sunset * 1000).toLocaleTimeString('fr-FR'),
                    
                    // Coordonnées
                    latitude: weather.coord.lat,
                    longitude: weather.coord.lon
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
                console.log(`   Vent: ${record.vent_vitesse} m/s ${record.vent_direction} (${record.vent_direction_deg}°)`);
                console.log(`   Humidité: ${record.humidite}%, Pression: ${record.pression} hPa`);
                console.log(`   Nuages: ${record.nuages}%, Visibilité: ${record.visibilite}m`);
                
            } catch (error) {
                console.error('❌ Erreur:', error.message);
            }
        });
        
    }).on('error', (error) => {
        console.error('❌ Erreur de connexion:', error.message);
    });
}

// Lancer la collecte
console.log('🌤️ Collecte des données météo enrichies...');
collectWeather();
