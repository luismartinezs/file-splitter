const fs = require('fs-extra');
const path = require('path');

// Helper function to split the file content
function splitContent(content, tokensPerFile) {
  const regex = new RegExp(`[\\s\\S]{1,${tokensPerFile * 4}}`, 'g');
  return content.match(regex);
}

// Helper function to format timestamp
function formatTimestamp(date) {
  return date
    .toISOString()
    .replace(/[:T.]/g, '')
    .slice(0, -1);
}

// Helper function to clean up content
function cleanContent(content) {
  return content
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{2,}/g, '\n');
}

// Main function
async function main(filePath, numTokens = 4000) {
  const fullPath = path.resolve(filePath);
  const fileName = path.basename(fullPath, path.extname(fullPath));
  const timestamp = formatTimestamp(new Date());
  const outputDir = path.join(path.dirname(fullPath), `${fileName}-split`, timestamp);

  try {
    let content = await fs.readFile(fullPath, 'utf8');
    content = cleanContent(content);
    const chunks = splitContent(content, numTokens);

    await fs.ensureDir(outputDir);
    for (let i = 0; i < chunks.length; i++) {
      const outputFileName = `${fileName}-${i + 1}.txt`;
      const outputFile = path.join(outputDir, outputFileName);
      await fs.writeFile(outputFile, chunks[i]);
    }
    console.log(`Split file saved in ${outputDir}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Get arguments from the command line
const args = process.argv.slice(2);
const filePath = args[0];
const numTokens = args[1] ? parseInt(args[1], 10) : undefined;

if (filePath) {
  main(filePath, numTokens);
} else {
  console.error('Error: No file path provided');
}
