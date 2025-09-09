function doGet(e) {
    if (!e || !e.parameter) {
        Logger.log('No parameters received.');
        return json({ error: 'Missing parameters' });
    }

    Logger.log('Parameters: ' + JSON.stringify(e.parameter));  // Log all parameters
    
    try {
        var type = (e && e.parameter && e.parameter.type) ? 
            String(e.parameter.type).toLowerCase() : 'fixtures';
        Logger.log('Type: ' + type);
        if (type === 'promotions') return getPromotions();
        return getFixtures();
    } catch (err) {
        Logger.log('Error: ' + String(err));
        return json({
            error: 'server', message: String(err)
        });
    }
}


function getFixtures() {
    try {
        var sheet = SpreadsheetApp.openById('1fQgIy0XOGejdrwyH-C2UPpm1qLJ3j3SYu2wS_hssYuA').getSheetByName('Sheet1');
        if (!sheet) {
            Logger.log('No sheet found for fixtures.');
            return json([]);
        }
        var values = sheet.getDataRange().getValues();
        Logger.log('Fixtures Values: ' + JSON.stringify(values));

        if (!values || values.length < 2) return json([]);
        var header = values[0];
        var idx = indexMap(header);
        var rows = values.slice(1);
        var data = [];
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var teams = safeCell(r, idx.teams);
            if (!teams) continue;
            data.push({
                teams: teams,
                date: safeCell(r, idx.date),
                time: safeCell(r, idx.time),
                sport: safeCell(r, idx.sport),
                imageUrl: safeCell(r, idx.image_url)
            });
        }

        Logger.log('Returning Fixtures Data: ' + JSON.stringify(data));
        return json(data);
    } catch (err) {
        Logger.log('Error in getFixtures: ' + String(err));
        return json({
            error: 'fixtures_failed', message: String(err)
        });
    }
}

function getPromotions() {
    try {
        var sheet = SpreadsheetApp.openById('1fQgIy0XOGejdrwyH-C2UPpm1qLJ3j3SYu2wS_hssYuA').getSheetByName('Sheet2');
        if (!sheet) {
            Logger.log('No sheet found for promotions.');
            return json([]);
        }
        var values = sheet.getDataRange().getValues();
        Logger.log('Promotions Values: ' + JSON.stringify(values));

        if (!values || values.length < 2) return json([]);
        var header = values[0];
        var idx = indexMap(header);
        var rows = values.slice(1);
        var data = [];
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var day = safeCell(r, idx.day);
            if (!day) continue;
            var specialsCell = safeCell(r, idx.specials);
            var specials = specialsCell ? specialsCell.split(/;|,/).map(function (s) {
                return s.trim();
            }).filter(function (s) { return s; }) : [];
            data.push({
                day: day,
                cocktail: {
                    name: safeCell(r, idx.cocktail_name),
                    promoPrice: safeCell(r, idx.cocktail_promo_price),
                    originalPrice: safeCell(r, idx.cocktail_original_price) || '',
                    description: safeCell(r, idx.cocktail_description)
                },
                dealOfTheDay: safeCell(r, idx.deal_of_the_day),
                musicGenre: safeCell(r, idx.music_genre),
                specials: specials,
                imageUrl: safeCell(r, idx.image_url),
                imageUrlRight: safeCell(r, idx.image_url_right)
            });
        }

        Logger.log('Returning Promotions Data: ' + JSON.stringify(data));
        return json(data);
    } catch (err) {
        Logger.log('Error in getPromotions: ' + String(err));
        return json({
            error: 'promotions_failed', message: String(err)
        });
    }
}

function json(obj) {
    Logger.log('Returning JSON: ' + JSON.stringify(obj)); // Log the response
    return ContentService.createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

function indexMap(header) {
    function norm(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, '_'); }
    var map = {};
    for (var i = 0; i < header.length; i++) {
        map[norm(header[i])] = i;
    }
    return {
        teams: map['teams'],
        date: map['date'],
        time: map['time'],
        sport: map['sport'],
        image_url: map['image_url'],
        day: map['day'],
        cocktail_name: map['cocktail_name'],
        cocktail_description: map['cocktail_description'],
        cocktail_promo_price: map['cocktail_promo_price'],
        cocktail_original_price: map['cocktail_original_price'],
        deal_of_the_day: map['deal_of_the_day'],
        music_genre: map['music_genre'],
        specials: map['specials'],
        image_url_right: map['image_url_right']
    };
}

function safeCell(row, idx) {
    if (typeof idx !== 'number') return '';
    var v = row[idx];
    return v == null ? '' : String(v);
}
