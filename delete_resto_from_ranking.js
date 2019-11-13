'user-strict';

exports.handler = function(userId,countryId,stateId,cityId,foodId,restoId,database){
  const updateObject = {};

  const restoDBPath = countryId + '/' + stateId + '/' + cityId + '/' + foodId + '/' + restoId +'/' + userId;

  updateObject['resto-reviews/'+restoDBPath]=null;
  updateObject['resto-reviews-likes/'+restoDBPath]=null;
  updateObject['resto-reviews-likes-nb/'+userId]=null;

  const userDBpath = userId + '/' + countryId + '/' + stateId + '/' + cityId + '/' + foodId + '/' + restoId ;

  updateObject['user-reviews-likes/'+userDBpath]=null;
  updateObject['user-reviews-likes-nb/'+userDBpath]=null;
  
  // The atomic commit
  return database.ref().update(updateObject);

};
