const { plugin } = require('puppeteer-with-fingerprints');
// const fs = require('fs')
import path from 'node:path'
import fs from 'node:fs'
import { readFile, writeFile } from 'node:fs';
export const downloadFingerPrint = async (saveFolderPath: string, num = 10, startID =0, 
    tags=['Microsoft Windows', 'Chrome']) => {
    for(let i = 0; i < num; ++i) {
        let fingerprint = await plugin.fetch('', {
            tags: tags,
          });
        let fingerprintObj = JSON.parse(fingerprint)
        if(fingerprintObj.valid === false && fingerprintObj.message) {
            console.error('Download error');
            return;
        }
        let id = i + startID;
        let fppath = path.join(saveFolderPath, id.toString() + '.json')
        console.log('save file ' + fppath);
        await writeFile(fppath, fingerprint, (err) => { 
            if (err) 
              console.log(err); 
            else { 
              console.log("File written successfully\n"); 
            } 
          });
    }
};

export const get_fingerprint_with_id = async (id=0) => {
    return await readFile(path.join(__dirname, '../../database/fingerprint-canva/',  id.toString()+ '.json').toString(), (err) => {
        if (err) 
              console.log(err); 
            else { 
              console.log("File readFile successfully\n"); 
            } 
    })
}
export const get_fingerprint_with_id_sync = (id= 0) => {
    return fs.readFileSync(path.join(__dirname, '../../database/fingerprint-canva/',  id.toString()+ '.json').toString(),'utf8')
}