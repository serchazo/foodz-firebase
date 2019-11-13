'user-strict';

exports.handler = function(userId,countryId,stateId,cityId,foodId,restoId,change,database){
  const userReviewsLikesNb = database.ref('user-reviews-likes-nb');
  //const restoReviewsLikesNb = database.ref('resto-reviews-likes-nb');
  //const restoReviewsDislikesNb = database.ref('resto-reviews-dislikes-nb');

  // Get the position delta
  const likeFlag = change.after.val();
  const userLikesDBPath = userId + '/' + countryId + '/' + stateId + '/' + cityId + '/' + foodId + '/' + restoId;
  //const restoLikesDBPath = countryId + '/' + stateId + '/' + cityId + '/' + foodId + '/' + restoId +'/' + userId;

  // We add a like, except when the flag is null and we subtract a like
  var likesToAdd = 1;
  if (likeFlag == null){
    likesToAdd = -1;
  }

  // Use transactions to update the newValue
  // Use transaction - concurrent modifications possible
  return userReviewsLikesNb.child(userLikesDBPath).transaction(function(nbLikes){
    if(nbLikes == null){
      var nullValueToWrite = likesToAdd;
      if (likesToAdd<0){ nullValueToWrite = 0;}
      //console.log("Null execution, setting value to: "+ nullValueToWrite);
      return nullValueToWrite;
    }else{
      var newValue = (nbLikes || 0) + likesToAdd;
      if (newValue<0) {newValue = 0;}
      //console.log("Updated value: "+newValue);
      return newValue;
    }
  });
};
