const vscode = require('vscode');
const { registerExtractKeyCommand, addNewLanguageCommand } = require('./commands/extractKey');

function activate(context) {
	registerExtractKeyCommand(context);
	addNewLanguageCommand(context);


}

function deactivate() { }

module.exports = {
	activate,
	deactivate
};
