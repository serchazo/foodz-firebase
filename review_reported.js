'use-strict';

exports.handler = function(userId,countryId,stateId,cityId,foodId,restoId,change,database){
  const userReviewsDB = database.ref('user-reviews');
  let dbPath = userId + '/' + countryId + '/' + stateId + '/' + cityId + '/' + foodId + '/' + restoId;
  let stringToWrite = 'Pending moderation';

  return userReviewsDB.child(dbPath).child('text').set(stringToWrite);
};
