const sharp = require('sharp');
const path = require('path');

class Resize {
    constructor(folder) {
        this.folder = folder;
    }

    async save(buffer, filename) {
        const filepath = this.filepath(filename);
        await sharp(buffer)
            .resize(400, 400, {
                fit: sharp.fit.outside
            })
            .toFile(filepath);
        return filename;
    }

    filepath(filename) {
        return path.resolve(`${this.folder}/${filename}`)
    }
}

module.exports = Resize;
