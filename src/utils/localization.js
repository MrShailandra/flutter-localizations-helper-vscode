const vscode = require('vscode');
const fs = require('fs');

function getTranslationKey(text) {
    // Generate a key from the selected text (you can customize this function to create keys)
    return text.toLowerCase().replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');
}

function isValidJson(jsonString) {
    try {
        JSON.parse(jsonString);
        return true;
    } catch (e) {
        return false;
    }
}

function checkForDuplicateKey(jsonContent, key) {
    return jsonContent.hasOwnProperty(key);
}


function updateLocalizationFile(filePath, key, value) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        json[key] = value;
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    } catch (error) {
        throw new Error(`Error updating localization file: ${error.message}`);
    }
}

module.exports = { getTranslationKey, isValidJson, checkForDuplicateKey, updateLocalizationFile };
