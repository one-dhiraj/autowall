const fs = require('fs');
const path = require('path');

// Path to your android/app/build.gradle file
const gradleFilePath = path.join(__dirname, 'android', 'app', 'build.gradle');

// Read the build.gradle file
let gradleFile = fs.readFileSync(gradleFilePath, 'utf8');

// Increment the versionCode
gradleFile = gradleFile.replace(/versionCode (\d+)/, (match, versionCode) => {
  const newVersionCode = parseInt(versionCode, 10) + 1;
  console.log(`Updated versionCode: ${versionCode} → ${newVersionCode}`);
  return `versionCode ${newVersionCode}`;
});

// Write the updated build.gradle file back
fs.writeFileSync(gradleFilePath, gradleFile, 'utf8');
console.log('Updated versionCode in build.gradle');