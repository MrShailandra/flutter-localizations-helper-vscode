# Flutter Localizations Helper

A Visual Studio Code extension to assist with Flutter localization by extracting keys from hardcoded strings, adding new languages, and managing localization files in a simple way.

## Features

- **Extract Translation Keys**:

  - Select a hardcoded string in your Flutter code, right-click, and extract the string into a translation key.
  - The selected string is automatically added to all selected language files, and the string is replaced with `"key"`.tr in your Flutter code.
- **Add New Language**:

  - Add new languages to your Flutter app's localization files with just a few clicks.
  - The extension generates new language files based on the existing ones, pre-filled with the same keys.
- **Duplicate Key Check**:

  - The extension automatically checks for duplicate keys in the localization files to avoid conflicts.
- **Supports Multiple Languages**:

  - Add or manage localization files for multiple languages (e.g., `en.json`, `fr.json`, `de.json`).
- **Error Handling**:

  - Validates JSON files to ensure they are properly formatted before making any changes.

## Installation

1. Open **Visual Studio Code**.
2. Go to the **Extensions** view by clicking on the Extensions icon in the Activity Bar on the side of the window.
3. Search for **"Flutter Localizations Helper"**.
4. Click **Install** to install the extension.

Alternatively, you can install it directly from the [VS Code Marketplace](https://marketplace.visualstudio.com/).

## Usage

### Extract Translation Keys

1. Open the Flutter file where you have a hardcoded string (e.g., `"Login to your Account"`).
2. Select the text you want to convert into a translation key.
3. Right-click on the selected text, and from the context menu, choose **Extract Translation Key**.
4. The extension will automatically generate a translation key (e.g., `"login_to_your_account".tr`) and update the selected text in the code.
5. The key-value pair will be added to the relevant language files in the `lib/translation/` folder.

### Add New Language

1. Open the Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux).
2. Type **Add New Language** and select the **Add New Language** command.
3. You will be prompted to enter a new language code (e.g., `fr`, `de`, `ja`).
4. The extension will automatically create the new language file (e.g., `fr.json`, `de.json`) in the `lib/translation/` directory, pre-filled with the same keys from existing language files.

### Localization Files Structure

The localization files are stored in the `lib/translation/` folder. The files should follow this naming pattern:

- `en.json`: English translations.
- `fr.json`: French translations (or any other language code you use).

The files are in **JSON format**, with translation keys and their respective values:

```json
{
  "login_to_your_account": "Login to your Account",
  "welcome_message": "Welcome to your app!"
}
```

## Error Handling

- **Invalid or Improperly Formatted JSON Files**: If a localization file is invalid or improperly formatted, the extension will prompt an error and will not make any changes to the file.
- **Duplicate Key Check**: If a key already exists in any of the language files, the extension will notify you and prevent adding the duplicate key to avoid conflicts.


## License

This extension is released under the [MIT License]().
