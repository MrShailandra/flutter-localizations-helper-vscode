const vscode = require('vscode');
const { getTranslationKey, updateLocalizationFile, isValidJson, checkForDuplicateKey } = require('../utils/localization');
const fs = require('fs');
const path = require('path');

function sanitizeSelectedText(selectedText) {
    // Trim whitespace
    let text = selectedText.trim();

    // Normalize mismatched or missing quotes
    if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
        text = text.slice(1, -1); // Remove surrounding quotes
    } else if (text.startsWith('"') || text.startsWith("'") || text.endsWith('"') || text.endsWith("'")) {
        text = text.replace(/^["']|["']$/g, ''); // Remove mismatched quotes
    }

    return text;
}

function registerExtractKeyCommand(context) {
    let disposable = vscode.commands.registerCommand('flutter-localizations-helper.extractKey', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found');
            return;
        }

        const selectedText = editor.document.getText(editor.selection).trim();
        if (!selectedText) {
            vscode.window.showInformationMessage('No text selected');
            return;
        }

        // Sanitize the selected text to handle all cases
        const sanitizedText = sanitizeSelectedText(selectedText);
        const key = getTranslationKey(sanitizedText);

        // Determine the default localization folder
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspacePath) {
            vscode.window.showErrorMessage('Workspace not found.');
            return;
        }

        const localizationDir = path.join(workspacePath, 'lib', 'translation');

        // Ensure the localization directory exists
        if (!fs.existsSync(localizationDir)) {
            fs.mkdirSync(localizationDir, { recursive: true });
        }

        // Check if language files exist in the localization directory
        const existingFiles = fs.readdirSync(localizationDir).filter(file => file.endsWith('.json'));

        let languages = [];
        if (existingFiles.length === 0) {
            // Ask user for languages if no files exist
            const input = await vscode.window.showInputBox({
                prompt: 'Enter languages (comma-separated, e.g., en,hi,es)',
                validateInput: text => text.trim() ? null : 'Please enter at least one language.',
            });

            if (!input) {
                vscode.window.showInformationMessage('No languages provided. Command aborted.');
                return;
            }

            languages = input.split(',').map(lang => lang.trim().toLowerCase());

            // Create JSON files for each language
            for (const lang of languages) {
                const filePath = path.join(localizationDir, `${lang}.json`);
                if (!fs.existsSync(filePath)) {
                    fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
                }
            }

            vscode.window.showInformationMessage(`Created localization files for: ${languages.join(', ')}`);
        } else {
            // Load languages from existing files
            languages = existingFiles.map(file => path.basename(file, '.json'));
        }

        // Check if the key already exists in any language file
        let keyExists = false;
        for (const lang of languages) {
            const filePath = path.join(localizationDir, `${lang}.json`);

            let jsonContent = {};
            try {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                jsonContent = JSON.parse(fileContent);

                // If the key exists, mark it and stop further processing
                if (jsonContent[key]) {
                    keyExists = true;
                    break;
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Error reading ${lang}.json: ${error.message}`);
                return;
            }
        }

        // If key exists, replace the hardcoded string with `.tr()`
        if (keyExists) {
            const newText = `"${key}".tr`;

            editor.edit(editBuilder => {
                editBuilder.replace(editor.selection, newText);
            });

            vscode.window.showInformationMessage(`Key "${key}" already exists.`);
        } else {
            // If key doesn't exist, add it to the localization files
            for (const lang of languages) {
                const filePath = path.join(localizationDir, `${lang}.json`);

                let jsonContent = {};
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    jsonContent = JSON.parse(fileContent);

                    if (checkForDuplicateKey(jsonContent, key)) {
                        vscode.window.showErrorMessage(`The key "${key}" already exists in ${lang}.json`);
                        return;
                    }
                } catch (error) {
                    vscode.window.showErrorMessage(`Error reading ${lang}.json: ${error.message}`);
                    return;
                }

                // Add the new key-value pair
                updateLocalizationFile(filePath, key, sanitizedText);
            }

            // Replace the string in the code with `"key".tr`
            const newText = `"${key}".tr`;
            editor.edit(editBuilder => {
                editBuilder.replace(editor.selection, newText);
            });

            vscode.window.showInformationMessage(`Key "${key}" added to all selected language files and code updated!`);
        }
    });

    context.subscriptions.push(disposable);
}

function addNewLanguageCommand(context) {
    let disposable = vscode.commands.registerCommand('flutter-localizations-helper.addNewLanguage', async () => {
        const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspacePath) {
            vscode.window.showErrorMessage('Workspace not found.');
            return;
        }

        const localizationDir = path.join(workspacePath, 'lib', 'translation');

        // Ensure the localization directory exists
        if (!fs.existsSync(localizationDir)) {
            fs.mkdirSync(localizationDir, { recursive: true });
        }

        // Get all existing JSON files in the translation folder
        const existingFiles = fs.readdirSync(localizationDir).filter(file => file.endsWith('.json'));

        if (existingFiles.length === 0) {
            vscode.window.showErrorMessage('No existing language files found to copy data from.');
            return;
        }

        // Get the content from the first existing language file (e.g., en.json)
        const firstLanguageFile = existingFiles[0];  // You can modify this to pick a specific language if needed
        const firstLanguageFilePath = path.join(localizationDir, firstLanguageFile);

        let existingData;
        try {
            const fileContent = fs.readFileSync(firstLanguageFilePath, 'utf-8');
            existingData = JSON.parse(fileContent);
        } catch (error) {
            vscode.window.showErrorMessage(`Error reading ${firstLanguageFile}: ${error.message}`);
            return;
        }

        // Ask the user for the new language
        const language = await vscode.window.showInputBox({
            prompt: 'Enter the new language code (e.g., fr, de, ja)',
            validateInput: text => text.trim() ? null : 'Please enter a valid language code.',
        });

        if (!language) {
            vscode.window.showInformationMessage('No language code provided. Command aborted.');
            return;
        }

        const languageFile = path.join(localizationDir, `${language.trim().toLowerCase()}.json`);

        // Check if the language file already exists
        if (fs.existsSync(languageFile)) {
            vscode.window.showInformationMessage(`The language file for "${language}" already exists.`);
            return;
        }

        // Copy the data from the existing language file into the new language file
        try {
            // Copy the existing data structure into the new language file
            fs.writeFileSync(languageFile, JSON.stringify(existingData, null, 2));
            vscode.window.showInformationMessage(`Successfully added new language: ${language}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error creating language file: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}



module.exports = { registerExtractKeyCommand, addNewLanguageCommand };
