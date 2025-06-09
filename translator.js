const fs = require('fs');
const path = require('path');
const {Translate} = require('@google-cloud/translate').v2;

// 如果已经 gcloud auth application-default login 过了，可以不用设 GOOGLE_APPLICATION_CREDENTIALS

const translate = new Translate();

const languages = {
  id: 'Indonesian',
  // bn: 'Bengali',
  ja: 'Japanese',
  ko: 'Korean',
  // es: 'Spanish',
  vi: 'Vietnamese',
  // // ar: 'Arabic',
  // fr: 'French',
  // ru: 'Russian',
  // de: 'German',
  // it: 'Italian',
  // tr: 'Turkish',
  // ta: 'Tamil',
  // ur: 'Urdu',
  // fa: 'Persian',
  // sw: 'Swahili',
  // mr: 'Marathi',
  // th: 'Thai',
  // gn: 'Guarani',
  // uk: 'Ukrainian',
  'zh-cn': 'SChinese',
  'zh-tw': 'TChinese',
};

const inputFile = 'en.json';

async function translateJSON(jsonObj, targetLang) {
  const translatedObj = {};
  
  for (const key in jsonObj) {
    try {
      if (typeof jsonObj[key] !== 'string') {
        translatedObj[key] = jsonObj[key];
        continue;
      }
      
      const [translation] = await translate.translate(jsonObj[key], targetLang);
      translatedObj[key] = translation;
      
    } catch (error) {
      console.error(`Error translating ${key}: ${error}`);
      translatedObj[key] = jsonObj[key];
    }
  }
  
  return translatedObj;
}

async function generateTranslations() {
  try {
    if (!fs.existsSync(inputFile)) {
      console.error(`Input file '${inputFile}' not found.`);
      return;
    }
    
    const jsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    console.log(`Successfully read ${inputFile}`);
    
    const outputDir = 'output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    for (const langCode in languages) {
      console.log(`Translating to ${languages[langCode]} (${langCode})...`);
      
      const translatedData = await translateJSON(jsonData, langCode);
      
      const outputFile = path.join(outputDir, `${langCode}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(translatedData, null, 2), 'utf8');
      
      console.log(`Translation to ${languages[langCode]} completed: ${outputFile}`);
    }
    
    console.log('\nAll translations completed!');
    
  } catch (error) {
    console.error('Error in translation process:', error);
  }
}

generateTranslations();
