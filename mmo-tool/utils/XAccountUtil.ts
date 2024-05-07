import fs from 'node:fs';
interface IAccInfo {
    username : string, 
    password: string,
    mail: string,
    passmail: string,
    linkprofile: string
}

export function convertXAccData (fileTxt:string, outFilePath:string, format = ["username", "password", "mail", "passmail", "linkprofile"]) {
    let rawData = fs.readFileSync(fileTxt, 'utf-8');
    if (rawData[rawData.length - 1] == '\n') {
        rawData = rawData.slice(0, -1);
    }
    const accountList = rawData.split('\n');
    accountList.shift();
    const outData = [];
    for (let i = 0; i < accountList.length; ++i) {
        let accInfo = accountList[i].split('|');
        let accObj: IAccInfo  = {
            username : '', 
            password: '',
            mail: '',
            passmail: '',
            linkprofile: ''
        }
        for (let j in accInfo) {
            accObj[format[j] as keyof IAccInfo] = accInfo[j];
        }
        outData.push(accObj);
    }
    fs.writeFileSync(outFilePath, JSON.stringify(outData));
}