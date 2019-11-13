'use-strict';

exports.handler = function(userId,change,database){
  const userMultiplierRef = database.ref('user-pointsmultiplier');
  const nbFollowers = change.after.val();

  // Calculate the multiplier
  var multiplier = 10;
  if (nbFollowers < 10) { multiplier = 10;}
  else if (nbFollowers < 50)  {multiplier = nbFollowers; }
  else if (nbFollowers < 100) {multiplier = 50; }
  else if (nbFollowers < 200) {multiplier = 60; }
  else if (nbFollowers < 425) {multiplier = 70; }
  else if (nbFollowers < 850) {multiplier = 80; }
  else if (nbFollowers < 1550) {multiplier = 90; }
  else if (nbFollowers < 2600) {multiplier = 100; }
  else if (nbFollowers < 4075) {multiplier = 110; }
  else if (nbFollowers < 6050) {multiplier = 120; }
  else if (nbFollowers < 8600) {multiplier = 130; }
  else if (nbFollowers < 11800) {multiplier = 140; }
  else if (nbFollowers < 15725) {multiplier = 150; }
  else if (nbFollowers < 20450) {multiplier = 160; }
  else if (nbFollowers < 26050) {multiplier = 170; }
  else if (nbFollowers < 32600) {multiplier = 180; }
  else if (nbFollowers < 40175) {multiplier = 190; }
  else if (nbFollowers < 48850) {multiplier = 200; }
  else if (nbFollowers < 58700) {multiplier = 210; }
  else if (nbFollowers < 69800) {multiplier = 220; }
  else if (nbFollowers < 82225) {multiplier = 230; }
  else if (nbFollowers < 96050) {multiplier = 240; }
  else if (nbFollowers >= 96050) {multiplier = 250; }

  //Update the database
  return userMultiplierRef.child(userId).transaction(function(restoPoints){
      return multiplier;
  });
};
