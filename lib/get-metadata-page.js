'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const ujs = require('uglify-js');

/**
 * Returns array of the files content in the specified encoding.
 * @param {Array.<string>} filesPaths Files paths relative to the static directory.
 * @param {string} encoding
 * @returns {Array}
 */
function getFilesContent(filesPaths, encoding) {
	encoding = encoding || 'utf8';
	const filesContent = [];
	for (const filePath of filesPaths) {
		const fileContent = fs.readFileSync(path.join(__dirname, '../static', filePath), encoding);
		filesContent.push(fileContent);
	}
	return filesContent;
}

/**
 * Returns the html of the rendered metadata page.
 * @param options
 * @param options.isStatic {boolean} Indicates if the page should be static.
 * @param options.service {object} JSON-WS service instance.
 * @param options.root {string} Mount point of the service registry.
 * @returns {object} Promise
 */
function getMetadataPage(options) {

	return new Promise(function(resolve, reject) {
		// Find out list of proxy generators
		fs.readdir(__dirname + '/../proxies/', (err, files) => {
			if (err) {
				return reject(err);
			}

			const proxies = files.filter(f => f.endsWith('.ejs')).map(f => f.substr(0, f.length - 4));
			const images = ['event.png', 'type.png', 'snippet.png', 'method.png'];
			const jsFiles = ['prettify.js'];
			const cssFiles = ['prettify.css'];
			const templateData = {
				metadata: options.service,
				ejs,
				ujs,
				proxies,
				isStatic: options.isStatic,
				root: options.root,
				images: getFilesContent(images, 'base64'),
				js: getFilesContent(jsFiles),
				css: getFilesContent(cssFiles)
			};

			// Render the metadata template
			ejs.renderFile(
				__dirname + '/../templates/metadata.ejs',
				templateData,
				{_with: false}, (err, html) => {
					if (err) {
						return reject(err);
					}
					resolve(html);
				});
		});
	});
}

module.exports = getMetadataPage;