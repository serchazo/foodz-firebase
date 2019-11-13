'user-strict';

exports.handler = function(userId,countryId,stateId,cityId,foodId,restoId,change,database){
  //const userReviewsDislikesNb = database.ref('user-reviews-dislikes-nb');
  const restoReviewsLikesNb = database.ref('resto-reviews-likes-nb');
  //const restoReviewsDislikesNb = database.ref('resto-reviews-dislikes-nb');

  // Get the position delta
  const likeFlag = change.after.val();
  //const userLikesDBPath = userId + '/' + countryId + '/' + stateId + '/' + cityId + '/' + foodId + '/' + restoId;
  const restoLikesDBPath = countryId + '/' + stateId + '/' + cityId + '/' + foodId + '/' + restoId +'/' + userId;

  // We add a like, except when the flag is null and we subtract a like
  var dislikesToAdd = 1;
  if (likeFlag == null){
    dislikesToAdd = -1;
  }

  // Use transactions to update the newValue
  // Use transaction - concurrent modifications possible
  return restoReviewsLikesNb.child(restoLikesDBPath).transaction(function(nbDislikes){
    if(nbDislikes == null){
      var nullValueToWrite = dislikesToAdd;
      if (dislikesToAdd<0){ nullValueToWrite = 0;}
      //console.log("Null execution, setting value to: "+ nullValueToWrite);
      return nullValueToWrite;
    }else{
      var newValue = (nbDislikes || 0) + dislikesToAdd;
      if (newValue<0) {newValue = 0;}
      //console.log("Updated value: "+newValue);
      return newValue;
    }
  });
};
